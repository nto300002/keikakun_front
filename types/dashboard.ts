import { StaffRole, BillingStatus, SupportPlanStep } from './enums';

export interface DashboardRecipient {
  id: string;
  full_name: string;
  last_name: string; // 追加: recipient.last_name を参照するために必須にする
  first_name?: string; // 追加: 必要に応じて利用
  furigana?: string;
  current_cycle_number: number;
  latest_step: SupportPlanStep | null;
  next_renewal_deadline: string | null; // Date is serialized as string
  monitoring_due_date: string | null; // Date is serialized as string
  next_plan_start_date: number | null; // 次回計画開始期限（日数）
  next_plan_start_days_remaining: number | null; // 次回計画開始までの残り日数
}

export interface DashboardData {
  staff_name: string;
  staff_role: StaffRole;
  office_id: string;
  office_name: string;
  current_user_count: number;
  max_user_count: number;
  billing_status: BillingStatus;
  recipients: DashboardRecipient[];
}