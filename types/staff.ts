export interface AdminCreateData {
  name: string;
  email: string;
  password: string;
}

export interface StaffCreateData extends AdminCreateData {
  role: 'manager' | 'employee';
}

export interface StaffResponse {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'employee';
  is_mfa_enabled: boolean;
  office?: { id: string; name: string; } | null;
}