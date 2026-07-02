import type { BillingStatusResponse } from '../../types/billing';
import type { DashboardData } from '../../types/dashboard';
import type { StaffResponse } from '../../types/staff';
import { BillingStatus } from '../../types/enums';

export interface DashboardRestrictionWarning {
  title: string;
  body: string;
}

export function canEditDashboard(
  staff: StaffResponse | null,
  billingStatus: BillingStatusResponse | null
): boolean {
  if (!staff || !billingStatus) return false;
  return staff.is_mfa_enabled && buildBillingRestrictionWarning(billingStatus) === null;
}

export function buildBillingRestrictionWarning(
  billingStatus: BillingStatusResponse | null
): DashboardRestrictionWarning | null {
  switch (billingStatus?.billing_status) {
    case BillingStatus.TRIAL_EXPIRED:
      return {
        title: '無料試用期間が終了しているため利用できません',
        body: '新規作成・編集・削除などの操作はご利用いただけません。オーナーの方は管理者設定の有料会員ページから有料会員に登録してください。',
      };
    case BillingStatus.PAYMENT_FAILED:
      return {
        title: '有料会員料金のお支払いが失敗しているため利用できません',
        body: '新規作成・編集・削除などの操作はご利用いただけません。オーナーの方は管理者設定の有料会員ページから支払い方法を更新してください。',
      };
    case BillingStatus.PAST_DUE:
      return {
        title: 'お支払いの確認が必要なため利用できません',
        body: '新規作成・編集・削除などの操作はご利用いただけません。オーナーの方は管理者設定の有料会員ページを確認してください。',
      };
    case BillingStatus.CANCELED:
      return {
        title: '有料会員登録がキャンセル済みのため利用できません',
        body: '新規作成・編集・削除などの操作はご利用いただけません。オーナーの方は管理者設定の有料会員ページから再度入会してください。',
      };
    default:
      return null;
  }
}

export function removeRecipientFromDashboardData(
  dashboardData: DashboardData | null,
  recipientId: string
): DashboardData | null {
  if (!dashboardData) return null;

  return {
    ...dashboardData,
    recipients: dashboardData.recipients.filter(
      (recipient) => recipient.id !== recipientId
    ),
  };
}
