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
        <h2 className="text-2xl font-bold">事務所一覧</h2>
        <div className="flex gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="事務所名で検索..."
              className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 w-64"
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

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">読み込み中...</p>
          </div>
        ) : offices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">
              {debouncedSearch ? `「${debouncedSearch}」に一致する事務所が見つかりません` : '事務所がありません'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">事務所名</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">種別</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">住所</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">電話番号</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">メール</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {offices.map((office) => (
                  <tr
                    key={office.id}
                    onClick={() => handleOfficeClick(office.id)}
                    className="border-t border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-medium">{office.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-600 text-gray-200 px-2 py-1 rounded text-xs">
                        {getOfficeTypeName(office.office_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {office.address || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {office.phone_number || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {office.email || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <FaChevronRight className="w-4 h-4 text-gray-400" />
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
          <p className="text-gray-400 text-sm">
            {offices.length} 件を表示中（ページ {currentPage + 1}）
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
              ページ {currentPage + 1}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!hasNextPage}
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
