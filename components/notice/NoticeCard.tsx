'use client';

import { Notice, NoticeType } from '@/types/notice';

interface NoticeCardProps {
  notice: Notice;
  onMarkAsRead: (id: string) => void;
  onApprove?: (requestId: string, noticeType: NoticeType, noticeId: string) => void;
  onReject?: (requestId: string, noticeType: NoticeType, noticeId: string) => void;
  isProcessing?: boolean;
}

export default function NoticeCard({
  notice,
  onMarkAsRead,
  onApprove,
  onReject,
  isProcessing = false,
}: NoticeCardProps) {
  // link_urlからrequest_idを抽出（related_request_idの代わり）
  const extractRequestId = (linkUrl: string | undefined): string | undefined => {
    if (!linkUrl) return undefined;
    const match = linkUrl.match(/\/(role-change-requests|employee-action-requests)\/([a-f0-9-]+)/);
    return match ? match[2] : undefined;
  };

  const requestId = extractRequestId(notice.link_url);

  // 通知タイプに応じたスタイルとアイコン
  const getNoticeStyle = (type: NoticeType) => {
    switch (type) {
      case NoticeType.ROLE_CHANGE_APPROVED:
      case NoticeType.EMPLOYEE_ACTION_APPROVED:
        return {
          icon: '✓',
          color: 'green',
          bgColor: 'bg-green-900/30',
          borderColor: 'border-green-700/50',
          textColor: 'text-green-400',
        };
      case NoticeType.ROLE_CHANGE_REJECTED:
      case NoticeType.EMPLOYEE_ACTION_REJECTED:
        return {
          icon: '✗',
          color: 'red',
          bgColor: 'bg-red-900/30',
          borderColor: 'border-red-700/50',
          textColor: 'text-red-400',
        };
      case NoticeType.ROLE_CHANGE_PENDING:
      case NoticeType.EMPLOYEE_ACTION_PENDING:
        return {
          icon: '⏱',
          color: 'yellow',
          bgColor: 'bg-yellow-900/30',
          borderColor: 'border-yellow-700/50',
          textColor: 'text-yellow-400',
        };
      default:
        return {
          icon: 'ℹ',
          color: 'blue',
          bgColor: 'bg-blue-900/30',
          borderColor: 'border-blue-700/50',
          textColor: 'text-blue-400',
        };
    }
  };

  const noticeType = notice.type as NoticeType;
  const style = getNoticeStyle(noticeType);
  const isPendingNotice =
    noticeType === NoticeType.ROLE_CHANGE_PENDING ||
    noticeType === NoticeType.EMPLOYEE_ACTION_PENDING;

  return (
    <div
      className={`${style.bgColor} border ${style.borderColor} rounded-lg p-5 mb-4 ${
        notice.is_read ? 'opacity-60' : ''
      }`}
    >
      {/* ヘッダー部分 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <span className={`text-3xl ${style.textColor}`}>{style.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-white font-bold text-lg">{notice.title}</h4>
              {!notice.is_read && (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                  NEW
                </span>
              )}
            </div>
            {/* 通知タイプラベル */}
            <div className="mb-2">
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${style.textColor} bg-gray-800/50`}>
                {isPendingNotice
                  ? noticeType === NoticeType.ROLE_CHANGE_PENDING
                    ? '権限変更リクエスト'
                    : '一般社員の作成、編集、削除リクエスト'
                  : noticeType === NoticeType.ROLE_CHANGE_APPROVED ||
                    noticeType === NoticeType.ROLE_CHANGE_REJECTED
                  ? '権限変更通知'
                  : '一般社員の作成、編集、削除に関する通知'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 通知内容 */}
      <div className="mb-4 pl-11">
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {notice.content}
          </p>
        </div>
        <p className="text-gray-500 text-xs mt-3">
          {new Date(notice.created_at).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3 flex-wrap pl-11">
        {/* 承認/却下ボタン（承認待ちの通知のみ） */}
        {isPendingNotice && requestId && onApprove && onReject && (
          <div className="flex gap-3 w-full">
            <div className="flex-1 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 mb-3">
              <p className="text-yellow-400 text-xs font-semibold mb-2">⚠️ 承認待ち</p>
              <p className="text-gray-400 text-xs mb-3">
                このリクエストを承認または却下してください
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove(requestId!, noticeType, notice.id)}
                  disabled={isProcessing}
                  className="flex-1 bg-[#2ecc71] hover:bg-[#27ae60] text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      処理中...
                    </>
                  ) : (
                    '✓ 承認する'
                  )}
                </button>
                <button
                  onClick={() => onReject(requestId!, noticeType, notice.id)}
                  disabled={isProcessing}
                  className="flex-1 bg-transparent border-2 border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c20] px-4 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-[#e74c3c] border-t-transparent rounded-full animate-spin"></span>
                      処理中...
                    </>
                  ) : (
                    '✗ 却下する'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 既読ボタン */}
        {!notice.is_read && (
          <button
            onClick={() => onMarkAsRead(notice.id)}
            className="bg-gray-700/50 hover:bg-gray-600/70 text-gray-300 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            既読にする
          </button>
        )}
      </div>
    </div>
  );
}
