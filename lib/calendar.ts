import { http } from './http';
import {
  OfficeCalendarAccount,
  CalendarSetupRequest,
  CalendarSetupResponse,
  ServiceAccountUploadRequest,
  CalendarUpdateRequest,
  CalendarDeleteResponse,
  CalendarEvent,
  CalendarEventQuery,
} from '@/types/calendar';

const API_V1_PREFIX = '/api/v1';

/**
 * カレンダー連携API
 */
export const calendarApi = {
  /**
   * アプリ内期限カレンダーのイベント一覧を取得
   */
  getEvents: (query: CalendarEventQuery = {}): Promise<CalendarEvent[]> => {
    const params = new URLSearchParams();
    if (query.from_date) params.set('from_date', query.from_date);
    if (query.to_date) params.set('to_date', query.to_date);
    if (query.event_type) params.set('event_type', query.event_type);
    if (query.recipient_id) params.set('recipient_id', query.recipient_id);
    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/calendar/events?${queryString}`
      : `${API_V1_PREFIX}/calendar/events`;
    return http.get<CalendarEvent[]>(endpoint);
  },

  /**
   * 事業所のカレンダー設定を取得
   */
  getOfficeCalendar: (officeId: string): Promise<OfficeCalendarAccount> => {
    return http.get<OfficeCalendarAccount>(`${API_V1_PREFIX}/calendar/office/${officeId}`);
  },

  /**
   * カレンダー設定を作成
   */
  setupCalendar: (data: CalendarSetupRequest): Promise<CalendarSetupResponse> => {
    return http.post<CalendarSetupResponse>(`${API_V1_PREFIX}/calendar/setup`, data);
  },

  /**
   * カレンダーアカウントIDで設定を取得
   */
  getCalendarById: (accountId: string): Promise<OfficeCalendarAccount> => {
    return http.get<OfficeCalendarAccount>(`${API_V1_PREFIX}/calendar/${accountId}`);
  },

  /**
   * サービスアカウントJSONファイルをアップロードしてカレンダー連携を設定
   */
  uploadServiceAccountKey: (
    request: ServiceAccountUploadRequest
  ): Promise<CalendarSetupResponse> => {
    return http.post<CalendarSetupResponse>(`${API_V1_PREFIX}/calendar/setup`, request);
  },

  /**
   * カレンダー設定を更新（JSONファイル再アップロード）
   */
  updateCalendar: (
    accountId: string,
    request: CalendarUpdateRequest
  ): Promise<CalendarSetupResponse> => {
    return http.put<CalendarSetupResponse>(`${API_V1_PREFIX}/calendar/${accountId}`, request);
  },

  /**
   * カレンダー連携を解除
   */
  deleteCalendar: (accountId: string): Promise<CalendarDeleteResponse> => {
    return http.delete<CalendarDeleteResponse>(`${API_V1_PREFIX}/calendar/${accountId}`);
  },
};
