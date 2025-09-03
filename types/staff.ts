export interface StaffCreateData {
  name: string;
  email: string;
  password: string;
}

export interface StaffResponse {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'employee';
}