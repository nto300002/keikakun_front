export interface AuthResponse {
  access_token?: string; // MFA時は存在しないためオプショナルに
  refresh_token?: string;
  token_type?: string;
  requires_mfa_setup?: boolean;
  requires_mfa_verification?: boolean;
  temporary_token?: string;
  expires_in?: number;
  session_duration?: number; // セッション期間（秒）
  session_type?: string; // セッション種別（"standard" | "extended"）
}

export interface LoginData {
  username: string; // email
  password: string;
  rememberMe?: boolean; // ログイン状態保持フラグ
}