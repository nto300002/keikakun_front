// Token management
export const tokenUtils = {
  setToken: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },

  removeToken: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
  },

  setTemporaryToken: (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('temporary_token', token);
  },

  getTemporaryToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('temporary_token');
  },

  removeTemporaryToken: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('temporary_token');
  },
};
