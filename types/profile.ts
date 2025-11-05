/**
 * プロフィール編集関連の型定義
 */

// 名前更新リクエスト
export interface StaffNameUpdate {
  last_name: string;
  first_name: string;
  last_name_furigana: string;
  first_name_furigana: string;
}

// 名前更新レスポンス
export interface StaffNameUpdateResponse {
  id: string;
  last_name: string;
  first_name: string;
  full_name: string;
  last_name_furigana: string;
  first_name_furigana: string;
  updated_at: string;
}

// パスワード変更リクエスト
export interface PasswordChange {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

// パスワード変更レスポンス
export interface PasswordChangeResponse {
  message: string;
  updated_at: string;
  logged_out_devices: number;
}

// メールアドレス変更リクエスト
export interface EmailChangeRequest {
  new_email: string;
  password: string;
}

// メールアドレス変更リクエストレスポンス
export interface EmailChangeRequestResponse {
  message: string;
  verification_token_expires_at: string;
  status: string;
}

// メールアドレス変更確認
export interface EmailChangeConfirm {
  verification_token: string;
}

// メールアドレス変更確認レスポンス
export interface EmailChangeConfirmResponse {
  message: string;
  new_email: string;
  updated_at: string;
}
