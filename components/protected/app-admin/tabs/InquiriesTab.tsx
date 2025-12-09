'use client';

import { useState, useEffect, useCallback } from 'react';
import { appAdminApi, InquiryResponse } from '@/lib/api/appAdmin';
import { FaSync, FaEye, FaEnvelopeOpen, FaEnvelope, FaReply } from 'react-icons/fa';
import InquiryReplyModal from '../InquiryReplyModal';

export default function InquiriesTab() {
  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'new' | 'open' | 'in_progress' | 'answered' | 'closed' | 'spam' | ''>('');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryResponse | null>(null);
  const [replyInquiry, setReplyInquiry] = useState<InquiryResponse | null>(null);

  const ITEMS_PER_PAGE = 30;

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await appAdminApi.getInquiries({
        status: statusFilter || undefined,
        skip: currentPage * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      });
      setInquiries(response.inquiries);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '問い合わせの取得に失敗しました';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">新規</span>;
      case 'open':
        return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">対応中</span>;
      case 'in_progress':
        return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">担当割当済み</span>;
      case 'answered':
        return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">回答済み</span>;
      case 'closed':
        return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs">クローズ</span>;
      case 'spam':
        return <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">スパム</span>;
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">問い合わせ</h2>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setCurrentPage(0);
            }}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="">すべて</option>
            <option value="new">新規</option>
            <option value="open">対応中</option>
            <option value="in_progress">担当割当済み</option>
            <option value="answered">回答済み</option>
            <option value="closed">クローズ</option>
            <option value="spam">スパム</option>
          </select>
          <button
            onClick={fetchInquiries}
            disabled={isLoading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaSync className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">読み込み中...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">問い合わせがありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="p-4 hover:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {inquiry.status === 'new' ? (
                        <FaEnvelope className="w-4 h-4 text-red-400" />
                      ) : (
                        <FaEnvelopeOpen className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-medium text-white">{inquiry.title}</span>
                      {getStatusBadge(inquiry.status)}
                    </div>
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2">{inquiry.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                      <span>送信者: {inquiry.sender_name || '未設定'}</span>
                      {inquiry.sender_email && <span>{inquiry.sender_email}</span>}
                      <span>{formatDate(inquiry.created_at)}</span>
                    </div>
                    {inquiry.assigned_staff && (
                      <div className="text-xs text-gray-400 mb-2">
                        <span>担当者: {inquiry.assigned_staff.last_name} {inquiry.assigned_staff.first_name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setReplyInquiry(inquiry)}
                      className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                      title="返信する"
                    >
                      <FaReply className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                      title="詳細を見る"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-gray-400 text-sm">
            全 {total} 件中 {currentPage * ITEMS_PER_PAGE + 1} - {Math.min((currentPage + 1) * ITEMS_PER_PAGE, total)} 件を表示
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          </div>
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">問い合わせ詳細</h3>

            <div className="space-y-4">
              {/* 基本情報 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">基本情報</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 w-24">件名:</span>
                    <span className="text-white">{selectedInquiry.title}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-400 w-24 flex-shrink-0">内容:</span>
                    <p className="text-white whitespace-pre-wrap flex-1">{selectedInquiry.content}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 w-24">ステータス:</span>
                    {getStatusBadge(selectedInquiry.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 w-24">優先度:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedInquiry.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      selectedInquiry.priority === 'low' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {selectedInquiry.priority === 'high' ? '高' :
                       selectedInquiry.priority === 'low' ? '低' : '通常'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 w-24">作成日時:</span>
                    <span className="text-white text-sm">{formatDate(selectedInquiry.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* 送信者情報 */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">送信者情報</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 w-24">名前:</span>
                    <span className="text-white">{selectedInquiry.sender_name || '未設定'}</span>
                  </div>
                  {selectedInquiry.sender_email && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 w-24">メール:</span>
                      <span className="text-white">{selectedInquiry.sender_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 担当者情報 */}
              {selectedInquiry.assigned_staff && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">担当者</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 w-24">担当者:</span>
                      <span className="text-white">
                        {selectedInquiry.assigned_staff.last_name} {selectedInquiry.assigned_staff.first_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 w-24">メール:</span>
                      <span className="text-white">{selectedInquiry.assigned_staff.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setReplyInquiry(selectedInquiry);
                }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaReply className="w-4 h-4" />
                返信する
              </button>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 返信モーダル */}
      {replyInquiry && (
        <InquiryReplyModal
          inquiryId={replyInquiry.id}
          inquiryTitle={replyInquiry.title}
          senderEmail={replyInquiry.sender_email}
          onClose={() => setReplyInquiry(null)}
          onSuccess={() => {
            // 返信成功後、問い合わせ一覧を再取得
            fetchInquiries();
            // 詳細モーダルも閉じる
            setSelectedInquiry(null);
          }}
        />
      )}
    </div>
  );
}
