/**
 * 通知関連の型定義
 */

export enum NoticeType {
  // Role変更リクエスト関連（承認者向け）
  ROLE_CHANGE_PENDING = 'role_change_pending',
  ROLE_CHANGE_APPROVED = 'role_change_approved',
  ROLE_CHANGE_REJECTED = 'role_change_rejected',

  // Role変更リクエスト関連（送信者向け）
  ROLE_CHANGE_REQUEST_SENT = 'role_change_request_sent',

  // Employee制限アクション関連（承認者向け）
  EMPLOYEE_ACTION_PENDING = 'employee_action_pending',
  EMPLOYEE_ACTION_APPROVED = 'employee_action_approved',
  EMPLOYEE_ACTION_REJECTED = 'employee_action_rejected',

  // Employee制限アクション関連（送信者向け）
  EMPLOYEE_ACTION_REQUEST_SENT = 'employee_action_request_sent',

  // その他の通知
  SYSTEM_NOTIFICATION = 'system_notification',
  INFO = 'info',
}

export interface Notice {
  id: string;
  type: string; // バックエンドから返されるフィールド名に合わせる
  title: string;
  content: string;
  is_read: boolean;
  recipient_staff_id: string;
  link_url?: string; // リクエストへのリンク（request_idを含む）
  related_request_id?: string; // 関連するリクエストのID（承認/却下アクションに使用）※廃止予定
  created_at: string;
  updated_at?: string;
}

export interface NoticeListResponse {
  notices: Notice[];
  total: number;
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface MarkAsReadResponse {
  message: string;
  notice: Notice;
}

export interface MarkAllAsReadResponse {
  message: string;
  marked_count: number;
}

export interface DeleteNoticeResponse {
  message: string;
}
