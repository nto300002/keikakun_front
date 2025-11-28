'use client';

import { useState, useEffect, useCallback } from 'react';
import { appAdminApi, AnnouncementResponse } from '@/lib/api/appAdmin';
import { FaSync, FaPaperPlane, FaBullhorn } from 'react-icons/fa';

export default function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const ITEMS_PER_PAGE = 30;

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await appAdminApi.getAnnouncements({
        skip: currentPage * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      });
      setAnnouncements(response.announcements);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'お知らせの取得に失敗しました';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      setError('タイトルと本文を入力してください');
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      await appAdminApi.sendAnnouncement({ title, content });
      setTitle('');
      setContent('');
      setShowForm(false);
      setSuccessMessage('お知らせを送信しました');
      fetchAnnouncements();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'お知らせの送信に失敗しました';
      setError(errorMessage);
    } finally {
      setIsSending(false);
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

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">お知らせ</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaBullhorn className="w-4 h-4" />
            新規お知らせ作成
          </button>
          <button
            onClick={fetchAnnouncements}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
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

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}

      {/* 新規作成フォーム */}
      {showForm && (
        <div className="bg-gray-800 rounded-lg border border-purple-500/30 p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">新規お知らせを作成</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                タイトル <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="お知らせのタイトル"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                本文 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="お知らせの本文を入力..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 h-32 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setTitle('');
                  setContent('');
                }}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || !title.trim() || !content.trim()}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <FaPaperPlane className="w-4 h-4" />
                {isSending ? '送信中...' : '送信'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* お知らせ履歴 */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">送信履歴</h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-4">読み込み中...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">お知らせの履歴がありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-4 hover:bg-gray-700/50">
                <div className="flex items-start gap-3">
                  <FaBullhorn className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white">{announcement.title}</h4>
                      <span className="text-xs text-gray-400">
                        {formatDate(announcement.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{announcement.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      送信者: {announcement.sender_name}
                    </p>
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
    </div>
  );
}
