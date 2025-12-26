'use client';

import { useState } from 'react';
import { useBilling } from '@/contexts/BillingContext';
import { billingApi } from '@/lib/api/billing';
import { BillingStatus } from '@/types/enums';

/**
 * 管理画面「プラン」タブコンポーネント
 *
 * 課金ステータス、トライアル期限、次回請求日、プラン料金を表示し、
 * Stripe Checkout Session（サブスク登録）と
 * Stripe Customer Portal（支払い方法変更・解約）へのリンクを提供します。
 */
export default function PlanTab() {
  const { billingStatus, isLoading, error, refreshBillingStatus } = useBilling();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isCreatingPortal, setIsCreatingPortal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stripe Checkout Session作成（サブスク登録）
  const handleCreateCheckout = async () => {
    try {
      setIsCreatingCheckout(true);
      setErrorMessage(null);
      const { url } = await billingApi.createCheckoutSession();
      // Stripe Checkoutページへリダイレクト
      window.location.href = url;
    } catch (err) {
      console.error('Checkout Session作成エラー:', err);
      setErrorMessage(err instanceof Error ? err.message : 'サブスクリプション登録に失敗しました');
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
      setErrorMessage(err instanceof Error ? err.message : 'サブスクリプション管理画面の表示に失敗しました');
    } finally {
      setIsCreatingPortal(false);
    }
  };

  const getStatusBadge = (status: BillingStatus) => {
    switch (status) {
      case BillingStatus.FREE:
        return {
          color: 'bg-gray-700 text-gray-300 border-gray-600',
          label: '無料トライアル中',
          icon: '🆓',
        };
      case BillingStatus.EARLY_PAYMENT:
        return {
          color: 'bg-blue-900/50 text-blue-400 border-blue-500',
          label: '課金完了',
          icon: '💳',
        };
      case BillingStatus.ACTIVE:
        return {
          color: 'bg-green-900/50 text-green-400 border-green-500',
          label: '課金設定済み',
          icon: '✅',
        };
      case BillingStatus.PAST_DUE:
        return {
          color: 'bg-yellow-900/50 text-yellow-400 border-yellow-500',
          label: '支払い遅延',
          icon: '⚠️',
        };
      case BillingStatus.CANCELING:
        return {
          color: 'bg-orange-900/50 text-orange-400 border-orange-500',
          label: 'キャンセル予定',
          icon: '⏳',
        };
      case BillingStatus.CANCELED:
        return {
          color: 'bg-red-900/50 text-red-400 border-red-500',
          label: 'キャンセル済み',
          icon: '❌',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">プラン情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 rounded-lg p-6">
        <p className="text-red-400 font-semibold">エラー</p>
        <p className="text-red-300 mt-2">{error}</p>
        <button
          onClick={refreshBillingStatus}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (!billingStatus) {
    return (
      <div className="bg-gray-700 rounded-lg p-6">
        <p className="text-gray-400">プラン情報が取得できませんでした。</p>
      </div>
    );
  }

  const statusBadge = getStatusBadge(billingStatus.billing_status);
  const trialEndDate = new Date(billingStatus.trial_end_date);
  const now = new Date();
  const daysUntilTrialEnd = billingStatus.trial_days_remaining ?? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isTrialActive = billingStatus.billing_status === BillingStatus.FREE && daysUntilTrialEnd > 0;
  const isEarlyPayment = billingStatus.billing_status === BillingStatus.EARLY_PAYMENT && daysUntilTrialEnd > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">プラン管理</h2>
        <button
          onClick={refreshBillingStatus}
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          更新
        </button>
      </div>

      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* 現在のプラン情報 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">現在のステータス</h3>

        <div className="space-y-4">
          {/* 課金ステータス */}
          <div>
            <p className="text-gray-400 text-sm mb-2">ステータス</p>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${statusBadge.color}`}>
              <span>{statusBadge.icon}</span>
              <span>{statusBadge.label}</span>
            </span>
          </div>

          {/* 課金処理日 */}
          {billingStatus.subscription_start_date && (
            <div>
              <p className="text-gray-400 text-sm mb-2">課金処理日</p>
              <p className="text-white font-semibold">
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
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <p className="text-orange-400 text-sm font-semibold mb-2">キャンセル予定</p>
              <p className="text-white text-lg font-bold">
                {new Date(billingStatus.scheduled_cancel_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                この日時にサブスクリプションが自動的にキャンセルされます
              </p>
            </div>
          )}

          {/* トライアル期限 */}
          {isTrialActive && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-400 text-sm font-semibold mb-2">無料トライアル中</p>
              <p className="text-white text-lg font-bold">
                残り {daysUntilTrialEnd} 日
              </p>
              <p className="text-gray-400 text-sm mt-1">
                トライアル終了日: {trialEndDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* 早期支払い完了（無料期間残り） */}
          {isEarlyPayment && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 text-sm font-semibold mb-2">課金完了</p>
              <p className="text-white text-lg font-bold">
                無料期間終了まで残り {daysUntilTrialEnd} 日
              </p>
              <p className="text-gray-400 text-sm mt-1">
                無料期間終了日: {trialEndDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                無料期間終了後、自動的に課金が開始されます
              </p>
            </div>
          )}

          {/* 次回請求日 */}
          {billingStatus.next_billing_date && (
            <div>
              <p className="text-gray-400 text-sm mb-2">次回請求予定日</p>
              <p className="text-white font-semibold">
                {new Date(billingStatus.next_billing_date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* プラン料金 */}
          <div>
            <p className="text-gray-400 text-sm mb-2">月額料金</p>
            <p className="text-white text-2xl font-bold">
              ¥{billingStatus.current_plan_amount.toLocaleString()}
              <span className="text-gray-400 text-base font-normal ml-2">/月</span>
            </p>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">サブスクリプション管理</h3>

        {/* トライアル期限切れの警告（課金登録前） */}
        {daysUntilTrialEnd < 0 && billingStatus.billing_status === BillingStatus.FREE && (
          <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-4 mb-4">
            <p className="text-yellow-400 font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              無料トライアル期間は終了しています
            </p>
            <p className="text-yellow-300 text-sm mt-2">
              課金登録と同時に¥{billingStatus.current_plan_amount.toLocaleString()}が請求されます。
            </p>
          </div>
        )}

        <div className="space-y-3">
          {/* サブスク登録ボタン（freeまたはcanceledの場合のみ表示） */}
          {(billingStatus.billing_status === BillingStatus.FREE ||
            billingStatus.billing_status === BillingStatus.CANCELED) && (
            <button
              onClick={handleCreateCheckout}
              disabled={isCreatingCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
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
                  サブスクリプションに登録する
                </>
              )}
            </button>
          )}

          {/* 支払い方法変更・解約ボタン（early_payment, active, past_due, cancelingの場合のみ表示） */}
          {(billingStatus.billing_status === BillingStatus.EARLY_PAYMENT ||
            billingStatus.billing_status === BillingStatus.ACTIVE ||
            billingStatus.billing_status === BillingStatus.PAST_DUE ||
            billingStatus.billing_status === BillingStatus.CANCELING) && (
            <button
              onClick={handleCreatePortal}
              disabled={isCreatingPortal}
              className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
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
                  支払い方法の変更・解約
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-gray-400 text-xs mt-4">
          サブスクリプションの管理はStripeの安全な決済ページで行われます。
        </p>
      </div>
    </div>
  );
}
