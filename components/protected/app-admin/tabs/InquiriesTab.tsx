'use client';

import { useState, useEffect, useCallback } from 'react';
import { inquiryApi } from '@/lib/api/inquiry';
import type { InquiryListItem, InquiryStatus } from '@/types/inquiry';
import { FaSync, FaEye, FaEnvelopeOpen, FaEnvelope, FaReply } from 'react-icons/fa';
import InquiryReplyModal from '../InquiryReplyModal';

export default function InquiriesTab() {
  const [inquiries, setInquiries] = useState<InquiryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | ''>('');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryListItem | null>(null);
  const [replyInquiry, setReplyInquiry] = useState<InquiryListItem | null>(null);

  const ITEMS_PER_PAGE = 30;

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inquiryApi.getInquiries({
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
        return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-base">新規</span>;
      case 'open':
        return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-base">対応中</span>;
      case 'in_progress':
        return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-base">担当割当済み</span>;
      case 'answered':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-base dark:bg-green-500/20 dark:text-green-400">回答済み</span>;
      case 'closed':
        return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-base">クローズ</span>;
      case 'spam':
        return <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-base">スパム</span>;
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">問い合わせ</h2>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setCurrentPage(0);
            }}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

      <div className="bg-white rounded-lg border border-slate-300 dark:bg-gray-800 dark:border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-slate-600 mt-4 dark:text-gray-400">読み込み中...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-gray-400">問い合わせがありません</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-gray-700">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="p-4 hover:bg-slate-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {inquiry.status === 'new' ? (
                        <FaEnvelope className="w-4 h-4 text-red-500 dark:text-red-400" />
                      ) : (
                        <FaEnvelopeOpen className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                      )}
                      <span className="font-semibold text-slate-950 dark:text-white">{inquiry.title}</span>
                      {getStatusBadge(inquiry.status)}
                    </div>
                    <p className="text-slate-700 text-base mb-2 line-clamp-2 dark:text-gray-300">{inquiry.content}</p>
                    <div className="flex items-center gap-4 text-base text-slate-500 mb-2 dark:text-gray-400">
                      <span>送信者: {inquiry.sender_name || '未設定'}</span>
                      {inquiry.sender_email && <span>{inquiry.sender_email}</span>}
                      <span>{formatDate(inquiry.created_at)}</span>
                    </div>
                    {inquiry.assigned_staff && (
                      <div className="text-base text-slate-500 mb-2 dark:text-gray-400">
                        <span>担当者: {inquiry.assigned_staff.last_name} {inquiry.assigned_staff.first_name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setReplyInquiry(inquiry)}
                      className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-slate-100 transition-colors dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-gray-600"
                      title="返信する"
                    >
                      <FaReply className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-slate-100 transition-colors dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-gray-600"
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
          <p className="text-slate-600 text-base dark:text-gray-400">
            全 {total} 件中 {currentPage * ITEMS_PER_PAGE + 1} - {Math.min((currentPage + 1) * ITEMS_PER_PAGE, total)} 件を表示
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              前へ
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              次へ
            </button>
          </div>
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800">
            <h3 className="text-2xl font-bold text-slate-950 mb-4 dark:text-white">問い合わせ詳細</h3>

            <div className="space-y-4">
              {/* 基本情報 */}
              <div className="bg-slate-100 rounded-lg p-4 dark:bg-gray-700">
                <h4 className="text-base font-semibold text-slate-700 mb-3 dark:text-gray-300">基本情報</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-500 w-24 dark:text-gray-400">件名:</span>
                    <span className="text-slate-950 dark:text-white">{selectedInquiry.title}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base text-slate-500 w-24 flex-shrink-0 dark:text-gray-400">内容:</span>
                    <p className="text-slate-950 whitespace-pre-wrap flex-1 dark:text-white">{selectedInquiry.content}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-500 w-24 dark:text-gray-400">状態:</span>
                    {getStatusBadge(selectedInquiry.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-500 w-24 dark:text-gray-400">優先度:</span>
                    <span className={`px-2 py-1 rounded text-base ${
                      selectedInquiry.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      selectedInquiry.priority === 'low' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {selectedInquiry.priority === 'high' ? '高' :
                       selectedInquiry.priority === 'low' ? '低' : '通常'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-500 w-24 dark:text-gray-400">作成日時:</span>
                    <span className="text-slate-950 text-base dark:text-white">{formatDate(selectedInquiry.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* 送信者情報 */}
              <div className="bg-slate-100 rounded-lg p-4 dark:bg-gray-700">
                <h4 className="text-base font-semibold text-slate-700 mb-3 dark:text-gray-300">送信者情報</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-500 w-24 dark:text-gray-400">名前:</span>
                    <span className="text-slate-950 dark:text-white">{selectedInquiry.sender_name || '未設定'}</span>
                  </div>
                  {selectedInquiry.sender_email && (
                    <div className="flex items-center gap-2">
                      <span className="text-base text-slate-500 w-24 dark:text-gray-400">メール:</span>
                      <span className="text-slate-950 dark:text-white">{selectedInquiry.sender_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 担当者情報 */}
              {selectedInquiry.assigned_staff && (
                <div className="bg-slate-100 rounded-lg p-4 dark:bg-gray-700">
                  <h4 className="text-base font-semibold text-slate-700 mb-3 dark:text-gray-300">担当者</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base text-slate-500 w-24 dark:text-gray-400">担当者:</span>
                      <span className="text-slate-950 dark:text-white">
                        {selectedInquiry.assigned_staff.last_name} {selectedInquiry.assigned_staff.first_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base text-slate-500 w-24 dark:text-gray-400">メール:</span>
                      <span className="text-slate-950 dark:text-white">{selectedInquiry.assigned_staff.email}</span>
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
                className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg transition-colors dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
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
          senderStaffId={replyInquiry.sender_staff_id}
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
