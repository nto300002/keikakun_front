'use client';

import { useState, useEffect, useCallback } from 'react';
import { withdrawalRequestsApi } from '@/lib/api/withdrawalRequests';
import { WithdrawalRequestResponse, WithdrawalRequestStatus } from '@/types/withdrawalRequest';
import { FaSync, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function ApprovalRequestsTab() {
  const [requests, setRequests] = useState<WithdrawalRequestResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<WithdrawalRequestStatus | ''>('pending');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequestResponse | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const ITEMS_PER_PAGE = 30;

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await withdrawalRequestsApi.getRequests({
        status: statusFilter || undefined,
        skip: currentPage * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      });
      setRequests(response.requests);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '退会リクエストの取得に失敗しました';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      await withdrawalRequestsApi.approveRequest(selectedRequest.id);
      setShowApproveConfirm(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '承認に失敗しました';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;

    setIsProcessing(true);
    try {
      await withdrawalRequestsApi.rejectRequest(selectedRequest.id, rejectReason);
      setRejectReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '却下に失敗しました';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
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

  const getStatusBadge = (status: WithdrawalRequestStatus) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-base">承認待ち</span>;
      case 'approved':
        return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-base">承認済み</span>;
      case 'rejected':
        return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-base">却下</span>;
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">退会リクエスト</h2>
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
            <option value="pending">承認待ち</option>
            <option value="approved">承認済み</option>
            <option value="rejected">却下</option>
          </select>
          <button
            onClick={fetchRequests}
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
        ) : requests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-gray-400">退会リクエストがありません</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-gray-700">
            {requests.map((request) => (
              <div key={request.id} className="p-4 hover:bg-slate-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FaExclamationTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="font-semibold text-slate-950 dark:text-white">{request.title}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-slate-700 text-base mb-2 dark:text-gray-300">{request.reason}</p>
                    <div className="flex items-center gap-4 text-base text-slate-500 dark:text-gray-400">
                      <span>事務所: {request.office_name}</span>
                      <span>申請者: {request.requester_name}</span>
                      <span>申請日: {formatDate(request.created_at)}</span>
                    </div>
                    {request.reviewer_notes && (
                      <div className="mt-3 p-3 bg-slate-100 rounded-lg dark:bg-gray-700/50">
                        <p className="text-base text-slate-500 mb-1 dark:text-gray-400">
                          {request.status === 'approved' ? '承認者コメント' : '却下理由'}:
                        </p>
                        <p className="text-slate-700 text-base dark:text-gray-300">{request.reviewer_notes}</p>
                      </div>
                    )}
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowApproveConfirm(true);
                        }}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        <FaCheckCircle className="w-4 h-4" />
                        承認
                      </button>
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        <FaTimesCircle className="w-4 h-4" />
                        却下
                      </button>
                    </div>
                  )}
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

      {/* 承認確認モーダル */}
      {showApproveConfirm && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full dark:bg-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="w-8 h-8 text-yellow-400" />
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">退会承認の確認</h3>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-base">
                この操作を実行すると、事務所「{selectedRequest.office_name}」と所属するすべてのスタッフが論理削除されます。
                30日後にデータは完全に削除されます。
              </p>
            </div>
            <div className="mb-4 p-3 bg-slate-100 rounded-lg dark:bg-gray-700">
              <p className="text-base text-slate-500 mb-1 dark:text-gray-400">タイトル: {selectedRequest.title}</p>
              <p className="text-slate-700 dark:text-gray-300">{selectedRequest.reason}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowApproveConfirm(false);
                  setSelectedRequest(null);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg transition-colors dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
              >
                キャンセル
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? '処理中...' : '承認する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 却下モーダル */}
      {selectedRequest && !showApproveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full dark:bg-gray-800">
            <h3 className="text-2xl font-bold text-slate-950 mb-4 dark:text-white">退会リクエストを却下</h3>
            <div className="mb-4 p-3 bg-slate-100 rounded-lg dark:bg-gray-700">
              <p className="text-base text-slate-500 mb-1 dark:text-gray-400">タイトル: {selectedRequest.title}</p>
              <p className="text-slate-700 dark:text-gray-300">{selectedRequest.reason}</p>
            </div>
            <div className="mb-4">
              <label className="block text-base text-slate-600 mb-2 dark:text-gray-400">
                却下理由 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="却下理由を入力..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 h-32 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectReason('');
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg transition-colors dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
              >
                キャンセル
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? '処理中...' : '却下する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
