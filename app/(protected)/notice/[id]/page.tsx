'use client';

import { useState, useEffect, use } from 'react';
import { noticesApi } from '@/lib/api/notices';
import { Notice } from '@/types/notice';
import NoticeDetail from '@/components/notice/NoticeDetail';
import { toast } from '@/lib/toast-debug';

export default function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 通知詳細を取得（取得時に自動的に既読になる）
  const fetchNoticeDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await noticesApi.getNoticeDetail(resolvedParams.id);
      setNotice(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || '通知の取得に失敗しました');
      toast.error(message || '通知の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticeDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  // ローディング中
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">通知を読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error || !notice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-6 text-center">
            <div className="text-red-400 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">エラー</h2>
            <p className="text-gray-300 mb-4">
              {error || '通知が見つかりませんでした'}
            </p>
            <button
              onClick={() => (window.location.href = '/notice')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
            >
              通知一覧に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <NoticeDetail notice={notice} onUpdate={fetchNoticeDetail} />
    </div>
  );
}
