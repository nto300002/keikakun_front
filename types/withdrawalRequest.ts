/**
 * 退会リクエスト関連の型定義
 */

export type WithdrawalRequestStatus = 'pending' | 'approved' | 'rejected';

export interface WithdrawalRequestCreate {
  title: string;
  reason: string;
}

export interface WithdrawalRequestResponse {
  id: string;
  requester_staff_id: string;
  requester_name: string;
  office_id: string;
  office_name: string;
  title: string;
  reason: string;
  status: WithdrawalRequestStatus;
  reviewed_by_staff_id?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequestListResponse {
  requests: WithdrawalRequestResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface ApproveWithdrawalPayload {
  notes?: string;
}

export interface RejectWithdrawalPayload {
  notes: string;
}

export interface WithdrawalApprovalResponse {
  message: string;
  request_id: string;
  status: WithdrawalRequestStatus;
  office_deleted?: boolean;
}
