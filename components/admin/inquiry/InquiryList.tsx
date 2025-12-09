'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  InquiryListItem,
  InquiryStatus,
  InquiryPriority,
  InquiryFilterParams,
} from '@/types/inquiry';
import { inquiryApi } from '@/lib/api/inquiry';
import { FaSync, FaSearch, FaEye } from 'react-icons/fa';

interface InquiryListProps {
  onSelectInquiry: (inquiryId: string) => void;
}

export default function InquiryList({ onSelectInquiry }: InquiryListProps) {
  const [inquiries, setInquiries] = useState<InquiryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<InquiryFilterParams>({
    status: undefined,
    priority: undefined,
    search: '',
    sort: 'created_at',
  });

  const ITEMS_PER_PAGE = 20;

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inquiryApi.getInquiries({
        ...filters,
        skip: currentPage * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
        order: 'desc',
      });
      setInquiries(response.inquiries);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '問い合わせの取得に失敗しました';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

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

  const getStatusBadge = (status: InquiryStatus) => {
    const badges: Record<InquiryStatus, { bg: string; text: string; label: string }> = {
      new: { bg: 'bg-red-500/20', text: 'text-red-400', label: '新規' },
      open: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '確認済み' },
      in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: '対応中' },
      answered: { bg: 'bg-green-500/20', text: 'text-green-400', label: '回答済み' },
      closed: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'クローズ' },
      spam: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'スパム' },
    };

    const badge = badges[status];
    return (
      <span className={`${badge.bg} ${badge.text} px-2 py-1 rounded text-xs font-medium`}>
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: InquiryPriority) => {
    const badges: Record<InquiryPriority, { bg: string; text: string; label: string }> = {
      low: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: '低' },
      normal: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: '通常' },
      high: { bg: 'bg-red-500/20', text: 'text-red-400', label: '高' },
    };

    const badge = badges[priority];
    return (
      <span className={`${badge.bg} ${badge.text} px-2 py-1 rounded text-xs font-medium`}>
        {badge.label}
      </span>
    );
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">問い合わせ一覧</h2>

        {/* フィルター */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* 検索 */}
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="件名・本文で検索..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setCurrentPage(0);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* ステータスフィルター */}
          <div>
            <select
              value={filters.status || ''}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value as InquiryStatus || undefined });
                setCurrentPage(0);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">すべてのステータス</option>
              <option value="new">新規</option>
              <option value="open">確認済み</option>
              <option value="in_progress">対応中</option>
              <option value="answered">回答済み</option>
              <option value="closed">クローズ</option>
              <option value="spam">スパム</option>
            </select>
          </div>

          {/* 優先度フィルター */}
          <div>
            <select
              value={filters.priority || ''}
              onChange={(e) => {
                setFilters({ ...filters, priority: e.target.value as InquiryPriority || undefined });
                setCurrentPage(0);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">すべての優先度</option>
              <option value="high">高</option>
              <option value="normal">通常</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-between items-center">
          <p className="text-gray-400 text-sm">全 {total} 件</p>
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

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* テーブル */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    件名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    送信者
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    優先度
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    作成日時
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{inquiry.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-300">{inquiry.sender_name || '未設定'}</div>
                      <div className="text-xs text-gray-400">{inquiry.sender_email}</div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(inquiry.status)}</td>
                    <td className="px-4 py-3">{getPriorityBadge(inquiry.priority)}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">
                      {formatDate(inquiry.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectInquiry(inquiry.id)}
                        className="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                        title="詳細を表示"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
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
            {currentPage * ITEMS_PER_PAGE + 1} - {Math.min((currentPage + 1) * ITEMS_PER_PAGE, total)} 件を表示
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>
            <span className="px-4 py-2 text-gray-300">
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
