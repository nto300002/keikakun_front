import { http } from './http';
import { DashboardData } from '@/types/dashboard';

// Type guard to detect axios-like response objects with a `data` property
function hasData<T>(value: unknown): value is { data: T } {
  return typeof value === 'object' && value !== null && 'data' in value;
}

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    const res = await http.get<DashboardData>(`/api/v1/dashboard/`);
    // http.get may return either T (direct) or { data: T } (axios). Handle both safely without `any`.
    if (hasData<DashboardData>(res)) {
      return res.data;
    }
    return res as DashboardData;
  },
};