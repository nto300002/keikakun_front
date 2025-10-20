import { tokenUtils } from './token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ログアウト処理をまとめる
const handleLogout = async () => {
  try {
    const token = tokenUtils.getToken();
    if (token) {
      await fetch(`${API_BASE_URL}/api/v1/auth/mfa/disable-on-logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Failed to disable MFA on logout:', error);
  } finally {
    tokenUtils.removeToken();
    // ログインページ以外にいる場合のみリダイレクト
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login';
    }
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenUtils.getToken();

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      // 認証エラーの場合はログアウト処理
      await handleLogout();
      // エラーを投げて処理を中断
      throw new Error('Not authenticated');
    }
    const errorData = await response.json().catch(() => ({ detail: `Request failed with status ${response.status}` }));
    throw new Error(errorData.detail);
  }

  if (response.status === 204) {
    return Promise.resolve(null as T);
  }

  return response.json();
}

async function requestWithFormData<T>(endpoint: string, formData: FormData): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenUtils.getToken();

  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: 'POST',
    headers,
    body: formData,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      await handleLogout();
      throw new Error('Not authenticated');
    }
    const errorData = await response.json().catch(() => ({ detail: `Request failed with status ${response.status}` }));
    throw new Error(errorData.detail);
  }

  if (response.status === 204) {
    return Promise.resolve(null as T);
  }

  return response.json();
}

export const http = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
  postFormData: <T>(endpoint: string, formData: FormData) => requestWithFormData<T>(endpoint, formData),
};
