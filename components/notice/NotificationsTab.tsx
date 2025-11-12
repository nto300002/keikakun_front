'use client';

import { useState, useEffect } from 'react';
import { Notice, NoticeType } from '@/types/notice';
import { noticesApi } from '@/lib/api/notices';
import { roleChangeRequestsApi } from '@/lib/api/roleChangeRequests';
import { employeeActionRequestsApi } from '@/lib/api/employeeActionRequests';
import NoticeCard from './NoticeCard';

export default function NotificationsTab() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [processingNoticeId, setProcessingNoticeId] = useState<string | null>(null);

  const loadNotices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 全ての通知を取得
      const data = await noticesApi.getNotices({});
      let filteredNotices = data?.notices || [];

      // フィルタリング
      if (filter === 'pending') {
        filteredNotices = filteredNotices.filter(
          (n) =>
            n.type === NoticeType.ROLE_CHANGE_PENDING ||
            n.type === NoticeType.ROLE_CHANGE_REQUEST_SENT ||
            n.type === NoticeType.EMPLOYEE_ACTION_PENDING ||
            n.type === NoticeType.EMPLOYEE_ACTION_REQUEST_SENT
        );
      } else if (filter === 'approved') {
        filteredNotices = filteredNotices.filter(
          (n) =>
            n.type === NoticeType.ROLE_CHANGE_APPROVED ||
            n.type === NoticeType.EMPLOYEE_ACTION_APPROVED
        );
      } else if (filter === 'rejected') {
        filteredNotices = filteredNotices.filter(
          (n) =>
            n.type === NoticeType.ROLE_CHANGE_REJECTED ||
            n.type === NoticeType.EMPLOYEE_ACTION_REJECTED
        );
      }
      // 'all'の場合はフィルタリングしない

      setNotices(filteredNotices);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || '通知の取得に失敗しました');
      // エラー時も空配列を設定
      setNotices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 通知一覧取得
  useEffect(() => {
    loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // 既読にする
  const handleMarkAsRead = async (noticeId: string) => {
    try {
      await noticesApi.markAsRead(noticeId);
      await loadNotices();
      setSuccessMessage('通知を既読にしました');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || '通知の既読処理に失敗しました');
      setTimeout(() => setError(null), 3000);
    }
  };

  // 全て既読にする
  const handleMarkAllAsRead = async () => {
    try {
      await noticesApi.markAllAsRead();
      await loadNotices();
      setSuccessMessage('すべての通知を既読にしました');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || '一括既読処理に失敗しました');
      setTimeout(() => setError(null), 3000);
    }
  };

  // 承認処理（通知タイプに応じて適切なAPIを呼び出す）
  const handleApprove = async (requestId: string, noticeType: NoticeType, noticeId: string) => {
    setProcessingNoticeId(noticeId);
    try {
      if (noticeType === NoticeType.ROLE_CHANGE_PENDING) {
        await roleChangeRequestsApi.approveRequest(requestId);
        setSuccessMessage('Role変更リクエストを承認しました');
      } else if (noticeType === NoticeType.EMPLOYEE_ACTION_PENDING) {
        await employeeActionRequestsApi.approveRequest(requestId);
        setSuccessMessage('Employee制限リクエストを承認しました');
      }
      await loadNotices();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || '承認処理に失敗しました');
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingNoticeId(null);
    }
  };

  // 却下処理（通知タイプに応じて適切なAPIを呼び出す）
  const handleReject = async (requestId: string, noticeType: NoticeType, noticeId: string) => {
    setProcessingNoticeId(noticeId);
    try {
      if (noticeType === NoticeType.ROLE_CHANGE_PENDING) {
        await roleChangeRequestsApi.rejectRequest(requestId);
        setSuccessMessage('Role変更リクエストを却下しました');
      } else if (noticeType === NoticeType.EMPLOYEE_ACTION_PENDING) {
        await employeeActionRequestsApi.rejectRequest(requestId);
        setSuccessMessage('Employee制限リクエストを却下しました');
      }
      await loadNotices();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || '却下処理に失敗しました');
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingNoticeId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* 成功メッセージ */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-white hover:text-gray-200">
              ×
            </button>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">通知</h2>

      {/* フィルター */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
          }`}
        >
          ⏱ 承認待ち
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
          }`}
        >
          ✓ 承認済み
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
          }`}
        >
          ✗ 却下済み
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
          }`}
        >
          すべて
        </button>
        <button
          onClick={handleMarkAllAsRead}
          disabled={isLoading}
          className="ml-auto bg-gray-700/50 hover:bg-gray-600/70 text-gray-300 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          すべて既読にする
        </button>
      </div>

      {/* 通知一覧 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">読み込み中...</div>
      ) : notices.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {filter === 'pending' && '承認待ちの通知はありません'}
          {filter === 'approved' && '承認済みの通知はありません'}
          {filter === 'rejected' && '却下済みの通知はありません'}
          {filter === 'all' && '通知はありません'}
        </div>
      ) : (
        notices.map((notice) => (
          <NoticeCard
            key={notice.id}
            notice={notice}
            onMarkAsRead={handleMarkAsRead}
            onApprove={handleApprove}
            onReject={handleReject}
            isProcessing={processingNoticeId === notice.id}
          />
        ))
      )}
    </div>
  );
}
