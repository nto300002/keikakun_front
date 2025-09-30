'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { welfareRecipientsApi, type WelfareRecipient } from '@/lib/welfare-recipients';
import { MagnifyingGlassIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function RecipientsListPage() {
  const [recipients, setRecipients] = useState<WelfareRecipient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecipients, setTotalRecipients] = useState(0);

  const fetchRecipients = async (page: number = 1, search: string = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await welfareRecipientsApi.list({
        skip: (page - 1) * 10,
        limit: 10,
        search: search || undefined,
      });

      setRecipients(response.recipients);
      setTotalPages(response.pages);
      setTotalRecipients(response.total);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch recipients:', err);
      setError('利用者情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecipients(1, searchQuery);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1419] to-[#1a2332] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: '利用者一覧', current: true }]} />
        {/* Header */}
        <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">利用者管理</h1>
              <p className="text-gray-400 mt-1">登録済み利用者: {totalRecipients}名</p>
            </div>
            <Link
              href="/recipients/new"
              className="flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#0f9f6e] text-white rounded-lg font-medium transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              新規登録
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="名前で検索（漢字・ふりがな）"
                className="w-full pl-10 pr-4 py-2 bg-[#1a2332] border border-[#2a3441] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#10b981]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-[#2a3441] hover:bg-[#3a4451] text-white rounded-lg font-medium transition-colors"
            >
              検索
            </button>
          </form>
        </div>

        {/* Recipients List */}
        <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441]">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10b981]"></div>
              <p className="mt-4 text-gray-400">読み込み中...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : recipients.length === 0 ? (
            <div className="p-8 text-center">
              <UserIcon className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">利用者が見つかりません</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a2332] border-b border-[#2a3441]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        氏名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        ふりがな
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        年齢
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        性別
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        連絡先
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a3441]">
                    {recipients.map((recipient) => (
                      <tr key={recipient.id} className="hover:bg-[#1a2332] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/recipients/${recipient.id}`}
                            className="text-sm font-medium text-white hover:text-[#10b981] transition-colors cursor-pointer"
                          >
                            {recipient.last_name} {recipient.first_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {recipient.last_name_furigana} {recipient.first_name_furigana}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {calculateAge(recipient.birth_day)}歳
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {recipient.gender === 'male' ? '男性' :
                             recipient.gender === 'female' ? '女性' : 'その他'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {recipient.detail?.tel || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/recipients/${recipient.id}`}
                            className="text-[#10b981] hover:text-[#0f9f6e] text-sm font-medium"
                          >
                            詳細
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-[#1a2332] border-t border-[#2a3441] flex justify-between items-center">
                  <button
                    onClick={() => fetchRecipients(currentPage - 1, searchQuery)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    前へ
                  </button>
                  <div className="text-sm text-gray-400">
                    {currentPage} / {totalPages} ページ
                  </div>
                  <button
                    onClick={() => fetchRecipients(currentPage + 1, searchQuery)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}