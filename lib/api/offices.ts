/**
 * 事務所API関数
 */
import { http } from '../http';
import {
  OfficeResponse,
  OfficeInfoUpdateRequest,
  OfficeAuditLogsResponse,
} from '@/types/office';

const API_V1_PREFIX = '/api/v1';

export const officesApi = {
  /**
   * 自分の事務所情報を取得
   */
  getMyOffice: (): Promise<OfficeResponse> => {
    return http.get<OfficeResponse>(`${API_V1_PREFIX}/offices/me`);
  },

  /**
   * 事務所情報を更新（オーナーのみ）
   * @param data - 更新データ
   */
  updateOfficeInfo: (data: OfficeInfoUpdateRequest): Promise<OfficeResponse> => {
    return http.put<OfficeResponse>(`${API_V1_PREFIX}/offices/me`, data);
  },

  /**
   * 監査ログを取得（オーナーのみ）
   * @param params - ページネーションパラメータ
   */
  getAuditLogs: (params?: {
    skip?: number;
    limit?: number;
  }): Promise<OfficeAuditLogsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) {
      queryParams.append('skip', String(params.skip));
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', String(params.limit));
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/offices/me/audit-logs?${queryString}`
      : `${API_V1_PREFIX}/offices/me/audit-logs`;
    return http.get<OfficeAuditLogsResponse>(endpoint);
  },
};
