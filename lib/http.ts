const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

// CSRF トークンをメモリに保存
let csrfToken: string | null = null;

/**
 * CSRFトークンを設定
 * @param token - CSRFトークン
 */
export const setCsrfToken = (token: string) => {
  csrfToken = token;
};

/**
 * CSRFトークンを取得
 * @returns 現在のCSRFトークン
 */
export const getCsrfToken = () => csrfToken;

// FastAPIのバリデーションエラーの型定義
interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface FastAPIErrorResponse {
  detail: string | ValidationError[];
}

// Pydanticの英語エラーメッセージを日本語に変換する関数
function translateValidationMessage(msg: string, field: string | number): string {
  // フィールド名を日本語にマッピング
  const fieldNameMap: Record<string, string> = {
    name: '名前',
    email: 'メールアドレス',
    password: 'パスワード',
    office_type: '事業所種別',
    type: '種別',
  };

  const fieldName = typeof field === 'string' ? (fieldNameMap[field] || field) : field;

  // 一般的なPydanticのバリデーションエラーメッセージを日本語に変換
  const patterns = [
    {
      regex: /String should have at least (\d+) characters?/,
      replace: (match: RegExpMatchArray) => `${fieldName}は${match[1]}文字以上で入力してください`,
    },
    {
      regex: /String should have at most (\d+) characters?/,
      replace: (match: RegExpMatchArray) => `${fieldName}は${match[1]}文字以内で入力してください`,
    },
    {
      regex: /Field required/,
      replace: () => `${fieldName}は必須項目です`,
    },
    {
      regex: /Input should be/,
      replace: () => `${fieldName}の値が不正です`,
    },
    {
      regex: /value is not a valid email address/i,
      replace: () => `有効なメールアドレスを入力してください`,
    },
    {
      regex: /ensure this value has at least (\d+) characters?/i,
      replace: (match: RegExpMatchArray) => `${fieldName}は${match[1]}文字以上で入力してください`,
    },
    {
      regex: /ensure this value has at most (\d+) characters?/i,
      replace: (match: RegExpMatchArray) => `${fieldName}は${match[1]}文字以内で入力してください`,
    },
    {
      regex: /パスワードは次のうち少なくとも3つを含む必要があります/,
      replace: () => `パスワードは英字大小文字・数字・記号（!@#$%^&*(),.?":{}|<>）を全て含める必要があります`,
    },
    {
      regex: /パスワードは8文字以上である必要があります/,
      replace: () => `パスワードは8文字以上で入力してください`,
    },
  ];

  for (const pattern of patterns) {
    const match = msg.match(pattern.regex);
    if (match) {
      return pattern.replace(match);
    }
  }

  // パターンにマッチしない場合はフィールド名を付けて返す
  return `${fieldName}: ${msg}`;
}

// エラーメッセージを整形する関数
function formatErrorMessage(errorData: FastAPIErrorResponse): string {
  if (typeof errorData.detail === 'string') {
    return errorData.detail;
  }

  if (Array.isArray(errorData.detail)) {
    // バリデーションエラーの場合、全てのエラーメッセージを日本語化して結合
    return errorData.detail
      .map((err: ValidationError) => {
        const field = err.loc[err.loc.length - 1];
        return translateValidationMessage(err.msg, field);
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
    console.error('ログアウトに失敗しました:', error);
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
  // console.log('[DEBUG HTTP] Request URL:', url);
  // console.log('[DEBUG HTTP] Environment:', typeof window === 'undefined' ? 'server' : 'client');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 状態変更メソッド(POST/PUT/PATCH/DELETE)の場合、CSRFトークンを追加
  const method = options.method?.toUpperCase();
  const isStateMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '');

  if (isStateMutatingMethod && csrfToken) {
    defaultHeaders['X-CSRF-Token'] = csrfToken;
  }

  const config: RequestInit = {
    ...options,
    credentials: 'include', // Cookie送信のため必須
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // console.log('[DEBUG HTTP] Request config:', { method: config.method || 'GET', headers: config.headers });

  const response = await fetch(url, config);
  // console.log('[DEBUG HTTP] Response status:', response.status, response.statusText);

  if (!response.ok) {
    console.error('[DEBUG HTTP] Response not OK. Status:', response.status);
    if (response.status === 401) {
      // 認証エラーの場合はログアウト処理
      console.error('[DEBUG HTTP] 401 Unauthorized - triggering logout');
      await handleLogout();
      // エラーを投げて処理を中断
      throw new Error('認証されていません');
    }
    const errorData = await response.json().catch(() => ({ detail: `リクエストが失敗しました (ステータス: ${response.status})` }));
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

  // POSTリクエストなので、CSRFトークンをヘッダーに追加
  const headers: HeadersInit = {};
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  // Cookie認証: credentials: 'include' により自動的にCookieが送信される
  const config: RequestInit = {
    method: 'POST',
    credentials: 'include', // Cookie送信のため必須
    headers,
    body: formData,
    // Content-Typeヘッダーは指定しない（ブラウザが自動的にmultipart/form-dataを設定）
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      await handleLogout();
      throw new Error('認証されていません');
    }
    const errorData = await response.json().catch(() => ({ detail: `リクエストが失敗しました (ステータス: ${response.status})` }));
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
