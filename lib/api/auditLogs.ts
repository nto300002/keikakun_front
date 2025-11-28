/**
 * 監査ログAPI関数（app_admin用）
 */
import { http } from '../http';
import {
  AuditLogListResponse,
  AuditLogFilterParams,
  AuditLogCursorParams,
  AuditLogResponse,
} from '@/types/auditLog';

const API_V1_PREFIX = '/api/v1';

export const auditLogsApi = {
  /**
   * 監査ログ一覧取得（フィルター付きページネーション）
   * @param params - フィルターパラメータ
   */
  getLogs: async (params?: AuditLogFilterParams): Promise<AuditLogListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.office_id) {
      queryParams.append('office_id', params.office_id);
    }
    if (params?.target_type) {
      queryParams.append('target_type', params.target_type);
    }
    if (params?.action) {
      queryParams.append('action', params.action);
    }
    if (params?.actor_id) {
      queryParams.append('actor_id', params.actor_id);
    }
    if (params?.start_date) {
      queryParams.append('start_date', params.start_date);
    }
    if (params?.end_date) {
      queryParams.append('end_date', params.end_date);
    }
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/admin/audit-logs?${queryString}`
      : `${API_V1_PREFIX}/admin/audit-logs`;

    return http.get<AuditLogListResponse>(endpoint);
  },

  /**
   * 監査ログ一覧取得（カーソルベースページネーション）
   * @param params - カーソルパラメータ
   */
  getLogsCursor: async (params?: AuditLogCursorParams): Promise<AuditLogResponse[]> => {
    const queryParams = new URLSearchParams();

    if (params?.cursor) {
      queryParams.append('cursor', params.cursor);
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/admin/audit-logs/cursor?${queryString}`
      : `${API_V1_PREFIX}/admin/audit-logs/cursor`;

    return http.get<AuditLogResponse[]>(endpoint);
  },

  /**
   * 監査ログ詳細取得
   * @param logId - ログID
   */
  getLog: (logId: string): Promise<AuditLogResponse> => {
    return http.get<AuditLogResponse>(
      `${API_V1_PREFIX}/admin/audit-logs/${logId}`
    );
  },
};
