/**
 * Role変更リクエスト関連の型定義
 */
import { StaffRole } from './enums';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface RoleChangeRequest {
  id: string;
  requester_staff_id: string;
  office_id: string;
  from_role: StaffRole;
  requested_role: StaffRole;
  status: RequestStatus;
  request_notes?: string;
  reviewed_by_staff_id?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface RoleChangeRequestCreate {
  requested_role: StaffRole;
  request_notes?: string;
}

export interface RoleChangeRequestListResponse {
  requests: RoleChangeRequest[];
  total: number;
}

export interface RoleChangeRequestResponse {
  request: RoleChangeRequest;
  message?: string;
}

export interface ApproveRequestPayload {
  notes?: string;
}

export interface RejectRequestPayload {
  notes?: string;
}
