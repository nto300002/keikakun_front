import type { DashboardData } from '../../types/dashboard';

export type DashboardDataClient = DashboardData;

export function normalizeDashboardData(
  data: DashboardData | null
): DashboardData | null {
  if (!data) return null;
  if (Array.isArray(data.recipients)) return data;

  return {
    ...data,
    recipients: [],
  };
}
