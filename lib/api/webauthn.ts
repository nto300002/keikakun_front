import { http } from '@/lib/http';

export interface WebAuthnCredential {
  id: string;
  display_name: string;
  transports: string[];
  created_at: string;
  last_used_at: string | null;
}

export interface WebAuthnOptionsResponse {
  publicKey: Record<string, unknown>;
}

export const webauthnApi = {
  getRegistrationOptions: () =>
    http.post<WebAuthnOptionsResponse>('/api/v1/auth/webauthn/registration/options', {}),
  verifyRegistration: (credential: Record<string, unknown>, displayName: string) =>
    http.post<WebAuthnCredential>('/api/v1/auth/webauthn/registration/verify', {
      credential,
      display_name: displayName,
    }),
  listCredentials: () =>
    http.get<WebAuthnCredential[]>('/api/v1/auth/webauthn/credentials'),
  updateCredential: (credentialId: string, displayName: string) =>
    http.patch<WebAuthnCredential>(`/api/v1/auth/webauthn/credentials/${credentialId}`, {
      display_name: displayName,
    }),
  revokeCredential: (credentialId: string) =>
    http.delete<void>(`/api/v1/auth/webauthn/credentials/${credentialId}`),
  getAuthenticationOptions: (pendingToken: string) =>
    http.post<WebAuthnOptionsResponse>('/api/v1/auth/webauthn/authentication/options', {
      pending_token: pendingToken,
    }),
  verifyAuthentication: (pendingToken: string, credential: Record<string, unknown>) =>
    http.post('/api/v1/auth/webauthn/authentication/verify', {
      pending_token: pendingToken,
      credential,
    }),
};
