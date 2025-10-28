// PDF成果物の型定義

export type DeliverableType =
  | 'assessment_sheet'
  | 'draft_plan_pdf'
  | 'staff_meeting_minutes'
  | 'final_plan_signed_pdf'
  | 'monitoring_report_pdf';

export interface WelfareRecipientBrief {
  id: string;
  full_name: string;
  full_name_furigana: string;
}

export interface StaffBrief {
  id: string;
  name: string;
  role: string;
}

export interface PlanCycleBrief {
  id: number;
  cycle_number: number;
  plan_cycle_start_date: string | null;
  next_renewal_deadline: string | null;
  is_latest_cycle: boolean;
}

export interface PlanDeliverableListItem {
  id: number;
  original_filename: string;
  file_path: string;
  deliverable_type: DeliverableType;
  deliverable_type_display: string;
  plan_cycle: PlanCycleBrief;
  welfare_recipient: WelfareRecipientBrief;
  uploaded_by: StaffBrief;
  uploaded_at: string;
  download_url: string | null;
}

export interface PlanDeliverableListResponse {
  items: PlanDeliverableListItem[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

export interface PlanDeliverableSearchParams {
  office_id: string;
  search?: string;
  recipient_ids?: string;
  deliverable_types?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'uploaded_at' | 'recipient_name' | 'file_name';
  sort_order?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
}
