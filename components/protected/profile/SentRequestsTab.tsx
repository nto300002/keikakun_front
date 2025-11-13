'use client';

import { useState, useEffect } from 'react';
import { RoleChangeRequest, RequestStatus } from '@/types/roleChangeRequest';
import { EmployeeActionRequest } from '@/types/employeeActionRequest';
import { roleChangeRequestsApi } from '@/lib/api/roleChangeRequests';
import { employeeActionRequestsApi } from '@/lib/api/employeeActionRequests';
import RequestCard from './RequestCard';

type CombinedRequest =
  | { type: 'role_change'; request: RoleChangeRequest }
  | { type: 'employee_action'; request: EmployeeActionRequest };

export default function SentRequestsTab() {
  const [requests, setRequests] = useState<CombinedRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[DEBUG SENT_REQUESTS_TAB] Loading requests with filter:', filter);

      // Role変更リクエストとEmployee制限リクエストを並行で取得
      const [roleChangeData, employeeActionData] = await Promise.all([
        roleChangeRequestsApi.getRequests().catch(() => ({ requests: [], total: 0 })),
        employeeActionRequestsApi.getRequests().catch(() => ({ requests: [], total: 0 })),
      ]);

      console.log('[DEBUG SENT_REQUESTS_TAB] Role change data:', roleChangeData);
      console.log('[DEBUG SENT_REQUESTS_TAB] Employee action data:', employeeActionData);

      // 安全にrequests配列にアクセス（undefinedの場合は空配列を使用）
      const roleChangeRequests = roleChangeData?.requests || [];
      const employeeActionRequests = employeeActionData?.requests || [];

      console.log('[DEBUG SENT_REQUESTS_TAB] Role change requests count:', roleChangeRequests.length);
      console.log('[DEBUG SENT_REQUESTS_TAB] Employee action requests count:', employeeActionRequests.length);

      // 両方のリクエストを結合して、作成日時でソート
      const combined: CombinedRequest[] = [
        ...roleChangeRequests.map((req) => ({
          type: 'role_change' as const,
          request: req,
        })),
        ...employeeActionRequests.map((req) => ({
          type: 'employee_action' as const,
          request: req,
        })),
      ].sort((a, b) => {
        const dateA = new Date(a.request.created_at).getTime();
        const dateB = new Date(b.request.created_at).getTime();
        return dateB - dateA; // 新しい順
      });

      console.log('[DEBUG SENT_REQUESTS_TAB] Combined requests:', combined);

      // フィルターを適用
      const filtered = combined.filter((item) => {
        if (filter === 'pending') {
          return item.request.status === RequestStatus.PENDING;
        }
        if (filter === 'completed') {
          return (
            item.request.status === RequestStatus.APPROVED ||
            item.request.status === RequestStatus.REJECTED
          );
        }
        return true; // 'all'
      });

      console.log('[DEBUG SENT_REQUESTS_TAB] Filtered requests:', filtered);
      console.log('[DEBUG SENT_REQUESTS_TAB] Setting requests to state, count:', filtered.length);

      setRequests(filtered);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[DEBUG SENT_REQUESTS_TAB] Error loading requests:', err);
      setError(message || 'リクエストの取得に失敗しました');
      // エラー時も空配列を設定
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // リクエスト一覧取得
  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // リクエスト削除ハンドラ
  const handleDelete = async (requestId: string, type: 'role_change' | 'employee_action') => {
    if (!confirm('このリクエストを取り消しますか？')) {
      return;
    }

    try {
      if (type === 'role_change') {
        await roleChangeRequestsApi.deleteRequest(requestId);
        setSuccessMessage('Role変更リクエストを取り消しました');
      } else {
        await employeeActionRequestsApi.deleteRequest(requestId);
        setSuccessMessage('Employee制限リクエストを取り消しました');
      }
      await loadRequests();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'リクエストの削除に失敗しました');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">送信済みリクエスト</h2>

      {/* 成功メッセージ */}
      {successMessage && (
        <div className="mb-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-white hover:text-gray-200">
              ×
            </button>
          </div>
        </div>
      )}

      {/* フィルター */}
      <div className="flex gap-2 mb-6">
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
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
          }`}
        >
          承認待ち
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'completed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
          }`}
        >
          処理済み
        </button>
      </div>

      {/* リクエスト一覧 */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">読み込み中...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {filter === 'pending' && '承認待ちのリクエストはありません'}
          {filter === 'completed' && '処理済みのリクエストはありません'}
          {filter === 'all' && 'リクエストはありません'}
        </div>
      ) : (
        requests.map((item) => (
          <RequestCard
            key={`${item.type}_${item.request.id}`}
            request={item.request}
            type={item.type}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
}
