'use client';

import Image from 'next/image';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useBilling } from '@/contexts/BillingContext';
import { billingApi } from '@/lib/api/billing';
import { getBillingRestrictionReason, isTrialEnded } from '@/lib/billing/status';
import { BillingStatus } from '@/types/enums';

const paymentGuideImages = [
  { src: '/payment/f1.png', alt: '支払い方法変更手順 1', width: 1309, height: 847 },
  { src: '/payment/f2.png', alt: '支払い方法変更手順 2', width: 615, height: 529 },
  { src: '/payment/f3.png', alt: '支払い方法変更手順 3', width: 533, height: 410 },
  { src: '/payment/f4.png', alt: '支払い方法変更手順 4', width: 548, height: 430 },
  { src: '/payment/f5.png', alt: '支払い方法変更手順 5', width: 1293, height: 831 },
] as const;

/**
 * 管理画面「有料会員」タブコンポーネント
 *
 * 課金ステータス、無料試用期限、次回請求日、有料会員料金を表示し、
 * Stripe Checkout Session（有料会員登録）と
 * Stripe Customer Portal（支払い方法変更・解約）へのリンクを提供します。
 */
export default function PlanTab() {
  const { billingStatus, isLoading, error, refreshBillingStatus } = useBilling();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isCreatingPortal, setIsCreatingPortal] = useState(false);
  const [isPaymentGuideOpen, setIsPaymentGuideOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stripe Checkout Session作成（有料会員登録）
  const handleCreateCheckout = async () => {
    try {
      setIsCreatingCheckout(true);
      setErrorMessage(null);
      const { url } = await billingApi.createCheckoutSession();
      // Stripe Checkoutページへリダイレクト
      window.location.href = url;
    } catch (err) {
      console.error('Checkout Session作成エラー:', err);
      setErrorMessage(err instanceof Error ? err.message : '有料会員登録に失敗しました');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  // Stripe Customer Portal Session作成（支払い方法変更・解約）
  const handleCreatePortal = async () => {
    try {
      setIsCreatingPortal(true);
      setErrorMessage(null);
      const { url } = await billingApi.createPortalSession();
      // 新しいタブでStripe Customer Portalを開く
      window.open(url, '_blank', 'noopener,noreferrer');
      // 数秒後に課金ステータスを再取得（支払い方法変更の反映を確認）
      setTimeout(() => {
        refreshBillingStatus();
      }, 3000);
    } catch (err) {
      console.error('Portal Session作成エラー:', err);
      setErrorMessage(err instanceof Error ? err.message : '有料会員管理画面の表示に失敗しました');
    } finally {
      setIsCreatingPortal(false);
    }
  };

  const getStatusBadge = (status: BillingStatus) => {
    switch (status) {
      case BillingStatus.FREE:
        return {
          color: 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600',
          label: '無料試用中',
          icon: '🆓',
        };
      case BillingStatus.EARLY_PAYMENT:
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-500',
          label: '有料会員登録済み',
          icon: '💳',
        };
      case BillingStatus.ACTIVE:
        return {
          color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-500',
          label: '有料会員',
          icon: '✅',
        };
      case BillingStatus.PAST_DUE:
        return {
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-500',
          label: '支払い確認が必要',
          icon: '⚠️',
        };
      case BillingStatus.TRIAL_EXPIRED:
        return {
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-500',
          label: '無料期間終了',
          icon: '⚠️',
        };
      case BillingStatus.PAYMENT_FAILED:
        return {
          color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-500',
          label: '支払い失敗',
          icon: '⚠️',
        };
      case BillingStatus.CANCELING:
        return {
          color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-400 dark:border-orange-500',
          label: 'キャンセル予定',
          icon: '⏳',
        };
      case BillingStatus.CANCELED:
        return {
          color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-500',
          label: 'キャンセル済み',
          icon: '❌',
        };
      default:
        return {
          color: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
          label: '状態確認中',
          icon: 'ℹ️',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 font-medium">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 dark:text-gray-400">有料会員情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-6 font-medium text-red-900 shadow-sm dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-100">
        <p className="font-semibold text-red-800 dark:text-red-200">エラー</p>
        <p className="mt-2 text-red-700 dark:text-red-100">{error}</p>
        <button
          onClick={refreshBillingStatus}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (!billingStatus) {
    return (
      <div className="bg-white rounded-lg p-6 font-medium border border-slate-300 shadow-sm dark:bg-gray-700 dark:border-gray-600">
        <p className="text-slate-600 dark:text-gray-400">有料会員情報が取得できませんでした。</p>
      </div>
    );
  }

  const statusBadge = getStatusBadge(billingStatus.billing_status);
  const trialEndDate = new Date(billingStatus.trial_end_date);
  const now = new Date();
  const daysUntilTrialEnd = billingStatus.trial_days_remaining ?? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isTrialActive = billingStatus.billing_status === BillingStatus.FREE && daysUntilTrialEnd > 0;
  const isEarlyPayment = billingStatus.billing_status === BillingStatus.EARLY_PAYMENT && daysUntilTrialEnd > 0;
  const restrictionReason = getBillingRestrictionReason(billingStatus);
  const trialEnded = isTrialEnded(billingStatus);
  const showTrialExpiredWarning =
    billingStatus.billing_status === BillingStatus.TRIAL_EXPIRED ||
    (daysUntilTrialEnd < 0 && billingStatus.billing_status === BillingStatus.FREE);
  const showPaymentFailedWarning =
    billingStatus.billing_status === BillingStatus.PAYMENT_FAILED && trialEnded;
  const showPastDueWarning = billingStatus.billing_status === BillingStatus.PAST_DUE;
  const showCheckoutButton =
    billingStatus.billing_status === BillingStatus.FREE ||
    billingStatus.billing_status === BillingStatus.TRIAL_EXPIRED ||
    billingStatus.billing_status === BillingStatus.PAST_DUE ||
    billingStatus.billing_status === BillingStatus.CANCELED;
  const showPortalButton =
    billingStatus.billing_status === BillingStatus.EARLY_PAYMENT ||
    billingStatus.billing_status === BillingStatus.ACTIVE ||
    billingStatus.billing_status === BillingStatus.PAYMENT_FAILED ||
    billingStatus.billing_status === BillingStatus.PAST_DUE ||
    billingStatus.billing_status === BillingStatus.CANCELING;
  const portalButtonLabel =
    restrictionReason === 'payment_failed' ? '支払い方法を更新する' : '支払い方法の変更・解約';

  return (
    <div className="space-y-6 font-medium">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">有料会員管理</h2>
        <button
          onClick={refreshBillingStatus}
          className="text-blue-400 hover:text-blue-300 text-base font-semibold flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          更新
        </button>
      </div>

      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900 shadow-sm dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-100">
          <p className="text-base font-semibold text-red-800 dark:text-red-200">{errorMessage}</p>
        </div>
      )}

      {/* 現在の有料会員情報 */}
      <div className="bg-white rounded-lg p-6 font-medium border border-slate-300 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4">現在のステータス</h3>

        <div className="space-y-4">
          {/* 課金ステータス */}
          <div>
            <p className="text-slate-600 dark:text-gray-400 text-base font-semibold mb-2">ステータス</p>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-base font-semibold border ${statusBadge.color}`}>
              <span>{statusBadge.icon}</span>
              <span>{statusBadge.label}</span>
            </span>
          </div>

          {/* 課金処理日 */}
          {billingStatus.subscription_start_date && (
            <div>
              <p className="text-slate-600 dark:text-gray-400 text-base font-semibold mb-2">課金処理日</p>
              <p className="text-slate-900 dark:text-white font-semibold">
                {new Date(billingStatus.subscription_start_date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* スケジュールされたキャンセル日時 */}
          {billingStatus.scheduled_cancel_at && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 dark:bg-orange-900/20 dark:border-orange-500/30">
              <p className="text-orange-700 text-base font-semibold mb-2 dark:text-orange-400">キャンセル予定</p>
              <p className="text-slate-900 dark:text-white text-lg font-bold">
                {new Date(billingStatus.scheduled_cancel_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-slate-600 dark:text-gray-400 text-sm mt-2">
                この日時に有料会員登録が自動的にキャンセルされます
              </p>
            </div>
          )}

          {/* 無料試用期限 */}
          {isTrialActive && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-500/30">
              <p className="text-blue-700 text-base font-semibold mb-2 dark:text-blue-400">無料試用中</p>
              <p className="text-slate-900 dark:text-white text-lg font-bold">
                残り {daysUntilTrialEnd} 日
              </p>
              <p className="text-slate-600 dark:text-gray-400 text-base font-semibold mt-1">
                無料試用終了日: {trialEndDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* 早期支払い完了（無料期間残り） */}
          {isEarlyPayment && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-500/30">
              <p className="text-green-700 text-base font-semibold mb-2 dark:text-green-400">課金完了</p>
              <p className="text-slate-900 dark:text-white text-lg font-bold">
                無料期間終了まで残り {daysUntilTrialEnd} 日
              </p>
              <p className="text-slate-600 dark:text-gray-400 text-base font-semibold mt-1">
                無料期間終了日: {trialEndDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-slate-600 dark:text-gray-400 text-sm mt-2">
                無料期間終了後、自動的に有料会員料金のお支払いが開始されます
              </p>
            </div>
          )}

          {/* 次回請求日 */}
          {billingStatus.next_billing_date && (
            <div>
              <p className="text-slate-600 dark:text-gray-400 text-base font-semibold mb-2">次回請求予定日</p>
              <p className="text-slate-900 dark:text-white font-semibold">
                {new Date(billingStatus.next_billing_date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* 有料会員料金 */}
          <div>
            <p className="text-slate-600 dark:text-gray-400 text-base font-semibold mb-2">月額料金</p>
            <p className="text-slate-900 dark:text-white text-2xl font-bold">
              ¥{billingStatus.current_plan_amount.toLocaleString()}
              <span className="text-slate-600 dark:text-gray-400 text-base font-medium ml-2">/月</span>
            </p>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="bg-white rounded-lg p-6 font-medium border border-slate-300 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4">有料会員管理</h3>

        {/* 無料試用期限切れの警告（有料会員登録前） */}
        {showTrialExpiredWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 dark:bg-yellow-900/50 dark:border-yellow-500">
            <p className="text-yellow-700 font-semibold flex items-center gap-2 dark:text-yellow-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              無料試用期間は終了しています
            </p>
            <p className="text-yellow-700 text-base font-semibold mt-2 dark:text-yellow-300">
              有料会員登録が完了するまで、一部の操作が制限されています。有料会員に入会した場合、制限は解除されます。
            </p>
          </div>
        )}

        {/* 支払い失敗の警告 */}
        {showPaymentFailedWarning && (
          <div className="bg-red-50 font-medium border border-red-200 rounded-lg p-4 mb-4 dark:bg-red-900/50 dark:border-red-500">
            <p className="text-red-700 font-semibold flex items-center gap-2 dark:text-red-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              有料会員料金のお支払いが失敗しています
            </p>
            <p className="text-red-700 text-base font-semibold mt-2 dark:text-red-300">
              サービスの利用が制限されています。支払い方法を更新し、請求処理を完了してください。
            </p>
          </div>
        )}

        {/* legacy past_due の警告 */}
        {showPastDueWarning && (
          <div className="bg-red-50 font-medium border border-red-200 rounded-lg p-4 mb-4 dark:bg-red-900/50 dark:border-red-500">
            <p className="text-red-700 font-semibold flex items-center gap-2 dark:text-red-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              お支払いの確認が必要です
            </p>
            <p className="text-red-700 text-base font-semibold mt-2 dark:text-red-300">
              サービスの利用が制限されています。有料会員管理または支払い方法を確認してください。
            </p>
          </div>
        )}

        <div className="space-y-3">
          {/* 有料会員登録ボタン（free、trial_expired、legacy past_due、canceledの場合のみ表示） */}
          {showCheckoutButton && (
            <button
              onClick={handleCreateCheckout}
              disabled={isCreatingCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isCreatingCheckout ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  処理中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  有料会員に登録する
                </>
              )}
            </button>
          )}

          {/* 支払い方法変更・解約ボタン（early_payment, active, payment_failed, legacy past_due, cancelingの場合のみ表示） */}
          {showPortalButton && (
            <div className="space-y-2">
              <button
                onClick={handleCreatePortal}
                disabled={isCreatingPortal}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-600 dark:text-white"
              >
                {isCreatingPortal ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    処理中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {portalButtonLabel}
                  </>
                )}
              </button>
              <p className="text-left text-sm text-slate-600 dark:text-gray-400">
                ※ページが遷移しない場合は、ブラウザによってポップアップがブロックされていないか確認してください。
              </p>
              <button
                type="button"
                onClick={() => setIsPaymentGuideOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:focus:ring-offset-gray-900"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.008v.008H3.75V6.75zm0 5.25h.008v.008H3.75V12zm0 5.25h.008v.008H3.75v-.008z" />
                </svg>
                支払い方法変更の手順を見る
              </button>
            </div>
          )}
        </div>

        <p className="text-slate-600 dark:text-gray-400 text-sm mt-4">
          有料会員登録の管理はStripeの安全な決済ページで行われます。
        </p>
      </div>

      <Modal
        isOpen={isPaymentGuideOpen}
        onClose={() => setIsPaymentGuideOpen(false)}
        title="支払い方法変更の手順"
        size="2xl"
      >
        <div className="space-y-5">
          <p className="text-2xl font-semibold leading-relaxed text-slate-600 dark:text-gray-300 sm:text-3xl">
            上から順番に確認してください。画像はスクロールして最後まで確認できます。
          </p>
          <div className="space-y-6">
            {paymentGuideImages.map((image, index) => (
              <figure key={image.src} className="space-y-2">
                <figcaption className="text-2xl font-semibold leading-relaxed text-slate-700 dark:text-gray-200 sm:text-3xl">
                  手順 {index + 1}
                </figcaption>
                {index === 4 && (
                  <p className="text-2xl font-semibold leading-relaxed text-slate-600 dark:text-gray-300 sm:text-3xl">
                    この画面に遷移確認できた場合は支払い方法変更できております。再度画面に戻って支払い状況を確認してください。
                  </p>
                )}
                <div className="mx-auto max-w-full overflow-hidden rounded-lg border border-slate-300 bg-slate-50 dark:border-gray-700 dark:bg-gray-900 sm:max-w-[67%]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    className="h-auto w-full"
                    sizes="(max-width: 768px) 100vw, 1024px"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
