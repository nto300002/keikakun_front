/**
 * CSRF トークン API
 *
 * Cookie認証を使用する場合、状態変更リクエスト(POST/PUT/DELETE)には
 * CSRFトークンが必要です。
 */
import { http } from '../http';

interface CsrfTokenResponse {
  csrf_token: string;
}

export const csrfApi = {
  /**
   * CSRFトークンを取得
   *
   * このエンドポイントは以下を行います:
   * 1. CSRFトークンを生成
   * 2. トークンをCookie (fastapi-csrf-token) に設定
   * 3. トークンをレスポンスで返す
   *
   * @returns CSRFトークン文字列
   */
  getCsrfToken: async (): Promise<string> => {
    const response = await http.get<CsrfTokenResponse>('/api/v1/csrf-token');
    return response.csrf_token;
  },
};
