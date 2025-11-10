/**
 * Employee制限アクションリクエストAPI関数
 */
import { http } from '../http';
import {
  EmployeeActionRequestListResponse,
  EmployeeActionRequestResponse,
  ApproveEmployeeActionPayload,
  RejectEmployeeActionPayload,
  CreateEmployeeActionRequestPayload,
} from '@/types/employeeActionRequest';
import { RequestStatus } from '@/types/roleChangeRequest';

const API_V1_PREFIX = '/api/v1';

export const employeeActionRequestsApi = {
  /**
   * リクエスト作成
   * @param payload - リクエスト作成データ
   */
  createRequest: (
    payload: CreateEmployeeActionRequestPayload
  ): Promise<EmployeeActionRequestResponse> => {
    return http.post<EmployeeActionRequestResponse>(
      `${API_V1_PREFIX}/employee-action-requests`,
      payload
    );
  },

  /**
   * リクエスト一覧取得
   * @param params - フィルターパラメータ（status: リクエストステータス）
   */
  getRequests: async (params?: {
    status?: RequestStatus;
  }): Promise<EmployeeActionRequestListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/employee-action-requests?${queryString}`
      : `${API_V1_PREFIX}/employee-action-requests`;

    console.log('[DEBUG FRONTEND] Fetching employee action requests:', endpoint);
    const response = await http.get<EmployeeActionRequestListResponse>(endpoint);
    console.log('[DEBUG FRONTEND] Employee action requests response:', response);
    console.log('[DEBUG FRONTEND] Requests count:', response?.requests?.length || 0);
    if (response?.requests) {
      response.requests.forEach((req, index) => {
        console.log(`[DEBUG FRONTEND] Request ${index + 1}:`, {
          id: req.id,
          resource_type: req.resource_type,
          action_type: req.action_type,
          status: req.status,
          request_data: req.request_data,
        });
      });
    }
    return response;
  },

  /**
   * リクエスト承認
   * @param requestId - リクエストID
   * @param notes - 承認者のメモ（任意）
   */
  approveRequest: (
    requestId: string,
    notes?: string
  ): Promise<EmployeeActionRequestResponse> => {
    const payload: ApproveEmployeeActionPayload = notes ? { notes } : {};
    return http.patch<EmployeeActionRequestResponse>(
      `${API_V1_PREFIX}/employee-action-requests/${requestId}/approve`,
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
  ): Promise<EmployeeActionRequestResponse> => {
    const payload: RejectEmployeeActionPayload = notes ? { notes } : {};
    return http.patch<EmployeeActionRequestResponse>(
      `${API_V1_PREFIX}/employee-action-requests/${requestId}/reject`,
      payload
    );
  },

  /**
   * リクエスト削除
   * @param requestId - リクエストID
   */
  deleteRequest: (requestId: string): Promise<{ message: string }> => {
    return http.delete<{ message: string }>(
      `${API_V1_PREFIX}/employee-action-requests/${requestId}`
    );
  },
};
