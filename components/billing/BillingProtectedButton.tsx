'use client';

import { ReactNode } from 'react';
import { useBilling } from '@/contexts/BillingContext';

interface BillingProtectedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

/**
 * 課金ステータスに基づいてボタンを無効化するコンポーネント
 *
 * billing_status が past_due または canceled の場合、
 * ボタンを自動的に無効化します。
 *
 * 使用例:
 * ```tsx
 * import BillingProtectedButton from '@/components/billing/BillingProtectedButton';
 *
 * // 利用者作成ボタン
 * <BillingProtectedButton
 *   onClick={handleCreateUser}
 *   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
 * >
 *   利用者を作成
 * </BillingProtectedButton>
 *
 * // フォーム送信ボタン
 * <BillingProtectedButton
 *   type="submit"
 *   className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
 * >
 *   保存
 * </BillingProtectedButton>
 * ```
 */
export default function BillingProtectedButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  title,
}: BillingProtectedButtonProps) {
  const { canWrite, isPastDue } = useBilling();

  // 課金ステータスによって無効化されている場合のツールチップメッセージ
  const billingDisabledMessage = isPastDue
    ? '支払い遅延のため、この操作は無効化されています。支払い方法を更新してください。'
    : '課金プランが有効でないため、この操作は無効化されています。';

  // ボタンが無効化される条件:
  // 1. 明示的に disabled が true
  // 2. 課金ステータスが past_due または canceled (canWrite が false)
  const isDisabled = disabled || !canWrite;

  // ツールチップメッセージ:
  // 1. 明示的な title プロパティがあればそれを優先
  // 2. 課金ステータスによって無効化されている場合は billingDisabledMessage
  // 3. それ以外は undefined
  const tooltipMessage = title || (!canWrite ? billingDisabledMessage : undefined);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${className} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={tooltipMessage}
    >
      {children}
    </button>
  );
}
