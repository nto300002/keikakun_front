/**
 * Employee制限アクションリクエスト関連の型定義
 */
import { RequestStatus } from './roleChangeRequest';

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum ResourceType {
  WELFARE_RECIPIENT = 'welfare_recipient',
  SUPPORT_PLAN_CYCLE = 'support_plan_cycle',
  SUPPORT_PLAN_STATUS = 'support_plan_status',
}

export interface EmployeeActionRequest {
  id: string;
  requester_staff_id: string;
  office_id: string;
  resource_type: ResourceType;
  action_type: ActionType;
  resource_id?: number;
  request_data: Record<string, unknown>;
  status: RequestStatus;
  approved_by_staff_id?: string;
  approved_at?: string;
  approver_notes?: string;
  execution_result?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface EmployeeActionRequestListResponse {
  requests: EmployeeActionRequest[];
  total: number;
}

export interface EmployeeActionRequestResponse {
  request: EmployeeActionRequest;
  message?: string;
}

export interface ApproveEmployeeActionPayload {
  notes?: string;
}

export interface RejectEmployeeActionPayload {
  notes?: string;
}

export interface CreateEmployeeActionRequestPayload {
  resource_type: ResourceType;
  action_type: ActionType;
  resource_id?: number | string;
  request_data: Record<string, unknown>;
}
