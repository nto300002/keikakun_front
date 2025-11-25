/**
 * CSRF トークン管理ユーティリティ
 *
 * Cookie認証を使用する場合、CSRFトークンの取得と管理を行います。
 */
import { csrfApi } from './api/csrf';
import { setCsrfToken } from './http';

/**
 * CSRFトークンを初期化
 *
 * アプリケーション起動時またはログイン後に呼び出す必要があります。
 * このメソッドは以下を行います:
 * 1. バックエンドからCSRFトークンを取得
 * 2. メモリにトークンを保存
 * 3. 以降の状態変更リクエストで自動的にトークンを送信
 *
 * @returns CSRFトークンの初期化が成功したかどうか
 */
export const initializeCsrfToken = async (): Promise<boolean> => {
  try {
    const token = await csrfApi.getCsrfToken();
    setCsrfToken(token);
    console.log('[CSRF] Token initialized successfully');
    return true;
  } catch (error) {
    console.error('[CSRF] Failed to initialize CSRF token:', error);
    return false;
  }
};

/**
 * CSRFトークンをリフレッシュ
 *
 * トークンの有効期限が切れた場合や、403エラーが発生した場合に呼び出します。
 *
 * @returns リフレッシュが成功したかどうか
 */
export const refreshCsrfToken = async (): Promise<boolean> => {
  console.log('[CSRF] Refreshing CSRF token...');
  return await initializeCsrfToken();
};
