'use client';

import { Notice, NoticeType } from '@/types/notice';
import { roleChangeRequestsApi } from '@/lib/api/roleChangeRequests';
import { employeeActionRequestsApi } from '@/lib/api/employeeActionRequests';
import { toast } from '@/lib/toast-debug';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NoticeDetailProps {
  notice: Notice;
  onUpdate?: () => void;
}

export default function NoticeDetail({ notice, onUpdate }: NoticeDetailProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // link_urlからrequest_idを抽出
  const extractRequestId = (linkUrl: string | undefined): string | undefined => {
    if (!linkUrl) return undefined;
    const match = linkUrl.match(/\/(role-change-requests|employee-action-requests|approval-requests)\/([a-f0-9-]+)/);
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
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-700/50',
          textColor: 'text-green-700 dark:text-green-400',
          badgeColor: 'bg-green-600',
        };
      case NoticeType.ROLE_CHANGE_REJECTED:
      case NoticeType.EMPLOYEE_ACTION_REJECTED:
        return {
          icon: '✗',
          color: 'red',
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-700/50',
          textColor: 'text-red-700 dark:text-red-400',
          badgeColor: 'bg-red-600',
        };
      case NoticeType.ROLE_CHANGE_PENDING:
      case NoticeType.EMPLOYEE_ACTION_PENDING:
        return {
          icon: '⏱',
          color: 'yellow',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-700/50',
          textColor: 'text-yellow-700 dark:text-yellow-400',
          badgeColor: 'bg-yellow-600',
        };
      case NoticeType.ROLE_CHANGE_REQUEST_SENT:
      case NoticeType.EMPLOYEE_ACTION_REQUEST_SENT:
        return {
          icon: '📤',
          color: 'blue',
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-700/50',
          textColor: 'text-blue-700 dark:text-blue-400',
          badgeColor: 'bg-blue-600',
        };
      default:
        return {
          icon: 'ℹ',
          color: 'blue',
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-700/50',
          textColor: 'text-blue-700 dark:text-blue-400',
          badgeColor: 'bg-blue-600',
        };
    }
  };

  const noticeType = notice.type as NoticeType;
  const style = getNoticeStyle(noticeType);

  // 承認/却下ボタンを表示するのは承認者向けのpending通知のみ
  const isPendingNotice =
    noticeType === NoticeType.ROLE_CHANGE_PENDING ||
    noticeType === NoticeType.EMPLOYEE_ACTION_PENDING;

  // 送信者向けの通知かどうか
  const isRequesterNotice =
    noticeType === NoticeType.ROLE_CHANGE_REQUEST_SENT ||
    noticeType === NoticeType.EMPLOYEE_ACTION_REQUEST_SENT;

  // 通知タイプのラベル
  const getNoticeLabel = () => {
    if (isPendingNotice) {
      return noticeType === NoticeType.ROLE_CHANGE_PENDING
        ? '権限変更申請'
        : '利用者情報の操作申請';
    }
    if (isRequesterNotice) {
      return noticeType === NoticeType.ROLE_CHANGE_REQUEST_SENT
        ? '権限変更申請送信済み'
        : '利用者情報の操作申請送信済み';
    }
    return noticeType === NoticeType.ROLE_CHANGE_APPROVED ||
      noticeType === NoticeType.ROLE_CHANGE_REJECTED
      ? '権限変更通知'
      : '利用者情報の操作に関する通知';
  };

  // 承認処理
  const handleApprove = async () => {
    if (!requestId) return;

    setIsProcessing(true);
    try {
      if (noticeType === NoticeType.ROLE_CHANGE_PENDING) {
        await roleChangeRequestsApi.approveRequest(requestId);
        toast.success('権限変更申請を承認しました');
      } else if (noticeType === NoticeType.EMPLOYEE_ACTION_PENDING) {
        await employeeActionRequestsApi.approveRequest(requestId);
        toast.success('利用者情報の操作申請を承認しました');
      }
      if (onUpdate) {
        onUpdate();
      }
      router.push('/notice');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || '承認処理に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // 却下処理
  const handleReject = async () => {
    if (!requestId) return;

    setIsProcessing(true);
    try {
      if (noticeType === NoticeType.ROLE_CHANGE_PENDING) {
        await roleChangeRequestsApi.rejectRequest(requestId);
        toast.success('権限変更申請を却下しました');
      } else if (noticeType === NoticeType.EMPLOYEE_ACTION_PENDING) {
        await employeeActionRequestsApi.rejectRequest(requestId);
        toast.success('利用者情報の操作申請を却下しました');
      }
      if (onUpdate) {
        onUpdate();
      }
      router.push('/notice');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || '却下処理に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-slate-600 hover:text-slate-900 mb-4 flex items-center gap-2 text-lg font-semibold dark:text-gray-400 dark:hover:text-white"
        >
          ← 通知一覧に戻る
        </button>
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-4xl ${style.textColor}`}>{style.icon}</span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{notice.title}</h1>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <span
            className={`inline-block px-4 py-2 rounded-full text-base font-bold text-white ${style.badgeColor}`}
          >
            {getNoticeLabel()}
          </span>
          {notice.is_read && (
            <span className="inline-block px-4 py-2 rounded-full text-base font-bold bg-slate-100 text-slate-700 dark:bg-gray-600 dark:text-gray-300">
              既読
            </span>
          )}
        </div>
      </div>

      {/* 通知の詳細カード */}
      <div
        className={`${style.bgColor} border ${style.borderColor} rounded-lg p-8 mb-6`}
      >
        {/* 通知内容 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">通知内容</h2>
          <div className="bg-white/70 dark:bg-gray-800/50 rounded-lg p-6 border border-slate-200 dark:border-gray-700/50">
            <p className="text-slate-700 dark:text-gray-200 text-lg font-semibold leading-relaxed whitespace-pre-wrap">
              {notice.content}
            </p>
          </div>
        </div>

        {/* メタ情報 */}
        <div className="border-t border-slate-200 dark:border-gray-700/50 pt-6">
          <div className="grid grid-cols-2 gap-4 text-base font-semibold">
            <div>
              <span className="text-slate-600 dark:text-gray-400">通知日時</span>
              <p className="text-slate-700 dark:text-gray-200 mt-1 text-lg font-bold">
                {new Date(notice.created_at).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {notice.updated_at && notice.updated_at !== notice.created_at && (
              <div>
                <span className="text-slate-600 dark:text-gray-400">更新日時</span>
                <p className="text-slate-700 dark:text-gray-200 mt-1 text-lg font-bold">
                  {new Date(notice.updated_at).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 承認/却下アクション（承認待ちの通知のみ） */}
        {isPendingNotice && requestId && (
          <div className="mt-6 border-t border-slate-200 dark:border-gray-700/50 pt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 dark:bg-yellow-900/20 dark:border-yellow-700/50">
              <p className="text-yellow-700 text-lg font-bold mb-2 flex items-center gap-2 dark:text-yellow-400">
                <span className="text-xl">⚠️</span>
                承認待ち
              </p>
              <p className="text-slate-700 dark:text-gray-300 text-lg font-semibold mb-4">
                この申請を承認または却下してください
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 bg-[#2ecc71] hover:bg-[#27ae60] text-white px-6 py-4 rounded-lg text-lg font-bold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      処理中...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">✓</span>
                      承認する
                    </>
                  )}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1 bg-transparent border-2 border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c20] px-6 py-4 rounded-lg text-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="inline-block w-5 h-5 border-2 border-[#e74c3c] border-t-transparent rounded-full animate-spin"></span>
                      処理中...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">✗</span>
                      却下する
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
