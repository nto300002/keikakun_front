/**
 * MFA（多要素認証）関連の型定義
 */

/**
 * MFA操作のレスポンス
 */
export interface MfaResponse {
  message: string;
}

/**
 * 管理者によるMFA有効化レスポンス
 */
export type MfaEnableResponse = MfaResponse;

/**
 * 管理者によるMFA無効化レスポンス
 */
export type MfaDisableResponse = MfaResponse;
