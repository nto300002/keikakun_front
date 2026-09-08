type MfaNavigationUser = {
  role: string;
  hasOffice: boolean;
};

export function getPostMfaRoute({ role, hasOffice }: MfaNavigationUser): string {
  if (role === 'app_admin') {
    return '/app-admin';
  }

  if (role !== 'owner' && !hasOffice) {
    return '/auth/select-office';
  }

  return '/dashboard';
}
