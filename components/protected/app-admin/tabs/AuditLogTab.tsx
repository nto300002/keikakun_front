'use client';

import { useState, useEffect, useCallback } from 'react';
import { auditLogsApi } from '@/lib/api/auditLogs';
import { AuditLogResponse, AuditLogFilterParams } from '@/types/auditLog';
import { FaFilter, FaSync } from 'react-icons/fa';

export default function AuditLogTab() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilterParams>({
    limit: 30,
  });

  const ITEMS_PER_PAGE = 30;

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await auditLogsApi.getLogs({
        ...filters,
        skip: currentPage * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      });
      setLogs(response.logs);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '監査ログの取得に失敗しました';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes('approved')) return 'text-green-400';
    if (action.includes('rejected') || action.includes('deleted') || action.includes('failed')) return 'text-red-400';
    if (action.includes('created') || action.includes('enabled')) return 'text-blue-400';
    return 'text-gray-300';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">監査ログ</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaFilter className="w-4 h-4" />
            フィルター
          </button>
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaSync className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            更新
          </button>
        </div>
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">ターゲット種別</label>
              <select
                value={filters.target_type || ''}
                onChange={(e) => setFilters({ ...filters, target_type: e.target.value || undefined })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">すべて</option>
                <option value="staff">スタッフ</option>
                <option value="office">事務所</option>
                <option value="withdrawal_request">退会リクエスト</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">アクション</label>
              <select
                value={filters.action || ''}
                onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">すべて</option>
                <option value="withdrawal.approved">退会承認</option>
                <option value="withdrawal.rejected">退会却下</option>
                <option value="staff.deleted">スタッフ削除</option>
                <option value="role.changed">権限変更</option>
                <option value="login.success">ログイン成功</option>
                <option value="login.failed">ログイン失敗</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">開始日</label>
              <input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value || undefined })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => {
                setFilters({ limit: 30 });
                setCurrentPage(0);
              }}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              リセット
            </button>
            <button
              onClick={() => setCurrentPage(0)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              適用
            </button>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* ログテーブル */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">読み込み中...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">監査ログがありません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">日時</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">実行者</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">アクション</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">対象</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">事務所</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">詳細</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-gray-300 text-sm whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white">{log.actor_name}</p>
                        <p className="text-xs text-gray-400">{log.actor_role}</p>
                      </div>
                    </td>
                    <td className={`py-3 px-4 font-mono text-sm ${getActionColor(log.action)}`}>
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {log.target_type}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {log.office_name || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <span className="bg-gray-700 text-white px-4 py-2 rounded-lg">
              {currentPage + 1} / {totalPages}
            </span>
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
    </div>
  );
}
