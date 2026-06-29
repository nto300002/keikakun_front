import { BillingStatusResponse } from '@/types/billing';
import { BillingStatus } from '@/types/enums';

export type BillingRestrictionReason =
  | 'trial_expired'
  | 'payment_failed'
  | 'past_due'
  | 'canceled'
  | null;

export type BillingActionKind = 'checkout' | 'portal' | 'plan' | null;

export function isTrialEnded(billingStatus: BillingStatusResponse | null): boolean {
  if (!billingStatus) return false;

  if (billingStatus.trial_days_remaining !== null) {
    return billingStatus.trial_days_remaining <= 0;
  }

  return new Date(billingStatus.trial_end_date).getTime() <= Date.now();
}

export function isPaymentFailedAfterTrial(billingStatus: BillingStatusResponse | null): boolean {
  return billingStatus?.billing_status === BillingStatus.PAYMENT_FAILED && isTrialEnded(billingStatus);
}

export function getBillingRestrictionReason(
  billingStatus: BillingStatusResponse | null
): BillingRestrictionReason {
  switch (billingStatus?.billing_status) {
    case BillingStatus.TRIAL_EXPIRED:
      return 'trial_expired';
    case BillingStatus.PAYMENT_FAILED:
      return isTrialEnded(billingStatus) ? 'payment_failed' : null;
    case BillingStatus.PAST_DUE:
      return 'past_due';
    case BillingStatus.CANCELED:
      return 'canceled';
    default:
      return null;
  }
}

export function canWriteWithBillingStatus(billingStatus: BillingStatusResponse | null): boolean {
  return getBillingRestrictionReason(billingStatus) === null;
}

export function requiresPaymentAction(billingStatus: BillingStatusResponse | null): boolean {
  const reason = getBillingRestrictionReason(billingStatus);
  return reason === 'trial_expired' || reason === 'payment_failed' || reason === 'past_due';
}

export function getPrimaryBillingAction(
  billingStatus: BillingStatusResponse | null
): BillingActionKind {
  const reason = getBillingRestrictionReason(billingStatus);

  if (reason === 'trial_expired') return 'checkout';
  if (reason === 'payment_failed') return 'portal';
  if (reason === 'past_due') return 'portal';
  if (reason === 'canceled') return 'checkout';

  return null;
}

export function getBillingDisabledMessage(
  billingStatus: BillingStatusResponse | null
): string {
  const reason = getBillingRestrictionReason(billingStatus);

  switch (reason) {
    case 'trial_expired':
      return '無料試用期間が終了しているため、この操作は無効化されています。有料会員に登録してください。';
    case 'payment_failed':
      return '有料会員料金のお支払いが失敗しているため、この操作は無効化されています。支払い方法を更新してください。';
    case 'past_due':
      return 'お支払いの確認が必要なため、この操作は無効化されています。有料会員管理画面を確認してください。';
    case 'canceled':
      return '有料会員登録が有効でないため、この操作は無効化されています。';
    default:
      return '有料会員登録が有効でないため、この操作は無効化されています。';
  }
}
