/**
 * 退会リクエストAPI関数
 */
import { http } from '../http';
import {
  WithdrawalRequestCreate,
  WithdrawalRequestResponse,
  WithdrawalRequestListResponse,
  WithdrawalRequestStatus,
  ApproveWithdrawalPayload,
  RejectWithdrawalPayload,
  WithdrawalApprovalResponse,
} from '@/types/withdrawalRequest';

const API_V1_PREFIX = '/api/v1';

export const withdrawalRequestsApi = {
  /**
   * 退会リクエスト作成（オーナー用）
   * @param data - リクエストデータ（タイトル、理由）
   */
  createRequest: (data: WithdrawalRequestCreate): Promise<WithdrawalRequestResponse> => {
    return http.post<WithdrawalRequestResponse>(
      `${API_V1_PREFIX}/withdrawal-requests`,
      data
    );
  },

  /**
   * 退会リクエスト一覧取得
   * @param params - フィルターパラメータ
   */
  getRequests: async (params?: {
    status?: WithdrawalRequestStatus;
    skip?: number;
    limit?: number;
  }): Promise<WithdrawalRequestListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/withdrawal-requests?${queryString}`
      : `${API_V1_PREFIX}/withdrawal-requests`;

    return http.get<WithdrawalRequestListResponse>(endpoint);
  },

  /**
   * 退会リクエスト詳細取得
   * @param requestId - リクエストID
   */
  getRequest: (requestId: string): Promise<WithdrawalRequestResponse> => {
    return http.get<WithdrawalRequestResponse>(
      `${API_V1_PREFIX}/withdrawal-requests/${requestId}`
    );
  },

  /**
   * 退会リクエスト承認（app_admin用）
   * @param requestId - リクエストID
   * @param notes - 承認者のメモ（任意）
   */
  approveRequest: (
    requestId: string,
    notes?: string
  ): Promise<WithdrawalApprovalResponse> => {
    const payload: ApproveWithdrawalPayload = notes ? { notes } : {};
    return http.patch<WithdrawalApprovalResponse>(
      `${API_V1_PREFIX}/withdrawal-requests/${requestId}/approve`,
      payload
    );
  },

  /**
   * 退会リクエスト却下（app_admin用）
   * @param requestId - リクエストID
   * @param notes - 却下理由（必須）
   */
  rejectRequest: (
    requestId: string,
    notes: string
  ): Promise<WithdrawalApprovalResponse> => {
    const payload: RejectWithdrawalPayload = { notes };
    return http.patch<WithdrawalApprovalResponse>(
      `${API_V1_PREFIX}/withdrawal-requests/${requestId}/reject`,
      payload
    );
  },

  /**
   * 自分の事務所の退会リクエストステータス確認（オーナー用）
   */
  getMyRequest: (): Promise<WithdrawalRequestResponse | null> => {
    return http.get<WithdrawalRequestResponse | null>(
      `${API_V1_PREFIX}/withdrawal-requests/me`
    );
  },
};
