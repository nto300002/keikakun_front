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

const fetchCsrfToken = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/csrf-token`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('認証情報の確認に失敗しました。ページを再読み込みして再度お試しください。');
  }

  const data = await response.json() as { csrf_token: string };
  setCsrfToken(data.csrf_token);
  return data.csrf_token;
};

const ensureCsrfToken = async (): Promise<string> => {
  if (csrfToken) return csrfToken;
  return fetchCsrfToken();
};

const isCsrfFailure = (response: Response, errorData: FastAPIErrorResponse): boolean => {
  return response.status === 403 && errorData.detail === '画面の有効期限が切れました。ページを再読み込みして、もう一度お試しください。';
};

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
  } catch {
    console.error('Operation failed');
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

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 状態変更メソッド(POST/PUT/PATCH/DELETE)の場合、CSRFトークンを追加
  const method = options.method?.toUpperCase();
  const isStateMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '');

  if (isStateMutatingMethod) {
    defaultHeaders['X-CSRF-Token'] = await ensureCsrfToken();
  }

  const config: RequestInit = {
    ...options,
    credentials: 'include', // Cookie送信のため必須
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
      throw new Error('認証されていません');
    }
    const errorData = await response.json().catch(() => ({ detail: `通信に失敗しました。時間をおいて再度お試しください。` }));
    if (isStateMutatingMethod && isCsrfFailure(response, errorData)) {
      const refreshedToken = await fetchCsrfToken();
      const retryResponse = await fetch(url, {
        ...config,
        headers: {
          ...defaultHeaders,
          ...options.headers,
          'X-CSRF-Token': refreshedToken,
        },
      });

      if (retryResponse.ok) {
        if (retryResponse.status === 204) {
          return Promise.resolve(null as T);
        }
        return retryResponse.json();
      }
    }
    const errorMessage = formatErrorMessage(errorData);
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return Promise.resolve(null as T);
  }

  return response.json();
}

async function requestWithFormData<T>(
  endpoint: string,
  formData: FormData,
  method: 'POST' | 'PUT' = 'POST'
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // 状態変更リクエストなので、CSRFトークンをヘッダーに追加
  const headers: HeadersInit = {
    'X-CSRF-Token': await ensureCsrfToken(),
  };

  // Cookie認証: credentials: 'include' により自動的にCookieが送信される
  const config: RequestInit = {
    method,
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
    const errorData = await response.json().catch(() => ({ detail: `通信に失敗しました。時間をおいて再度お試しください。` }));
    if (isCsrfFailure(response, errorData)) {
      const refreshedToken = await fetchCsrfToken();
      const retryResponse = await fetch(url, {
        ...config,
        headers: {
          'X-CSRF-Token': refreshedToken,
        },
      });

      if (retryResponse.ok) {
        if (retryResponse.status === 204) {
          return Promise.resolve(null as T);
        }
        return retryResponse.json();
      }
    }
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
  putFormData: <T>(endpoint: string, formData: FormData) => requestWithFormData<T>(endpoint, formData, 'PUT'),
};
