/**
 * メッセージ関連の型定義
 */

export enum MessageType {
  PERSONAL = 'personal',
  ANNOUNCEMENT = 'announcement',
  SYSTEM = 'system',
  INQUIRY = 'inquiry',
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface MessageSenderInfo {
  id: string;
  username: string;
  email: string;
}

export interface Message {
  id: string;
  message_type: MessageType;
  priority: MessagePriority;
  title: string;
  content: string;
  sender_staff_id: string | null;
  sender?: MessageSenderInfo;
  office_id: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRecipient {
  id: string;
  message_id: string;
  recipient_staff_id: string;
  is_read: boolean;
  read_at: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageInboxItem {
  message_id: string;
  message_type: MessageType;
  priority: MessagePriority;
  title: string;
  content: string;
  sender_staff_id: string | null;
  sender?: MessageSenderInfo;
  is_read: boolean;
  read_at: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageInboxResponse {
  messages: MessageInboxItem[];
  total: number;
  unread_count: number;
}

export interface MessageDetailResponse {
  id: string;
  message_type: MessageType;
  priority: MessagePriority;
  title: string;
  content: string;
  sender_staff_id: string | null;
  sender?: MessageSenderInfo;
  office_id: string;
  recipients: MessageRecipient[];
  created_at: string;
  updated_at: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface MessageMarkAsReadResponse {
  message: string;
  message_id: string;
  read_at: string;
}

export interface MessageStatsResponse {
  message_id: string;
  total_recipients: number;
  read_count: number;
  unread_count: number;
  read_rate: number;
}

export interface MessageArchiveResponse {
  message: string;
  message_id: string;
  is_archived: boolean;
}

export interface MessageBulkOperationResponse {
  message: string;
  affected_count: number;
}

export interface SendPersonalMessageRequest {
  recipient_staff_ids: string[];
  title: string;
  content: string;
  priority?: MessagePriority;
}

export interface SendAnnouncementRequest {
  title: string;
  content: string;
  priority?: MessagePriority;
}

export interface MessagePersonalCreateResponse {
  message: string;
  message_id: string;
  recipients_count: number;
}

export interface MessageAnnouncementCreateResponse {
  message: string;
  message_id: string;
  recipients_count: number;
}
