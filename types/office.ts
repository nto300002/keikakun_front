export interface OfficeCreateData {
  name: string;
  office_type: 'transition_to_employment' | 'type_A_office' | 'type_B_office';
}

export interface OfficeResponse {
  id: string;
  name: string;
  office_type: 'transition_to_employment' | 'type_A_office' | 'type_B_office';
  billing_status: string;
  created_at: string;
  updated_at: string;
}