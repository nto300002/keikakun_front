'use client';

import { useState, useEffect, ReactNode, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, officeApi } from '@/lib/auth';
import { noticesApi } from '@/lib/api/notices';
import { messagesApi } from '@/lib/api/messages';
import { deadlineApi } from '@/lib/api/deadline';
import { initializeCsrfToken } from '@/lib/csrf';
import { Notice } from '@/types/notice';
import { DeadlineAlert } from '@/types/deadline';
import { BillingProvider } from '@/contexts/BillingContext';
import PastDueModalWrapper from '@/components/billing/PastDueModalWrapper';
import TrialExpiryBanner from '@/components/billing/TrialExpiryBanner';
import { OfficeResponse } from '@/types/office';
import { getOfficeTypeLabel } from '@/lib/office-utils';
import { toast } from 'sonner';
import { FaHome, FaBars, FaTimes } from 'react-icons/fa';

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
  const [office, setOffice] = useState<OfficeResponse | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNoticeHovered, setIsNoticeHovered] = useState<boolean>(false);
  const [recentUnreadNotices, setRecentUnreadNotices] = useState<Notice[]>([]);
  const [noticesLoaded, setNoticesLoaded] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [deadlineAlerts, setDeadlineAlerts] = useState<DeadlineAlert[]>([]);
  const [deadlineAlertsLoaded, setDeadlineAlertsLoaded] = useState<boolean>(false);
  const [totalDeadlineAlerts, setTotalDeadlineAlerts] = useState<number>(0);
  const [deadlineAlertsShown, setDeadlineAlertsShown] = useState<boolean>(false);
  const [deadlineAlertsOffset, setDeadlineAlertsOffset] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showOfficeTooltip, setShowOfficeTooltip] = useState<boolean>(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // 期限アラート取得（全件）- ログイン時のトースト用
  const fetchDeadlineAlertsAll = async () => {
    try {
      const data = await deadlineApi.getAlerts({ threshold_days: 30 });
      return data.alerts;
    } catch (error) {
      console.error('期限アラートの取得に失敗しました', error);
      return [];
    }
  };

  // 期限アラート取得（最大10件）- ホバー時のポップオーバー用
  const fetchDeadlineAlerts = async (offset: number = 0) => {
    try {
      const data = await deadlineApi.getAlerts({ threshold_days: 30, limit: 10, offset });

      if (offset === 0) {
        // 初回取得時は上書き
        setDeadlineAlerts(data.alerts);
        setDeadlineAlertsLoaded(true);
      } else {
        // 追加取得時は既存データに追加
        setDeadlineAlerts(prev => [...prev, ...data.alerts]);
      }

      setTotalDeadlineAlerts(data.total);
      setDeadlineAlertsOffset(offset + data.alerts.length);
    } catch (error) {
      console.error('期限アラートの取得に失敗しました', error);
    }
  };

  // さらに表示ボタンのクリックハンドラー
  const handleLoadMoreDeadlineAlerts = () => {
    fetchDeadlineAlerts(deadlineAlertsOffset);
  };

  // ホバー時の処理
  const handleNoticeHover = () => {
    setIsNoticeHovered(true);
    if (unreadCount > 0) {
      fetchRecentUnreadNotices();
    }
    // 期限アラートも取得（初回のみ）
    if (!deadlineAlertsLoaded) {
      fetchDeadlineAlerts(0);
    }
  };

  useEffect(() => {
    // クライアント側でマウントされたことを検出
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);

    // CSRFトークンを初期化（ページリフレッシュ時に必要）
    initializeCsrfToken().catch(error => {
      console.error('CSRFトークンの初期化に失敗しました', error);
    });

    // 事業所情報が未取得の場合のみ取得
    if (!office) {
      officeApi.getMyOffice()
        .then(officeData => setOffice(officeData))
        .catch(error => {
          console.error('事業所情報の取得に失敗しました', error);
        });
    }

    // 初回の未読件数取得
    fetchUnreadCount();

    // 期限アラート取得とトースト表示（ログイン時のみ、1回だけ）
    if (!deadlineAlertsShown) {
      fetchDeadlineAlertsAll().then(alerts => {
        alerts.forEach(alert => {
          toast.warning(`${alert.full_name} 更新期限まで残り${alert.days_remaining}日`, {
            duration: 5000,
          });
        });
        setDeadlineAlertsShown(true);
      });
    }

    // 30秒ごとに未読件数を更新
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30秒

    // クリックアウェイでツールチップを閉じる
    const handleClickOutside = () => {
      if (showOfficeTooltip) {
        setShowOfficeTooltip(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [office, deadlineAlertsShown, showOfficeTooltip]);

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

  // 長押し開始
  const handleLongPressStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      setShowOfficeTooltip(true);
    }, 500); // 500ms長押しでツールチップ表示
  };

  // 長押し終了
  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // タップで遷移
  const handleOfficeTap = () => {
    handleLongPressEnd();
    setShowOfficeTooltip(false);
    router.push('/dashboard');
  };

  return (
    <BillingProvider>
      <PastDueModalWrapper />
      <Suspense fallback={null}>
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
          {/* Header */}
          <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left Side - Office Name / Icon */}
              <div className="flex items-center relative">
                {/* PC: テキスト表示 */}
                <Link href="/dashboard" className="hidden md:block text-lg font-semibold text-white hover:text-blue-400">
                  事務所名: {office ? `${office.name}${office.office_type ? `（${getOfficeTypeLabel(office.office_type, true)}）` : ''}` : '事務所名が登録されていません'}
                </Link>

                {/* Mobile: 家アイコンのみ */}
                <button
                  onClick={handleOfficeTap}
                  onTouchStart={handleLongPressStart}
                  onTouchEnd={handleLongPressEnd}
                  onMouseDown={handleLongPressStart}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  className="md:hidden text-2xl text-white hover:text-blue-400 transition-colors p-2 rounded-md hover:bg-gray-700"
                  aria-label="ホームに戻る"
                >
                  <FaHome />
                </button>

                {/* ツールチップ（モバイルのみ） */}
                {showOfficeTooltip && office && (
                  <div
                    className="md:hidden absolute top-full left-0 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap z-50 border border-gray-700"
                    onClick={() => setShowOfficeTooltip(false)}
                  >
                    {office.name}{office.office_type ? `（${getOfficeTypeLabel(office.office_type, true)}）` : ''}
                  </div>
                )}
              </div>

              {/* Right Side - Desktop Menu */}
              <div className="hidden md:flex items-center space-x-4" suppressHydrationWarning>
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
                  {isMounted && isNoticeHovered && ((unreadCount > 0 && recentUnreadNotices.length > 0) || deadlineAlerts.length > 0) && (
                    <div
                      className="absolute right-0 top-full mt-2 w-80 bg-[#0f1419] border border-[#2a2a3e] rounded-lg shadow-xl z-50 p-4"
                      onMouseEnter={() => setIsNoticeHovered(true)}
                      onMouseLeave={() => setIsNoticeHovered(false)}
                    >
                      {/* 未読通知セクション */}
                      {unreadCount > 0 && recentUnreadNotices.length > 0 && (
                        <>
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
                        </>
                      )}

                      {/* 期限アラートセクション */}
                      {deadlineAlerts.length > 0 && (
                        <>
                          <div className={`${unreadCount > 0 && recentUnreadNotices.length > 0 ? 'mt-3 pt-3 border-t border-gray-700' : ''}`}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-semibold text-sm">更新期限が近い利用者</h4>
                              <span className="text-xs text-gray-400">{totalDeadlineAlerts}件</span>
                            </div>
                            <div className="space-y-2">
                              {deadlineAlerts.map((alert) => (
                                <div
                                  key={alert.id}
                                  className="p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer border border-gray-700/50 flex items-center justify-between"
                                  onClick={() => router.push(`/support_plan/${alert.id}`)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-orange-400">⚠️</span>
                                    <span className="text-white text-sm">{alert.full_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm ${
                                      alert.days_remaining <= 15 ? 'text-red-400' :
                                      alert.days_remaining <= 25 ? 'text-orange-400' :
                                      'text-yellow-400'
                                    }`}>
                                      残り{alert.days_remaining}日
                                    </span>
                                    <span className="text-gray-500">→</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* さらに表示ボタン（まだ表示していないデータがある場合） */}
                          {deadlineAlertsOffset < totalDeadlineAlerts && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <button
                                onClick={handleLoadMoreDeadlineAlerts}
                                className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                              >
                                さらに表示
                              </button>
                            </div>
                          )}
                        </>
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

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
                aria-label="メニューを開く"
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-700">
                {user?.role === 'owner' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === '/admin'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    管理者設定
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  利用者ダッシュボード
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === '/profile'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  プロフィール
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push('/notice');
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                    pathname === '/notice'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span>通知/メッセージ</span>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  ログアウト
                </button>
              </div>
            )}
          </nav>
        </header>

        {/* Trial Expiry Banner */}
        <TrialExpiryBanner />

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
    </BillingProvider>
  );
}
