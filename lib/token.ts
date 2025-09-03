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
};
