export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export interface LoginData {
  username: string; // email
  password: string;
}