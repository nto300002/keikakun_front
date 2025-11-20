export interface AuthResponse {
  access_token?: string; // MFA時は存在しないためオプショナルに
  refresh_token?: string;
  token_type?: string;
  requires_mfa_setup?: boolean;
  requires_mfa_verification?: boolean;
  requires_mfa_first_setup?: boolean; // 管理者が設定したMFAの初回セットアップが必要
  temporary_token?: string;
  qr_code_uri?: string; // MFA初回セットアップ用QRコードURI
  secret_key?: string; // MFA初回セットアップ用シークレットキー
  message?: string; // サーバーからのメッセージ
  expires_in?: number;
  session_duration?: number; // セッション期間（秒）
  session_type?: string; // セッション種別（"standard" | "extended"）
}

export interface LoginData {
  username: string; // email
  password: string;
}