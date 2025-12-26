'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { billingApi } from '@/lib/api/billing';
import { useBilling } from '@/contexts/BillingContext';

interface PastDueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 支払い遅延モーダルコンポーネント
 *
 * billing_status が past_due の場合に表示されるモーダル。
 * ユーザーに支払い方法の更新を促し、Stripe Customer Portalへ誘導する。
 *
 * 使用例:
 * ```tsx
 * const { isPastDue } = useBilling();
 * const [showModal, setShowModal] = useState(false);
 *
 * useEffect(() => {
 *   if (isPastDue) {
 *     setShowModal(true);
 *   }
 * }, [isPastDue]);
 *
 * <PastDueModal isOpen={showModal} onClose={() => setShowModal(false)} />
 * ```
 */
export default function PastDueModal({ isOpen, onClose }: PastDueModalProps) {
  const { billingStatus } = useBilling();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stripe Customer Portalへリダイレクト
  const handleUpdatePaymentMethod = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { url } = await billingApi.createPortalSession();
      // 新しいタブでStripe Customer Portalを開く
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('支払い方法の更新に失敗しました:', err);
      setError(err instanceof Error ? err.message : '支払い方法の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={true}>
      <div className="space-y-6">
        {/* アイコン */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-yellow-500"
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
          <h3 className="text-2xl font-bold text-white mb-2">
            お支払いに問題があります
          </h3>
          <p className="text-gray-400">
            サブスクリプションの支払いが失敗しました
          </p>
        </div>

        {/* 説明 */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            前回の請求処理が失敗したため、アカウントが一時的に制限されています。
            以下の機能がご利用いただけません：
          </p>
          <ul className="mt-3 space-y-1 text-sm text-gray-300 ml-4">
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
          <div className="text-center text-sm text-gray-400">
            次回請求予定日:{' '}
            <span className="font-semibold text-white">
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
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpdatePaymentMethod}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isLoading ? '処理中...' : '支払い方法を更新する'}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            後で対応する
          </button>
        </div>

        {/* サポート情報 */}
        <div className="text-center text-xs text-gray-500">
          お困りの場合は、
          <a href="/inquiry" className="text-blue-400 hover:text-blue-300 underline ml-1">
            お問い合わせ
          </a>
          ください
        </div>
      </div>
    </Modal>
  );
}
