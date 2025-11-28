'use client';

import { useState, useEffect, useCallback } from 'react';
import { appAdminApi, InquiryResponse } from '@/lib/api/appAdmin';
import { FaSync, FaReply, FaEnvelopeOpen, FaEnvelope } from 'react-icons/fa';

export default function InquiriesTab() {
  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'unread' | 'read' | 'replied' | ''>('');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryResponse | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

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

  const handleReply = async () => {
    if (!selectedInquiry || !replyContent.trim()) return;

    setIsReplying(true);
    try {
      await appAdminApi.replyToInquiry(selectedInquiry.id, replyContent);
      setReplyContent('');
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '返信に失敗しました';
      setError(errorMessage);
    } finally {
      setIsReplying(false);
    }
  };

  const handleMarkAsRead = async (inquiry: InquiryResponse) => {
    try {
      await appAdminApi.markInquiryAsRead(inquiry.id);
      fetchInquiries();
    } catch (err) {
      console.error('既読にできませんでした:', err);
    }
  };

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
      case 'unread':
        return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">未読</span>;
      case 'read':
        return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">既読</span>;
      case 'replied':
        return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">返信済み</span>;
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
            <option value="unread">未読</option>
            <option value="read">既読</option>
            <option value="replied">返信済み</option>
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
                      {inquiry.status === 'unread' ? (
                        <FaEnvelope className="w-4 h-4 text-red-400" />
                      ) : (
                        <FaEnvelopeOpen className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-medium text-white">{inquiry.subject}</span>
                      {getStatusBadge(inquiry.status)}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{inquiry.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{inquiry.staff_name} ({inquiry.office_name})</span>
                      <span>{formatDate(inquiry.created_at)}</span>
                    </div>
                    {inquiry.reply_content && (
                      <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">返信内容:</p>
                        <p className="text-gray-300 text-sm">{inquiry.reply_content}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {inquiry.status === 'unread' && (
                      <button
                        onClick={() => handleMarkAsRead(inquiry)}
                        className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                        title="既読にする"
                      >
                        <FaEnvelopeOpen className="w-4 h-4" />
                      </button>
                    )}
                    {inquiry.status !== 'replied' && (
                      <button
                        onClick={() => setSelectedInquiry(inquiry)}
                        className="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                        title="返信する"
                      >
                        <FaReply className="w-4 h-4" />
                      </button>
                    )}
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

      {/* 返信モーダル */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-white mb-4">返信を作成</h3>
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">件名: {selectedInquiry.subject}</p>
              <p className="text-gray-300">{selectedInquiry.content}</p>
            </div>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="返信内容を入力..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 h-32 resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedInquiry(null);
                  setReplyContent('');
                }}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleReply}
                disabled={isReplying || !replyContent.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isReplying ? '送信中...' : '返信を送信'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
