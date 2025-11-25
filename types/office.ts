export interface OfficeCreateData {
  name: string;
  office_type: 'transition_to_employment' | 'type_A_office' | 'type_B_office';
}

export interface OfficeResponse {
  id: string;
  name: string;
  office_type: 'transition_to_employment' | 'type_A_office' | 'type_B_office';
  billing_status: string;
  address?: string | null;
  phone_number?: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfficeInfoUpdateRequest {
  name?: string;
  type?: 'transition_to_employment' | 'type_A_office' | 'type_B_office';
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