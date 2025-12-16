'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { billingApi } from '@/lib/api/billing';
import { BillingStatusResponse } from '@/types/billing';
import { BillingStatus } from '@/types/enums';

interface BillingContextType {
  billingStatus: BillingStatusResponse | null;
  isLoading: boolean;
  error: string | null;
  refreshBillingStatus: () => Promise<void>;
  /**
   * 書き込み操作が許可されているかどうか
   * past_due または canceled の場合は false を返す
   */
  canWrite: boolean;
  /**
   * 支払い遅延状態かどうか
   * past_due の場合は true を返す
   */
  isPastDue: boolean;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

interface BillingProviderProps {
  children: ReactNode;
}

/**
 * 課金ステータスをグローバルに管理するProvider
 *
 * 認証済みユーザーの課金ステータスを取得し、
 * アプリケーション全体で参照できるようにする。
 *
 * 使用例:
 * ```tsx
 * const { billingStatus, canWrite, isPastDue, refreshBillingStatus } = useBilling();
 *
 * // 書き込み操作を制限
 * <button disabled={!canWrite}>作成</button>
 *
 * // 支払い遅延モーダルを表示
 * {isPastDue && <PastDueModal />}
 * ```
 */
export function BillingProvider({ children }: BillingProviderProps) {
  const [billingStatus, setBillingStatus] = useState<BillingStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 課金ステータスを取得
  const fetchBillingStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await billingApi.getBillingStatus();
      setBillingStatus(data);
    } catch (err) {
      console.error('課金ステータスの取得に失敗しました:', err);
      setError(err instanceof Error ? err.message : '課金ステータスの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 課金ステータスを手動で再取得
  const refreshBillingStatus = async () => {
    await fetchBillingStatus();
  };

  // 初回マウント時に課金ステータスを取得
  useEffect(() => {
    fetchBillingStatus();

    // 10分ごとに課金ステータスを更新（支払い処理の反映を考慮）
    const interval = setInterval(() => {
      fetchBillingStatus();
    }, 10 * 60 * 1000); // 10分

    return () => clearInterval(interval);
  }, []);

  // 書き込み操作が許可されているかどうか
  const canWrite =
    billingStatus?.billing_status !== BillingStatus.PAST_DUE &&
    billingStatus?.billing_status !== BillingStatus.CANCELED;

  // 支払い遅延状態かどうか
  const isPastDue = billingStatus?.billing_status === BillingStatus.PAST_DUE;

  return (
    <BillingContext.Provider
      value={{
        billingStatus,
        isLoading,
        error,
        refreshBillingStatus,
        canWrite,
        isPastDue,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
}

/**
 * 課金ステータスを取得するカスタムフック
 *
 * @throws BillingProviderの外で呼び出された場合にエラーをスロー
 * @returns 課金ステータスとユーティリティ関数
 */
export function useBilling(): BillingContextType {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}
