const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// FastAPIのバリデーションエラーの型定義
interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface FastAPIErrorResponse {
  detail: string | ValidationError[];
}

// エラーメッセージを整形する関数
function formatErrorMessage(errorData: FastAPIErrorResponse): string {
  if (typeof errorData.detail === 'string') {
    return errorData.detail;
  }

  if (Array.isArray(errorData.detail)) {
    // バリデーションエラーの場合、全てのエラーメッセージを結合
    return errorData.detail
      .map((err: ValidationError) => {
        const field = err.loc[err.loc.length - 1];
        return `${field}: ${err.msg}`;
      })
      .join('\n');
  }

  return 'エラーが発生しました';
}

// ログアウト処理をまとめる
const handleLogout = async () => {
  // ログアウトエンドポイントを呼び出してCookieを削除
  try {
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Failed to logout:', error);
    // ログアウトエンドポイントのエラーは無視（認証エラーの可能性があるため）
  }

  // クライアント側でのみリダイレクト処理を実行
  if (typeof window !== 'undefined') {
    // ログインページ以外にいる場合のみリダイレクト
    if (window.location.pathname !== '/auth/login') {
      window.location.href = '/auth/login';
    }
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Cookie認証: credentials: 'include' により自動的にCookieが送信される
  // バックエンドはCookieから認証情報を取得する
  console.log('[DEBUG HTTP] Request URL:', url);
  console.log('[DEBUG HTTP] Environment:', typeof window === 'undefined' ? 'server' : 'client');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    credentials: 'include', // Cookie送信のため必須
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  console.log('[DEBUG HTTP] Request config:', { method: config.method || 'GET', headers: config.headers });

  const response = await fetch(url, config);
  console.log('[DEBUG HTTP] Response status:', response.status, response.statusText);

  if (!response.ok) {
    console.error('[DEBUG HTTP] Response not OK. Status:', response.status);
    if (response.status === 401) {
      // 認証エラーの場合はログアウト処理
      console.error('[DEBUG HTTP] 401 Unauthorized - triggering logout');
      await handleLogout();
      // エラーを投げて処理を中断
      throw new Error('Not authenticated');
    }
    const errorData = await response.json().catch(() => ({ detail: `Request failed with status ${response.status}` }));
    console.error('[DEBUG HTTP] Error data:', errorData);
    const errorMessage = formatErrorMessage(errorData);
    console.error('[DEBUG HTTP] Formatted error message:', errorMessage);
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return Promise.resolve(null as T);
  }

  return response.json();
}

async function requestWithFormData<T>(endpoint: string, formData: FormData): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Cookie認証: credentials: 'include' により自動的にCookieが送信される
  const config: RequestInit = {
    method: 'POST',
    credentials: 'include', // Cookie送信のため必須
    body: formData,
    // Content-Typeヘッダーは指定しない（ブラウザが自動的にmultipart/form-dataを設定）
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      await handleLogout();
      throw new Error('Not authenticated');
    }
    const errorData = await response.json().catch(() => ({ detail: `Request failed with status ${response.status}` }));
    const errorMessage = formatErrorMessage(errorData);
    throw new Error(errorMessage);
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
