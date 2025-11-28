// 事務所種別の型定義
export type OfficeTypeValue = 'transition_to_employment' | 'type_A_office' | 'type_B_office';

export interface OfficeCreateData {
  name: string;
  office_type: OfficeTypeValue;
}

export interface OfficeResponse {
  id: string;
  name: string;
  office_type: OfficeTypeValue;
  billing_status: string;
  address?: string | null;
  phone_number?: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfficeInfoUpdateRequest {
  name?: string;
  type?: OfficeTypeValue;
  address?: string;
  phone_number?: string;
  email?: string;
}

export interface OfficeAuditLog {
  id: string;
  office_id: string;
  staff_id: string | null;
  action_type: string;
  details: string | null;
  created_at: string;
}

export interface OfficeAuditLogsResponse {
  logs: OfficeAuditLog[];
  total: number;
}

// app_admin用の型定義

// 事務所一覧レスポンス（app_admin用）
export interface OfficeListItemResponse {
  id: string;
  name: string;
  office_type: OfficeTypeValue;
  is_deleted: boolean;
  created_at: string;
}

// 事務所所属スタッフ（app_admin用）
export interface StaffInOffice {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_mfa_enabled: boolean;
  is_email_verified: boolean;
}

// 事務所詳細レスポンス（app_admin用）
export interface OfficeDetailResponse {
  id: string;
  name: string;
  office_type: OfficeTypeValue;
  address: string | null;
  phone_number: string | null;
  email: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  staffs: StaffInOffice[];
}