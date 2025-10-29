import { http } from './http';
import { tokenUtils } from './token';

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
        rememberMe: data.rememberMe ? 'true' : 'false',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const authResponse = await response.json();

    // access_tokenはCookieで管理されるため、localStorageへの保存は不要
    // Cookieはサーバー側で自動的に設定される

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

  verifyMfa: (data: { temporary_token: string; totp_code: string }): Promise<AuthResponse> => {
    return http.post(`${API_V1_PREFIX}/auth/token/verify-mfa`, data);
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
};
