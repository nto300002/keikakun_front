import type { LoginData, AuthResponse } from '@/types/auth';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;
type InitializeCsrfToken = () => Promise<boolean>;

interface AuthFlowClientOptions {
  apiBaseUrl: string;
  apiV1Prefix: string;
  fetchImpl?: FetchLike;
  initializeCsrfToken: InitializeCsrfToken;
}

interface MfaVerifyData {
  temporary_token: string;
  totp_code: string;
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  const error = await response.json().catch(() => null) as { detail?: string } | null;
  return error?.detail || fallback;
}

async function initializeCsrfTokenBestEffort(
  initializeCsrfToken: InitializeCsrfToken
): Promise<void> {
  try {
    await initializeCsrfToken();
  } catch {
    // 認証成功後のCSRF初期化はbest-effort。
    // 次回の状態変更APIでhttp wrapperが遅延取得する。
  }
}

export function createAuthFlowClient({
  apiBaseUrl,
  apiV1Prefix,
  fetchImpl = fetch,
  initializeCsrfToken,
}: AuthFlowClientOptions) {
  const authUrl = (path: string) => `${apiBaseUrl}${apiV1Prefix}${path}`;

  return {
    async login(data: LoginData): Promise<AuthResponse> {
      const params = new URLSearchParams({
        username: data.username,
        password: data.password,
      });
      if (data.passphrase) {
        params.append('passphrase', data.passphrase);
      }

      const response = await fetchImpl(authUrl('/auth/token'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response, 'ログインに失敗しました'));
      }

      const authResponse = await response.json() as AuthResponse;
      await initializeCsrfTokenBestEffort(initializeCsrfToken);
      return authResponse;
    },

    async verifyMfa(data: MfaVerifyData): Promise<AuthResponse> {
      const response = await fetchImpl(authUrl('/auth/token/verify-mfa'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response, '2段階認証に失敗しました'));
      }

      const authResponse = await response.json() as AuthResponse;
      await initializeCsrfTokenBestEffort(initializeCsrfToken);
      return authResponse;
    },

    async logout(): Promise<{ message: string }> {
      const response = await fetchImpl(authUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response, 'ログアウトに失敗しました'));
      }

      return await response.json() as { message: string };
    },
  };
}
