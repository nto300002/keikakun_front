'use client';

import { useState, useEffect, ReactNode, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, officeApi } from '@/lib/auth';
import { noticesApi } from '@/lib/api/notices';
import { messagesApi } from '@/lib/api/messages';
import { Notice } from '@/types/notice';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  office?: {
    id: string;
    name: string;
  } | null;
}

interface ProtectedLayoutClientProps {
  children: ReactNode;
  user: User;
}

/**
 * 保護されたレイアウト（クライアントコンポーネント）
 * サーバーコンポーネントから認証済みユーザー情報を受け取る
 */
export default function ProtectedLayoutClient({ children, user }: ProtectedLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [officeName, setOfficeName] = useState<string | null>(user.office?.name || null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNoticeHovered, setIsNoticeHovered] = useState<boolean>(false);
  const [recentUnreadNotices, setRecentUnreadNotices] = useState<Notice[]>([]);
  const [noticesLoaded, setNoticesLoaded] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 未読通知件数を取得（notices + messages）
  const fetchUnreadCount = async () => {
    try {
      const [noticesData, messagesData] = await Promise.all([
        noticesApi.getUnreadCount(),
        messagesApi.getUnreadCount(),
      ]);
      const totalUnread = noticesData.unread_count + messagesData.unread_count;
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('未読通知件数の取得に失敗しました', error);
    }
  };

  // 最新の未読通知を取得（最大2件、承認・却下のみ）
  const fetchRecentUnreadNotices = async () => {
    if (noticesLoaded) return; // 既に取得済みの場合はスキップ

    try {
      const data = await noticesApi.getNotices({ is_read: false });

      // 承認または却下された通知のみフィルタリング
      const approvedOrRejectedNotices = data.notices.filter((notice) =>
        notice.type === 'role_change_approved' ||
        notice.type === 'role_change_rejected' ||
        notice.type === 'employee_action_approved' ||
        notice.type === 'employee_action_rejected'
      );

      // 最新2件を取得（created_atで降順ソート）
      const sortedNotices = approvedOrRejectedNotices.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentUnreadNotices(sortedNotices.slice(0, 2));
      setNoticesLoaded(true);
    } catch (error) {
      console.error('未読通知の取得に失敗しました', error);
    }
  };

  // ホバー時の処理
  const handleNoticeHover = () => {
    setIsNoticeHovered(true);
    if (unreadCount > 0) {
      fetchRecentUnreadNotices();
    }
  };

  useEffect(() => {
    // クライアント側でマウントされたことを検出
    setIsMounted(true);

    // 事業所情報が未取得の場合のみ取得
    if (!officeName) {
      officeApi.getMyOffice()
        .then(office => setOfficeName(office.name))
        .catch(error => {
          console.error('事業所情報の取得に失敗しました', error);
        });
    }

    // 初回の未読件数取得
    fetchUnreadCount();

    // 30秒ごとに未読件数を更新
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30秒

    return () => clearInterval(interval);
  }, [officeName]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      // Cookie認証: Cookieはサーバー側で削除される
      const params = new URLSearchParams({
          hotbar_message: 'ログアウトしました',
          hotbar_type: 'success'
      });
      // router.push()ではなくwindow.location.hrefを使用して完全なページリロードを強制
      // これにより、Cookie削除が確実に反映された状態でログインページが読み込まれる
      window.location.href = `/auth/login?${params.toString()}`;
    } catch (error) {
      console.error('Logout failed:', error);
      // エラーが発生してもログイン画面にリダイレクト
      window.location.href = '/auth/login';
    }
  };

  return (
    <Suspense fallback={null}> 
      <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left Side */}
              <div className="flex items-center">
                <Link href="/dashboard" className="text-lg font-semibold text-white hover:text-blue-400">
                  事務所名: {officeName ? officeName : '事務所名が登録されていません'}
                </Link>
              </div>

              {/* Right Side */}
              <div className="flex items-center space-x-4" suppressHydrationWarning>
                {user?.role === 'owner' && (
                  <Link
                    href="/admin"
                    className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                      pathname === '/admin'
                        ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    管理者設定
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  利用者ダッシュボード
                </Link>
                <Link
                  href="/profile"
                  className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                    pathname === '/profile'
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  プロフィール
                </Link>
                <div className="relative">
                  <button
                    onClick={() => router.push('/notice')}
                    onMouseEnter={handleNoticeHover}
                    onMouseLeave={() => setIsNoticeHovered(false)}
                    className={`relative flex flex-col items-center gap-1 p-2 rounded-md transition-colors ${
                      pathname === '/notice'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    aria-label={unreadCount > 0 ? `${unreadCount}件の未読通知があります` : '通知'}
                  >
                    <div className="relative">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {/* 未読通知がある場合のみ赤い丸を表示 */}
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-800"></span>
                      )}
                    </div>
                    <span className="text-xs">通知/メッセージ</span>
                  </button>

                  {/* 通知プレビューポップオーバー */}
                  {isMounted && isNoticeHovered && unreadCount > 0 && recentUnreadNotices.length > 0 && (
                    <div
                      className="absolute right-0 top-full mt-2 w-80 bg-[#0f1419] border border-[#2a2a3e] rounded-lg shadow-xl z-50 p-4"
                      onMouseEnter={() => setIsNoticeHovered(true)}
                      onMouseLeave={() => setIsNoticeHovered(false)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold text-sm">最新の未読通知</h4>
                        <span className="text-xs text-gray-400">{unreadCount}件</span>
                      </div>
                      <div className="space-y-2">
                        {recentUnreadNotices.map((notice) => (
                          <div
                            key={notice.id}
                            className="p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer border border-gray-700/50"
                            onClick={() => router.push('/notice')}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h5 className="text-white text-sm font-medium line-clamp-1">{notice.title}</h5>
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>
                            </div>
                            <p className="text-gray-400 text-xs line-clamp-2 mb-2">{notice.content}</p>
                            <time className="text-gray-500 text-xs">
                              {new Date(notice.created_at).toLocaleString('ja-JP', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </time>
                          </div>
                        ))}
                      </div>
                      {unreadCount > 2 && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <button
                            onClick={() => router.push('/notice')}
                            className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                          >
                            すべての通知を見る
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md text-sm font-medium border border-gray-600"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-grow container mx-auto p-6 md:p-8 bg-gray-800 text-gray-100 rounded-lg shadow-md my-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700">
          <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-400">
              © {new Date().getFullYear()} ケイカくん. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Suspense>
  );
}
