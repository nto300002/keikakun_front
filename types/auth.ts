export interface AuthResponse {
  access_token?: string; // MFA時は存在しないためオプショナルに
  refresh_token?: string;
  token_type?: string;
  requires_mfa_setup?: boolean;
  requires_mfa_verification?: boolean;
  temporary_token?: string;
}

export interface LoginData {
  username: string; // email
  password: string;
}