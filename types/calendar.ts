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
