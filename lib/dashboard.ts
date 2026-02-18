import { http } from './http';
import { DashboardData } from '@/types/dashboard';

// Type guard to detect axios-like response objects with a `data` property
function hasData<T>(value: unknown): value is { data: T } {
  return typeof value === 'object' && value !== null && 'data' in value;
}

export interface DashboardParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  is_overdue?: boolean;
  is_upcoming?: boolean;
  has_assessment_due?: boolean;  // 未完了のアセスメント開始期限が設定されている利用者
  status?: string;
  cycle_number?: number;
  skip?: number;
  limit?: number;
}

export const dashboardApi = {
  getDashboardData: async (params: DashboardParams = {}): Promise<DashboardData> => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // APIのパラメータ名に合わせてキーを変換
        const paramKey = key === 'sortBy' ? 'sort_by' : key === 'sortOrder' ? 'sort_order' : key === 'searchTerm' ? 'search_term' : key;
        queryParams.append(paramKey, String(value));
      }
    });

    const queryString = queryParams.toString();
    const res = await http.get<DashboardData>(`/api/v1/dashboard/?${queryString}`);
    
    if (hasData<DashboardData>(res)) {
      return res.data;
    }
    return res as DashboardData;
  },
};