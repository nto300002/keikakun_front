import { StaffRole, BillingStatus, SupportPlanStep } from './enums';

export interface DashboardRecipient {
  id: string;
  full_name: string;
  furigana?: string;
  current_cycle_number: number;
  latest_step: SupportPlanStep | null;
  next_renewal_deadline: string | null; // Date is serialized as string
  monitoring_due_date: string | null; // Date is serialized as string
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