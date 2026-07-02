/**
 * Token management - Cookie-based authentication
 *
 * Note: access_tokenはCookieで管理されるため、
 * setToken/getToken/removeTokenは空の実装（互換性のため残す）
 *
 * temporary_tokenは短期間の一時トークンのため、sessionStorageを使用
 */
export const tokenUtils = {

  // Temporary token management (短期間の一時トークンのためsessionStorageを使用)
  setTemporaryToken: (token: string) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('temporary_token', token);
  },

  getTemporaryToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('temporary_token');
  },

  removeTemporaryToken: () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('temporary_token');
  },
};
