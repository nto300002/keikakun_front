/**
 * 監査ログ関連の型定義
 */

export interface AuditLogResponse {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  office_id?: string;
  office_name?: string;
  ip_address: string;
  user_agent: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogListResponse {
  logs: AuditLogResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface AuditLogFilterParams {
  office_id?: string;
  target_type?: string;
  action?: string;
  actor_id?: string;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}

export interface AuditLogCursorParams {
  cursor?: string;
  limit?: number;
}

// アクション種別の定数
export const AUDIT_LOG_ACTIONS = {
  // 退会関連
  WITHDRAWAL_REQUESTED: 'withdrawal.requested',
  WITHDRAWAL_APPROVED: 'withdrawal.approved',
  WITHDRAWAL_REJECTED: 'withdrawal.rejected',
  // スタッフ関連
  STAFF_DELETED: 'staff.deleted',
  ROLE_CHANGED: 'role.changed',
  // 事務所関連
  OFFICE_UPDATED: 'office.updated',
  // 認証関連
  LOGIN_SUCCESS: 'login.success',
  LOGIN_FAILED: 'login.failed',
  MFA_ENABLED: 'mfa.enabled',
  MFA_DISABLED: 'mfa.disabled',
  // 利用規約
  TERMS_AGREED: 'terms.agreed',
  // データエクスポート
  DATA_EXPORTED: 'data.exported',
} as const;

// ターゲット種別の定数
export const AUDIT_LOG_TARGET_TYPES = {
  STAFF: 'staff',
  OFFICE: 'office',
  WITHDRAWAL_REQUEST: 'withdrawal_request',
  ROLE_CHANGE_REQUEST: 'role_change_request',
} as const;
