/**
 * カレンダー連携の型定義
 */

export interface OfficeCalendarAccount {
  id: string;
  office_id: string;
  google_calendar_id: string | null;
  calendar_name: string | null;
  calendar_url: string | null;
  service_account_email: string | null;
  connection_status: CalendarConnectionStatus;
  auto_invite_staff: boolean;
  default_reminder_minutes: number;
  last_sync_at: string | null;
  last_error_message: string | null;
  created_at: string;
  updated_at: string;
}

export enum CalendarConnectionStatus {
  NOT_CONNECTED = 'not_connected',
  CONNECTED = 'connected',
  ERROR = 'error',
  SYNCING = 'syncing',
}

export enum CalendarEventType {
  RENEWAL_DEADLINE = 'renewal_deadline',
  NEXT_PLAN_START_DATE = 'next_plan_start_date',
  ASSESSMENT_INCOMPLETE = 'assessment_incomplete',
  CUSTOM = 'custom',
}

export enum CalendarSyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  LOCAL_ONLY = 'local_only',
}

export interface CalendarEvent {
  id: string;
  office_id: string;
  welfare_recipient_id: string;
  support_plan_cycle_id: number | null;
  support_plan_status_id: number | null;
  event_type: CalendarEventType;
  google_calendar_id: string | null;
  google_event_id: string | null;
  google_event_url: string | null;
  event_title: string;
  event_description: string | null;
  event_start_datetime: string;
  event_end_datetime: string;
  created_by_system: boolean;
  sync_status: CalendarSyncStatus;
  last_sync_at: string | null;
  last_error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventQuery {
  from_date?: string;
  to_date?: string;
  event_type?: CalendarEventType;
  recipient_id?: string;
}

export interface CalendarSetupRequest {
  office_id: string;
  google_calendar_id: string;
  service_account_json: string;
  calendar_name?: string;
  auto_invite_staff?: boolean;
  default_reminder_minutes?: number;
}

export interface CalendarSetupResponse {
  success: boolean;
  message: string;
  account?: OfficeCalendarAccount;
  error_details?: string;
}

export interface ServiceAccountUploadRequest {
  google_calendar_id: string;
  service_account_json: string;
  office_id: string;
  calendar_name?: string;
  auto_invite_staff?: boolean;
  default_reminder_minutes?: number;
}

export interface CalendarUpdateRequest {
  office_id: string;
  google_calendar_id: string;
  service_account_json: string;
  calendar_name?: string;
  auto_invite_staff?: boolean;
  default_reminder_minutes?: number;
}

export interface CalendarDeleteResponse {
  success: boolean;
  message: string;
}
