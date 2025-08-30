import { http } from './http';
import { tokenUtils } from './token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1_PREFIX = '/api/v1';
import { LoginData, AuthResponse } from '@/types/auth';
import { StaffCreateData, StaffResponse } from '@/types/staff';
import { OfficeCreateData, OfficeResponse } from '@/types/office';

// Authentication API calls
export const authApi = {
  registerAdmin: (data: StaffCreateData): Promise<StaffResponse> => {
    return http.post(`${API_V1_PREFIX}/auth/register-admin`, data);
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}${API_V1_PREFIX}/auth/token`, {
      method: 'POST',
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
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  },

  getCurrentUser: (): Promise<StaffResponse> => {
    return http.get(`${API_V1_PREFIX}/staffs/me`);
  },

  verifyEmail: (token: string): Promise<{ message: string }> => {
    return http.get(`${API_V1_PREFIX}/auth/verify-email?token=${token}`);
  },
};

// Office API calls
export const officeApi = {
  getMyOffice: (): Promise<OfficeResponse> => {
    return http.get(`${API_V1_PREFIX}/offices/me`);
  },

  setupOffice: (data: OfficeCreateData): Promise<OfficeResponse> => {
    return http.post(`${API_V1_PREFIX}/offices/setup`, data);
  },
};

export { tokenUtils };
