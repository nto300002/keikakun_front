import { http } from './http';
import { tokenUtils } from './token';
import { initializeCsrfToken } from './csrf';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1_PREFIX = '/api/v1';
import { LoginData, AuthResponse } from '@/types/auth';
import { AdminCreateData, StaffCreateData, StaffResponse } from '@/types/staff';
import { OfficeCreateData, OfficeResponse } from '@/types/office';

// Re-export tokenUtils for convenience
export { tokenUtils };

// Authentication API calls
export const authApi = {
  registerAdmin: (data: AdminCreateData): Promise<StaffResponse> => {
    return http.post(`${API_V1_PREFIX}/auth/register-admin`, data);
  },

  registerStaff: (data: StaffCreateData): Promise<StaffResponse> => {
    return http.post(`${API_V1_PREFIX}/auth/register`, data);
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/auth/token`, {
      method: 'POST',
      credentials: 'include', // Cookie送信のため追加
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: data.username,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'ログインに失敗しました');
    }

    const authResponse = await response.json();

    // access_tokenはCookieで管理されるため、localStorageへの保存は不要
    // Cookieはサーバー側で自動的に設定される

    // ログイン成功後、CSRFトークンを初期化
    // Cookie認証を使用するため、状態変更リクエストにはCSRFトークンが必要
    await initializeCsrfToken();

    return authResponse;
  },

  getCurrentUser: (): Promise<StaffResponse> => {
    return http.get(`${API_V1_PREFIX}/staffs/me`);
  },

  verifyEmail: (token: string): Promise<{ message: string; role: string }> => {
    return http.get(`${API_V1_PREFIX}/auth/verify-email?token=${token}`);
  },

  logout: (): Promise<{ message: string }> => {
    return http.post(`${API_V1_PREFIX}/auth/logout`, {});
  },

  verifyMfa: async (data: { temporary_token: string; totp_code: string }): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>(`${API_V1_PREFIX}/auth/token/verify-mfa`, data);

    // MFA検証成功後もCSRFトークンを初期化
    await initializeCsrfToken();

    return response;
  },

  // Admin MFA management
  enableStaffMfa: (staffId: string): Promise<{
    message: string;
    staff_id: string;
    staff_name: string;
    qr_code_uri: string;
    secret_key: string;
    recovery_codes: string[];
  }> => {
    return http.post(`${API_V1_PREFIX}/auth/admin/staff/${staffId}/mfa/enable`, {});
  },

  disableStaffMfa: (staffId: string): Promise<{ message: string }> => {
    return http.post(`${API_V1_PREFIX}/auth/admin/staff/${staffId}/mfa/disable`, {});
  },

  // Bulk MFA operations
  enableAllOfficeMfa: (): Promise<{
    message: string;
    enabled_count: number;
    staff_mfa_data: Array<{
      staff_id: string;
      staff_name: string;
      qr_code_uri: string;
      secret_key: string;
      recovery_codes: string[];
    }>;
  }> => {
    return http.post(`${API_V1_PREFIX}/auth/admin/office/mfa/enable-all`, {});
  },

  disableAllOfficeMfa: (): Promise<{
    message: string;
    disabled_count: number;
  }> => {
    return http.post(`${API_V1_PREFIX}/auth/admin/office/mfa/disable-all`, {});
  },

  // Staff deletion (Owner only)
  deleteStaff: (staffId: string): Promise<{
    message: string;
    staff_id: string;
    deleted_at: string;
  }> => {
    return http.delete(`${API_V1_PREFIX}/staffs/${staffId}`);
  },
};

// Office API calls
export const officeApi = {
  getMyOffice: (): Promise<OfficeResponse> => {
    return http.get(`${API_V1_PREFIX}/offices/me`);
  },

  getAllOffices: (): Promise<OfficeResponse[]> => {
    return http.get(`${API_V1_PREFIX}/offices/`);
  },

  setupOffice: (data: OfficeCreateData): Promise<OfficeResponse> => {
    return http.post(`${API_V1_PREFIX}/offices/setup`, data);
  },

  associateToOffice: (office_id: string): Promise<{ message: string }> => {
    return http.post(`${API_V1_PREFIX}/staff/associate-office`, { office_id });
  },

  // 事務所に所属する全スタッフを取得（Manager/Owner専用）
  getOfficeStaffs: (): Promise<StaffResponse[]> => {
    return http.get(`${API_V1_PREFIX}/offices/me/staffs`);
  },
};
