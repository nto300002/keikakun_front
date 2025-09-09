// Token management
export const tokenUtils = {
  setToken: (token: string) => {
    localStorage.setItem('access_token', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  removeToken: () => {
    localStorage.removeItem('access_token');
  },

  setTemporaryToken: (token: string) => {
    localStorage.setItem('temporary_token', token);
  },

  getTemporaryToken: (): string | null => {
    return localStorage.getItem('temporary_token');
  },

  removeTemporaryToken: () => {
    localStorage.removeItem('temporary_token');
  },
};
