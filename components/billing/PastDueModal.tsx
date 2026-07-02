'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { billingApi } from '@/lib/api/billing';
import { useBilling } from '@/contexts/BillingContext';
import { getBillingRestrictionReason, getPrimaryBillingAction } from '@/lib/billing/status';

interface PastDueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 支払い遅延モーダルコンポーネント
 *
 * 支払いアクションが必要な場合に表示されるモーダル。
 * status に応じて Checkout、Customer Portal、有料会員管理へ誘導する。
 *
 * 使用例:
 * ```tsx
 * const { requiresPaymentAction } = useBilling();
 * const [showModal, setShowModal] = useState(false);
 *
 * useEffect(() => {
 *   if (requiresPaymentAction) {
 *     setShowModal(true);
 *   }
 * }, [requiresPaymentAction]);
 *
 * <PastDueModal isOpen={showModal} onClose={() => setShowModal(false)} />
 * ```
 */
export default function PastDueModal({ isOpen, onClose }: PastDueModalProps) {
  const { billingStatus } = useBilling();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restrictionReason = getBillingRestrictionReason(billingStatus);
  const primaryAction = getPrimaryBillingAction(billingStatus);

  const modalContent = (() => {
    switch (restrictionReason) {
      case 'trial_expired':
        return {
          title: '無料試用期間が終了しました',
          lead: '有料会員登録が完了するまで、一部の操作が制限されています。',
          description: '無料試用期間が終了したため、以下の機能がご利用いただけません：',
          primaryButton: '有料会員に登録する',
        };
      case 'payment_failed':
        return {
          title: '有料会員料金のお支払いが失敗しました',
          lead: '前回の請求処理が失敗したため、アカウントが一時的に制限されています。',
          description: '支払いが完了するまで、以下の機能がご利用いただけません：',
          primaryButton: '支払い方法を更新する',
        };
      case 'past_due':
        return {
          title: 'お支払いの確認が必要です',
          lead: 'お支払い状況の確認が必要なため、アカウントが一時的に制限されています。',
          description: '確認が完了するまで、以下の機能がご利用いただけません：',
          primaryButton: '支払い方法を更新する',
        };
      default:
        return {
          title: '有料会員登録の確認が必要です',
          lead: '有料会員登録が有効でないため、一部の操作が制限されています。',
          description: '有料会員登録が有効になるまで、以下の機能がご利用いただけません：',
          primaryButton: '有料会員管理を確認する',
        };
    }
  })();

  const handlePrimaryAction = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (primaryAction === 'checkout') {
        const { url } = await billingApi.createCheckoutSession();
        window.location.href = url;
        return;
      }

      if (primaryAction === 'portal') {
        const { url } = await billingApi.createPortalSession();
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      window.location.href = '/admin?tab=plan';
    } catch (err) {
      console.error('Client operation failed');
      setError(err instanceof Error ? err.message : '課金アクションの開始に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={true}>
      <div className="space-y-6">
        {/* アイコン */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-500/10">
            <svg
              className="h-10 w-10 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* タイトル */}
        <div className="text-center">
          <h3 className="mb-2 text-2xl font-bold text-slate-950 dark:text-white">
            {modalContent.title}
          </h3>
          <p className="text-slate-600 dark:text-gray-300">
            {modalContent.lead}
          </p>
        </div>

        {/* 説明 */}
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-500/40 dark:bg-yellow-950/30">
          <p className="text-sm leading-relaxed text-yellow-900 dark:text-yellow-100">
            {modalContent.description}
          </p>
          <ul className="ml-4 mt-3 space-y-1 text-sm text-yellow-900 dark:text-yellow-100">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>利用者・支援計画の新規作成</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>既存データの編集・更新</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>個別支援計画のPDFアップロード</span>
            </li>
          </ul>
        </div>

        {/* 次回請求日 */}
        {billingStatus?.next_billing_date && (
          <div className="text-center text-sm text-slate-600 dark:text-gray-400">
            次回請求予定日:{' '}
            <span className="font-semibold text-slate-950 dark:text-white">
              {new Date(billingStatus.next_billing_date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 dark:border-red-500/50 dark:bg-red-950/40">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePrimaryAction}
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-gray-600"
          >
            {isLoading ? '処理中...' : modalContent.primaryButton}
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-slate-200 px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            後で対応する
          </button>
        </div>

        {/* サポート情報 */}
        <div className="text-center text-xs text-slate-500 dark:text-gray-400">
          お困りの場合は、
          <a href="/inquiry" className="ml-1 text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            お問い合わせ
          </a>
          ください
        </div>
      </div>
    </Modal>
  );
}
