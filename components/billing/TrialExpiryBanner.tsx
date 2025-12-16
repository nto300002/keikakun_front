'use client';

import { useBilling } from '@/contexts/BillingContext';
import { BillingStatus } from '@/types/enums';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * 無料トライアル期限バナーコンポーネント
 *
 * billing_status が free の場合、ヘッダーの下に表示されます。
 * トライアル終了までの残り日数を表示し、プラン設定ページへのリンクを提供します。
 *
 * 表示対象:
 * - すべてのスタッフに表示
 * - 「設定はこちら」リンクはownerのみクリック可能
 */
export default function TrialExpiryBanner() {
  const { billingStatus, isLoading } = useBilling();
  const pathname = usePathname();

  // ローディング中または課金ステータスがない場合は表示しない
  if (isLoading || !billingStatus) {
    return null;
  }

  // 無料トライアル中のみ表示
  if (billingStatus.billing_status !== BillingStatus.FREE) {
    return null;
  }

  // 管理画面のプランタブでは表示しない（重複を避けるため）
  if (pathname === '/admin' || pathname?.startsWith('/admin?')) {
    return null;
  }

  const trialEndDate = new Date(billingStatus.trial_end_date);
  const now = new Date();
  const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // トライアル期限切れの場合は表示しない（別のモーダルで対応）
  if (daysRemaining < 0) {
    return null;
  }

  // 残り日数に応じて背景色を変更
  const getBannerColor = () => {
    if (daysRemaining <= 7) {
      return 'bg-red-600'; // 残り7日以内: 赤
    } else if (daysRemaining <= 30) {
      return 'bg-yellow-600'; // 残り30日以内: 黄色
    } else {
      return 'bg-green-600'; // それ以上: 緑
    }
  };

  return (
    <div className={`${getBannerColor()} text-white py-3 px-4 shadow-md`}>
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm sm:text-base">
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-medium">
          無料トライアル期間終了まで残り <strong className="text-lg">{daysRemaining}</strong> 日
        </span>
        <span className="hidden sm:inline text-gray-100">|</span>
        <Link
          href="/admin"
          className="underline hover:text-gray-200 transition-colors font-semibold"
        >
          設定はこちら
        </Link>
      </div>
    </div>
  );
}
