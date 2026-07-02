'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { appAdminApi } from '@/lib/api/appAdmin';
import { OfficeListItemResponse } from '@/types/office';
import { FaSync, FaSearch, FaBuilding, FaChevronRight } from 'react-icons/fa';

export default function OfficesTab() {
  const [offices, setOffices] = useState<OfficeListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const router = useRouter();

  const ITEMS_PER_PAGE = 30;

  // デバウンス処理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchOffices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await appAdminApi.getOffices({
        search: debouncedSearch || undefined,
        skip: currentPage * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      });
      setOffices(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '事務所の取得に失敗しました';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    fetchOffices();
  }, [fetchOffices]);

  const handleOfficeClick = (officeId: string) => {
    router.push(`/app-admin/offices/${officeId}`);
  };

  const getOfficeTypeName = (type: string) => {
    switch (type) {
      case 'transition_to_employment':
        return '移行支援';
      case 'type_A_office':
        return '就労A型';
      case 'type_B_office':
        return '就労B型';
      default:
        return type;
    }
  };

  const hasNextPage = offices.length === ITEMS_PER_PAGE;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">事務所一覧</h2>
        <div className="flex gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="事務所名で検索..."
              className="bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-slate-900 placeholder-slate-400 w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <button
            onClick={fetchOffices}
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

      <div className="bg-white rounded-lg border border-slate-300 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-slate-600 mt-4 dark:text-gray-400">読み込み中...</p>
          </div>
        ) : offices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-gray-400">
              {debouncedSearch ? `「${debouncedSearch}」に一致する事務所が見つかりません` : '事務所がありません'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold dark:text-gray-300">事務所名</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold dark:text-gray-300">種別</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold dark:text-gray-300">住所</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold dark:text-gray-300">電話番号</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold dark:text-gray-300">メール</th>
                  <th className="text-left py-3 px-4 text-slate-700 font-semibold dark:text-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {offices.map((office) => (
                  <tr
                    key={office.id}
                    onClick={() => handleOfficeClick(office.id)}
                    className="border-t border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors dark:border-gray-700 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="w-4 h-4 text-purple-400" />
                        <span className="text-slate-950 font-semibold dark:text-white">{office.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-base dark:bg-gray-600 dark:text-gray-200">
                        {getOfficeTypeName(office.office_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-base dark:text-gray-300">
                      {office.address || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-base dark:text-gray-300">
                      {office.phone_number || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-base dark:text-gray-300">
                      {office.email || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <FaChevronRight className="w-4 h-4 text-slate-400 dark:text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ページネーション */}
      {(currentPage > 0 || hasNextPage) && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-600 text-base dark:text-gray-400">
            {offices.length} 件を表示中（ページ {currentPage + 1}）
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              前へ
            </button>
            <span className="bg-slate-200 text-slate-900 px-4 py-2 rounded-lg dark:bg-gray-700 dark:text-white">
              ページ {currentPage + 1}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!hasNextPage}
              className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              次へ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
