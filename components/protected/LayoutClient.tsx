'use client';

import { useState, useEffect, ReactNode, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, officeApi } from '@/lib/auth';
import { noticesApi } from '@/lib/api/notices';
import { messagesApi } from '@/lib/api/messages';
import { deadlineApi } from '@/lib/api/deadline';
import { initializeCsrfToken } from '@/lib/csrf';
import { DeadlineAlert } from '@/types/deadline';
import { MessageInboxItem } from '@/types/message';
import { BillingProvider } from '@/contexts/BillingContext';
import PastDueModalWrapper from '@/components/billing/PastDueModalWrapper';
import TrialExpiryBanner from '@/components/billing/TrialExpiryBanner';
import { OfficeResponse } from '@/types/office';
import { getOfficeTypeLabel } from '@/lib/office-utils';
import { toast } from 'sonner';
import { FaHome, FaBars, FaTimes } from 'react-icons/fa';
import { MdKeyboardArrowDown, MdWarning } from 'react-icons/md';
import { usePushNotification } from '@/hooks/usePushNotification';
import { http } from '@/lib/http';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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
  const [isNoticePopoverOpen, setIsNoticePopoverOpen] = useState<boolean>(false);
  const [recentUnreadMessages, setRecentUnreadMessages] = useState<MessageInboxItem[]>([]);
  const [isDeadlinePanelOpen, setIsDeadlinePanelOpen] = useState<boolean>(false);
  const [isDeadlineDrawerOpen, setIsDeadlineDrawerOpen] = useState<boolean>(false);
  const [showDeadlineDrawerHint, setShowDeadlineDrawerHint] = useState<boolean>(false);
  const [messagesLoaded, setMessagesLoaded] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [deadlineAlerts, setDeadlineAlerts] = useState<DeadlineAlert[]>([]);
  const [deadlineAlertsLoaded, setDeadlineAlertsLoaded] = useState<boolean>(false);
  const [totalDeadlineAlerts, setTotalDeadlineAlerts] = useState<number>(0);
  const [deadlineAlertsOffset, setDeadlineAlertsOffset] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showOfficeTooltip, setShowOfficeTooltip] = useState<boolean>(false);
  const noticePopoverRef = useRef<HTMLDivElement | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const unreadCountIntervalRef = useRef<number | null>(null);
  const deadlineAlertsShownRef = useRef<boolean>(false);
  const deadlineDrawerHintShownRef = useRef<boolean>(false);
  const deadlineAlertsSessionKey = 'keikakun_deadline_alerts_toast_shown';

  // Push通知の自動購読機能
  const { isSupported, isSubscribed, subscribe, isPWA, isIOS } = usePushNotification();

  // 未読通知件数を取得（notices + messages）
  const fetchUnreadCount = async () => {
    try {
      const [noticesData, messagesData] = await Promise.all([
        noticesApi.getUnreadCount(),
        messagesApi.getUnreadCount(),
      ]);
      const totalUnread = noticesData.unread_count + messagesData.unread_count;
      setUnreadCount(totalUnread);
    } catch {
    }
  };

  // 最新の未読メッセージを取得（最大3件）
  const fetchRecentUnreadMessages = async () => {
    if (messagesLoaded) return;

    try {
      const data = await messagesApi.getInbox({ is_read: false, limit: 3 });
      setRecentUnreadMessages(data.messages.slice(0, 3));
      setMessagesLoaded(true);
    } catch {
    }
  };

  // 更新期限のお知らせ取得（全件）- ログイン時の通知用
  const fetchDeadlineAlertsAll = async (): Promise<DeadlineAlert[] | null> => {
    try {
      const data = await deadlineApi.getAlerts({ threshold_days: 30 });
      return data.alerts;
    } catch {
      return null;
    }
  };

  const showDeadlineAlertSummaryToasts = (alerts: DeadlineAlert[]) => {
    const overdueCount = alerts.filter((alert) => alert.alert_type === 'renewal_overdue').length;
    const deadlineCount = alerts.filter((alert) => alert.alert_type === 'renewal_deadline').length;
    const assessmentIncompleteCount = alerts.filter(
      (alert) => alert.alert_type === 'assessment_incomplete'
    ).length;

    if (overdueCount > 0) {
      toast.error(`更新期限が過ぎている利用者が${overdueCount}件あります`, { duration: 7000 });
    }

    if (deadlineCount > 0) {
      toast.warning(`更新期限が近い利用者が${deadlineCount}件あります`, { duration: 7000 });
    }

    if (assessmentIncompleteCount > 0) {
      toast.warning(`アセスメント未完了の利用者が${assessmentIncompleteCount}件あります`, {
        duration: 7000,
      });
    }
  };

  // 更新期限のお知らせ取得（最大10件）- ホバー時のポップオーバー用
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
    } catch {
    }
  };

  // さらに表示ボタンのクリックハンドラー
  const handleLoadMoreDeadlineAlerts = () => {
    fetchDeadlineAlerts(deadlineAlertsOffset);
  };

  const hasDeadlineAttention = totalDeadlineAlerts > 0 || deadlineAlerts.length > 0;

  const getDeadlineAlertStatusText = (alert: DeadlineAlert) => {
    if (alert.alert_type === 'assessment_incomplete') {
      return 'アセスメント未完了';
    }
    if (alert.alert_type === 'renewal_overdue') {
      return '期限切れ';
    }
    return `残り${alert.days_remaining}日`;
  };

  // 通知/メッセージプレビューを開く
  const handleNoticeToggle = () => {
    setIsNoticePopoverOpen((isOpen) => !isOpen);
    fetchRecentUnreadMessages();
    // 更新期限のお知らせも取得（初回のみ）
    if (!deadlineAlertsLoaded) {
      fetchDeadlineAlerts(0);
    }
  };

  // 初回マウント時のみ実行: CSRF初期化、事業所情報取得、トースト表示、未読件数更新
  // 依存配列を空にすることで、トーストの重複表示を防止
  useEffect(() => {
    // クライアント側でマウントされたことを検出
    setIsMounted(true);

    // CSRFトークンを初期化（ページリフレッシュ時に必要）
    initializeCsrfToken().catch(() => {});

    // 事業所情報が未取得の場合のみ取得
    if (!office) {
      officeApi.getMyOffice()
        .then(officeData => setOffice(officeData))
        .catch(() => {});
    }

    // 通知設定を取得し、トースト表示とPush購読を実行（ログイン時のみ、1回だけ）
    const initializeNotifications = async () => {
      try {
        // 通知設定を取得
        const preferences = await http.get<{
          in_app_notification: boolean;
          email_notification: boolean;
          system_notification: boolean;
          email_threshold_days: number;
          push_threshold_days: number;
        }>('/api/v1/staffs/me/notification-preferences');

        const hasShownDeadlineAlertsInSession =
          typeof window !== 'undefined' &&
          window.sessionStorage.getItem(deadlineAlertsSessionKey) === 'true';

        // アプリ内通知がONの場合のみ、ブラウザセッションごとに1回だけ更新期限のお知らせを表示
        if (
          preferences.in_app_notification &&
          !deadlineAlertsShownRef.current &&
          !hasShownDeadlineAlertsInSession
        ) {
          deadlineAlertsShownRef.current = true;
          const alerts = await fetchDeadlineAlertsAll();
          if (alerts !== null) {
            window.sessionStorage.setItem(deadlineAlertsSessionKey, 'true');
            showDeadlineAlertSummaryToasts(alerts);
          } else {
            deadlineAlertsShownRef.current = false;
          }
        }

        // system_notification=trueかつ未購読の場合のみPush通知を購読
        // iOS Safari（PWAモードでない）の場合はスキップ
        if (
          preferences.system_notification &&
          !isSubscribed &&
          isSupported &&
          !(isIOS && !isPWA)
        ) {
          await subscribe();
        }
      } catch {
        // エラー時も処理を継続（ユーザー体験に影響を与えない）
      }
    };

    const notificationInitTimer = window.setTimeout(() => {
      fetchUnreadCount();
      fetchDeadlineAlerts(0);
      initializeNotifications();
    }, 1200);

    // 初期描画後に30秒ごとの未読件数更新を開始
    const intervalStartTimer = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      unreadCountIntervalRef.current = interval;
    }, 1200);

    return () => {
      window.clearTimeout(notificationInitTimer);
      window.clearTimeout(intervalStartTimer);
      if (unreadCountIntervalRef.current) {
        window.clearInterval(unreadCountIntervalRef.current);
        unreadCountIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isMounted || !hasDeadlineAttention || deadlineDrawerHintShownRef.current) {
      return;
    }

    deadlineDrawerHintShownRef.current = true;
    setShowDeadlineDrawerHint(true);

    const timer = setTimeout(() => {
      setShowDeadlineDrawerHint(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [hasDeadlineAttention, isMounted]);

  // イベントリスナー管理: ツールチップ/通知プレビューのクリックアウトサイド処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (showOfficeTooltip) {
        setShowOfficeTooltip(false);
      }
      if (
        isNoticePopoverOpen &&
        noticePopoverRef.current &&
        event.target instanceof Node &&
        !noticePopoverRef.current.contains(event.target)
      ) {
        setIsNoticePopoverOpen(false);
        setIsDeadlinePanelOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isNoticePopoverOpen, showOfficeTooltip]);

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
    } catch {
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
        <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col dark:bg-gray-900 dark:text-gray-100">
          {/* Header */}
          <header className="bg-white border-b border-slate-300 sticky top-0 z-10 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left Side - Office Name / Icon */}
              <div className="flex items-center relative">
                {/* PC: テキスト表示 */}
                <Link href="/dashboard" className="hidden md:block text-xl font-bold text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-400">
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
                  className="md:hidden text-2xl text-slate-900 hover:text-blue-700 transition-colors p-2 rounded-md hover:bg-slate-100 dark:text-white dark:hover:text-blue-400 dark:hover:bg-gray-700"
                  aria-label="ホームに戻る"
                >
                  <FaHome />
                </button>

                {/* ツールチップ（モバイルのみ） */}
                {showOfficeTooltip && office && (
                  <div
                    className="md:hidden absolute top-full left-0 mt-2 px-3 py-2 bg-white text-slate-900 text-base font-semibold rounded-md shadow-lg whitespace-nowrap z-50 border border-slate-300 dark:bg-gray-900 dark:text-white dark:border-gray-700"
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
                    className={`text-base font-semibold px-4 py-2.5 rounded-md transition-colors ${
                      pathname === '/admin'
                        ? 'bg-blue-50 text-blue-800 border-b-2 border-blue-600 dark:bg-gray-700 dark:text-white dark:border-blue-500'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                    }`}
                  >
                    管理者設定
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className={`text-base font-semibold px-4 py-2.5 rounded-md transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-blue-50 text-blue-800 border-b-2 border-blue-600 dark:bg-gray-700 dark:text-white dark:border-blue-500'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  利用者ダッシュボード
                </Link>
                <Link
                  href="/profile"
                  className={`text-base font-semibold px-4 py-2.5 rounded-md transition-colors ${
                    pathname === '/profile'
                      ? 'bg-blue-50 text-blue-800 border-b-2 border-blue-600 dark:bg-gray-700 dark:text-white dark:border-blue-500'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  プロフィール
                </Link>
                <div className="relative" ref={noticePopoverRef}>
                  <button
                    type="button"
                    onClick={handleNoticeToggle}
                    className={`relative flex flex-col items-center gap-1 p-2 rounded-md transition-colors ${
                      pathname === '/notice' || isNoticePopoverOpen
                        ? 'bg-blue-50 text-blue-800 dark:bg-gray-700 dark:text-white'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
                    }`}
                    aria-expanded={isNoticePopoverOpen}
                    aria-label={unreadCount > 0 ? `${unreadCount}件の未読通知があります` : '通知'}
                  >
                    <div className="relative">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {/* 未読通知がある場合のみ赤い丸を表示 */}
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                      )}
                    </div>
                    <span className="text-base font-semibold">通知/メッセージ</span>
                  </button>

                  {/* 通知プレビューポップオーバー */}
                  {isMounted && isNoticePopoverOpen && (
                    <div
                      className="absolute right-0 top-full z-50 w-[360px] pt-2"
                    >
                      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-xl dark:border-[#2a2a3e] dark:bg-[#0f1419]">
                        <div className="mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsNoticePopoverOpen(false);
                              setIsDeadlinePanelOpen(false);
                            }}
                            className="rounded-md px-2 py-1 text-base font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                            aria-label="通知/メッセージを閉じる"
                          >
                            閉じる
                          </button>
                          <h4 className="text-center text-base font-semibold text-slate-900 dark:text-white">
                            通知/メッセージ
                          </h4>
                          <span className="text-sm font-semibold text-slate-500 dark:text-gray-400">
                            未読 {recentUnreadMessages.length}件
                          </span>
                        </div>
                        <div className="mb-3 border-b border-slate-200 pb-3 dark:border-gray-700">
                          <button
                            onClick={() => router.push('/notice')}
                            className="w-full rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-center text-base font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                          >
                            通知/メッセージ画面を開く
                          </button>
                        </div>

                        <div className="mb-3 rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-600/60 dark:bg-yellow-950/20">
                          <button
                            type="button"
                            onClick={() => setIsDeadlinePanelOpen((isOpen) => !isOpen)}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
                            aria-expanded={isDeadlinePanelOpen}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="truncate text-base font-semibold text-slate-900 dark:text-white">
                                更新期限・アセスメント
                              </span>
                              <span className="shrink-0 text-sm font-semibold text-slate-600 dark:text-gray-300">
                                {totalDeadlineAlerts}件
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-1">
                              <MdKeyboardArrowDown
                                className={`h-6 w-6 text-slate-600 transition-transform duration-300 dark:text-gray-300 ${isDeadlinePanelOpen ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                              />
                            </span>
                          </button>

                          <div
                            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isDeadlinePanelOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                          >
                            <div className="overflow-hidden">
                              <div className="space-y-2 border-t border-yellow-200 p-3 dark:border-yellow-700/50">
                                {deadlineAlerts.length > 0 ? (
                                  <>
                                    {deadlineAlerts.map((alert, index) => (
                                      <div
                                        key={`${alert.id}-${alert.alert_type || 'renewal'}-${index}`}
                                        className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-100 dark:border-gray-700/50 dark:bg-gray-800/70 dark:hover:bg-gray-800"
                                        onClick={() => router.push(`/support_plan/${alert.id}`)}
                                      >
                                        <div className="flex min-w-0 items-center gap-2">
                                          <span className="truncate text-base font-semibold text-slate-900 dark:text-white">{alert.full_name}</span>
                                        </div>
                                        <div className="ml-2 flex shrink-0 items-center gap-2">
                                          {alert.alert_type === 'assessment_incomplete' ? (
                                            <span className="text-base font-semibold text-red-500 dark:text-red-400">アセスメント未完了</span>
                                          ) : alert.alert_type === 'renewal_overdue' ? (
                                            <span className="text-base font-semibold text-red-500 dark:text-red-400">期限切れ</span>
                                          ) : (
                                            <span className={`text-base font-semibold ${
                                              (alert.days_remaining ?? 0) <= 15 ? 'text-red-500 dark:text-red-400' :
                                              (alert.days_remaining ?? 0) <= 25 ? 'text-orange-500 dark:text-orange-400' :
                                              'text-yellow-600 dark:text-yellow-400'
                                            }`}>
                                              残り{alert.days_remaining}日
                                            </span>
                                          )}
                                          <span className="text-gray-500">→</span>
                                        </div>
                                      </div>
                                    ))}
                                    {deadlineAlertsOffset < totalDeadlineAlerts && (
                                      <div className="pt-1">
                                        <button
                                          onClick={handleLoadMoreDeadlineAlerts}
                                          className="w-full rounded-md border border-yellow-300 py-2 text-center text-base font-semibold text-yellow-700 transition-colors hover:bg-yellow-100 dark:border-yellow-700/60 dark:text-yellow-300 dark:hover:bg-yellow-950/40"
                                        >
                                          さらに表示
                                        </button>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <p className="rounded-lg border border-slate-200 bg-white p-4 text-center text-base font-semibold text-slate-600 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-300">
                                    更新期限が近い利用者はいません
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <h5 className="text-base font-semibold text-slate-900 dark:text-white">未読メッセージ</h5>
                            <span className="text-base font-semibold text-slate-500 dark:text-gray-400">{recentUnreadMessages.length}件</span>
                          </div>
                          {recentUnreadMessages.length > 0 ? (
                            <div className="space-y-2">
                              {recentUnreadMessages.map((message) => (
                                <div
                                  key={message.message_id}
                                  className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:bg-gray-800"
                                  onClick={() => router.push('/notice')}
                                >
                                  <div className="mb-1 flex items-start justify-between gap-2">
                                    <h5 className="line-clamp-1 text-base font-semibold text-slate-900 dark:text-white">{message.title}</h5>
                                    <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-blue-500"></span>
                                  </div>
                                  <p className="mb-2 line-clamp-2 text-base font-semibold text-slate-600 dark:text-gray-400">{message.content}</p>
                                  <time className="text-base font-semibold text-slate-500 dark:text-gray-500">
                                    {new Date(message.created_at).toLocaleString('ja-JP', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </time>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-base font-semibold text-slate-600 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-300">
                              未読メッセージはありません
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <ThemeToggle />
                <button
                  onClick={handleLogout}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-md text-base font-semibold border border-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
                >
                  ログアウト
                </button>
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-slate-900 p-2 rounded-md hover:bg-slate-100 transition-colors dark:text-white dark:hover:bg-gray-700"
                aria-label="メニューを開く"
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden py-4 border-t border-slate-200 dark:border-gray-700">
                {user?.role === 'owner' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 text-base font-semibold rounded-md transition-colors ${
                      pathname === '/admin'
                        ? 'bg-blue-50 text-blue-800 dark:bg-gray-700 dark:text-white'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                    }`}
                  >
                    管理者設定
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 text-base font-semibold rounded-md transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-blue-50 text-blue-800 dark:bg-gray-700 dark:text-white'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  利用者ダッシュボード
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 text-base font-semibold rounded-md transition-colors ${
                    pathname === '/profile'
                      ? 'bg-blue-50 text-blue-800 dark:bg-gray-700 dark:text-white'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  プロフィール
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push('/notice');
                  }}
                  className={`w-full text-left px-4 py-3 text-base font-semibold rounded-md transition-colors flex items-center gap-2 ${
                    pathname === '/notice'
                      ? 'bg-blue-50 text-blue-800 dark:bg-gray-700 dark:text-white'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    通知/メッセージ
                  </span>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-base font-bold leading-none text-white bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <div className="px-4 py-2">
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-3 text-base font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-md transition-colors dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  ログアウト
                </button>
              </div>
            )}
          </nav>
        </header>

        {isMounted && hasDeadlineAttention && (
          <aside className="fixed right-4 top-28 z-40 hidden md:block">
            <div
              className={`relative transition-all duration-300 ease-in-out ${
                isDeadlineDrawerOpen ? 'w-80' : 'w-44'
              }`}
            >
              {!isDeadlineDrawerOpen ? (
                <button
                  type="button"
                  onClick={() => setIsDeadlineDrawerOpen(true)}
                  className="relative ml-auto flex h-16 w-24 items-center justify-center border-4 border-yellow-500 bg-yellow-100 text-yellow-950 shadow-lg transition-colors hover:bg-yellow-200 dark:border-yellow-400 dark:bg-yellow-900/80 dark:text-yellow-50 dark:hover:bg-yellow-800"
                  aria-label="更新期限アラートを開く"
                >
                  {showDeadlineDrawerHint && (
                    <span className="pointer-events-none absolute -top-11 right-0 w-44 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-center text-sm font-semibold text-slate-900 shadow-md dark:border-yellow-700/60 dark:bg-yellow-950 dark:text-white">
                      更新期限が迫っています
                      <span className="absolute -bottom-1 right-8 h-2 w-2 rotate-45 border-b border-r border-yellow-300 bg-yellow-50 dark:border-yellow-700/60 dark:bg-yellow-950" />
                    </span>
                  )}
                  <MdWarning className="absolute -top-3 left-1 h-6 w-6 text-yellow-500" aria-hidden="true" />
                  <span className="flex flex-col items-center text-sm font-bold leading-tight text-yellow-950 dark:text-yellow-50">
                    <span>更新が必要な</span>
                    <span>利用者</span>
                  </span>
                </button>
              ) : (
                <div className="max-h-[60vh] overflow-hidden rounded-md border border-yellow-300 bg-yellow-50 shadow-xl transition-all duration-300 ease-in-out dark:border-yellow-700/60 dark:bg-yellow-950/20">
                  <button
                    type="button"
                    onClick={() => setIsDeadlineDrawerOpen(false)}
                    className="absolute left-1 top-1 z-10 flex h-7 w-14 items-center justify-center rounded text-sm font-semibold leading-none text-red-700 transition-colors hover:bg-yellow-100 dark:text-red-400 dark:hover:bg-yellow-950/40"
                    aria-label="更新期限アラートを閉じる"
                  >
                    閉じる
                  </button>
                  <div className="flex items-center justify-between gap-3 border-b border-yellow-200 px-4 py-3 pl-16 dark:border-yellow-700/50">
                    <h4 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                      更新期限・アセスメント
                    </h4>
                    <span className="shrink-0 text-sm font-semibold text-slate-600 dark:text-gray-300">
                      {totalDeadlineAlerts}件
                    </span>
                  </div>
                  <div className="max-h-[calc(60vh-48px)] space-y-2 overflow-y-auto p-3">
                    {deadlineAlerts.map((alert, index) => (
                      <button
                        key={`${alert.id}-${alert.alert_type || 'renewal'}-drawer-${index}`}
                        type="button"
                        onClick={() => router.push(`/support_plan/${alert.id}`)}
                        className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:bg-slate-100 dark:border-gray-700/50 dark:bg-gray-800/70 dark:hover:bg-gray-800"
                      >
                        <span className="min-w-0 truncate text-base font-semibold text-slate-900 dark:text-white">
                          {alert.full_name}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-base font-semibold text-red-500 dark:text-red-400">
                            {getDeadlineAlertStatusText(alert)}
                          </span>
                          <span className="text-gray-500">→</span>
                        </span>
                      </button>
                    ))}
                    {deadlineAlertsOffset < totalDeadlineAlerts && (
                      <button
                        type="button"
                        onClick={handleLoadMoreDeadlineAlerts}
                        className="w-full rounded-md border border-yellow-300 bg-white py-2 text-center text-base font-semibold text-yellow-700 transition-colors hover:bg-yellow-100 dark:border-yellow-700/60 dark:bg-gray-800/70 dark:text-yellow-300 dark:hover:bg-yellow-950/40"
                      >
                        さらに表示
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Trial Expiry Banner */}
        <TrialExpiryBanner />

        {/* Main Content */}
        <main className="flex-grow container mx-auto p-6 md:p-8 bg-white text-slate-900 rounded-lg shadow-md my-6 dark:bg-gray-800 dark:text-gray-100">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-300 dark:bg-gray-800 dark:border-gray-700">
          <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-base font-semibold text-slate-600 dark:text-gray-300">
              © {new Date().getFullYear()} ケイカくん. All rights reserved.
            </p>
          </div>
        </footer>
        </div>
      </Suspense>
    </BillingProvider>
  );
}
