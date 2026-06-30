/**
 * Role変更リクエストAPI関数
 */
import { http } from '../http';
import {
  RoleChangeRequestCreate,
  RoleChangeRequestListResponse,
  RoleChangeRequestResponse,
  RequestStatus,
  ApproveRequestPayload,
  RejectRequestPayload,
} from '@/types/roleChangeRequest';

const API_V1_PREFIX = '/api/v1';

export const roleChangeRequestsApi = {
  /**
   * リクエスト作成
   * @param data - リクエストデータ
   */
  createRequest: (data: RoleChangeRequestCreate): Promise<RoleChangeRequestResponse> => {
    return http.post<RoleChangeRequestResponse>(
      `${API_V1_PREFIX}/role-change-requests`,
      data
    );
  },

  /**
   * リクエスト一覧取得
   * @param params - フィルターパラメータ（status: リクエストステータス）
   */
  getRequests: async (params?: { status?: RequestStatus }): Promise<RoleChangeRequestListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/role-change-requests?${queryString}`
      : `${API_V1_PREFIX}/role-change-requests`;

    return http.get<RoleChangeRequestListResponse>(endpoint);
  },

  /**
   * リクエスト承認
   * @param requestId - リクエストID
   * @param notes - 承認者のメモ（任意）
   */
  approveRequest: (
    requestId: string,
    notes?: string
  ): Promise<RoleChangeRequestResponse> => {
    const payload: ApproveRequestPayload = notes ? { notes } : {};
    return http.patch<RoleChangeRequestResponse>(
      `${API_V1_PREFIX}/role-change-requests/${requestId}/approve`,
      payload
    );
  },

  /**
   * リクエスト却下
   * @param requestId - リクエストID
   * @param notes - 却下理由（任意）
   */
  rejectRequest: (
    requestId: string,
    notes?: string
  ): Promise<RoleChangeRequestResponse> => {
    const payload: RejectRequestPayload = notes ? { notes } : {};
    return http.patch<RoleChangeRequestResponse>(
      `${API_V1_PREFIX}/role-change-requests/${requestId}/reject`,
      payload
    );
  },

  /**
   * リクエスト削除
   * @param requestId - リクエストID
   */
  deleteRequest: (requestId: string): Promise<{ message: string }> => {
    return http.delete<{ message: string }>(
      `${API_V1_PREFIX}/role-change-requests/${requestId}`
    );
  },
};
