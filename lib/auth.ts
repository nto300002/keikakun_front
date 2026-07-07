import { http } from './http';
import { tokenUtils } from './token';
import { initializeCsrfToken } from './csrf';
import { createAuthFlowClient } from './authFlow';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1_PREFIX = '/api/v1';
import { AdminCreateData, StaffCreateData, StaffResponse } from '@/types/staff';
import { OfficeCreateData, OfficeResponse } from '@/types/office';

// Re-export tokenUtils for convenience
export { tokenUtils };

const authFlowClient = createAuthFlowClient({
  apiBaseUrl: API_BASE_URL,
  apiV1Prefix: API_V1_PREFIX,
  initializeCsrfToken,
});

// Authentication API calls
export const authApi = {
  registerAdmin: (data: AdminCreateData): Promise<StaffResponse> => {
    return http.post<StaffResponse>(`${API_V1_PREFIX}/auth/register-admin`, data);
  },

  registerStaff: (data: StaffCreateData): Promise<StaffResponse> => {
    return http.post<StaffResponse>(`${API_V1_PREFIX}/auth/register`, data);
  },

  login: authFlowClient.login,

  getCurrentUser: (): Promise<StaffResponse> => {
    return http.get<StaffResponse>(`${API_V1_PREFIX}/staffs/me`);
  },

  verifyEmail: (token: string): Promise<{ message: string; role: string }> => {
    return http.get<{ message: string; role: string }>(`${API_V1_PREFIX}/auth/verify-email?token=${token}`);
  },

  logout: authFlowClient.logout,

  verifyMfa: authFlowClient.verifyMfa,

  // Admin MFA management
  enableStaffMfa: (staffId: string): Promise<{
    message: string;
    staff_id: string;
    staff_name: string;
    qr_code_uri: string;
    secret_key: string;
    recovery_codes: string[];
  }> => {
    return http.post<{
      message: string;
      staff_id: string;
      staff_name: string;
      qr_code_uri: string;
      secret_key: string;
      recovery_codes: string[];
    }>(`${API_V1_PREFIX}/auth/admin/staff/${staffId}/mfa/enable`, {});
  },

  disableStaffMfa: (staffId: string): Promise<{ message: string }> => {
    return http.post<{ message: string }>(`${API_V1_PREFIX}/auth/admin/staff/${staffId}/mfa/disable`, {});
  },

  // Bulk MFA operations
  enableAllOfficeMfa: (): Promise<{
    message: string;
    enabled_count: number;
    enabled_staffs: Array<{
      staff_id: string;
      staff_name: string;
      setup_required: boolean;
    }>;
  }> => {
    return http.post<{
      message: string;
      enabled_count: number;
      enabled_staffs: Array<{
        staff_id: string;
        staff_name: string;
        setup_required: boolean;
      }>;
    }>(`${API_V1_PREFIX}/auth/admin/office/mfa/enable-all`, {});
  },

  disableAllOfficeMfa: (): Promise<{
    message: string;
    disabled_count: number;
  }> => {
    return http.post<{
      message: string;
      disabled_count: number;
    }>(`${API_V1_PREFIX}/auth/admin/office/mfa/disable-all`, {});
  },

  // Staff deletion (Owner only)
  deleteStaff: (staffId: string): Promise<{
    message: string;
    staff_id: string;
    deleted_at: string;
  }> => {
    return http.delete<{
      message: string;
      staff_id: string;
      deleted_at: string;
    }>(`${API_V1_PREFIX}/staffs/${staffId}`);
  },
};

// Office API calls
export const officeApi = {
  getMyOffice: (): Promise<OfficeResponse> => {
    return http.get<OfficeResponse>(`${API_V1_PREFIX}/offices/me`);
  },

  getAllOffices: (): Promise<OfficeResponse[]> => {
    return http.get<OfficeResponse[]>(`${API_V1_PREFIX}/offices/`);
  },

  setupOffice: (data: OfficeCreateData): Promise<OfficeResponse> => {
    return http.post<OfficeResponse>(`${API_V1_PREFIX}/offices/setup`, data);
  },

  associateToOffice: (office_id: string): Promise<{ message: string }> => {
    return http.post<{ message: string }>(`${API_V1_PREFIX}/staff/associate-office`, { office_id });
  },

  // 事務所に所属する全スタッフを取得（Manager/Owner専用）
  getOfficeStaffs: (): Promise<StaffResponse[]> => {
    return http.get<StaffResponse[]>(`${API_V1_PREFIX}/offices/me/staffs`);
  },
};
