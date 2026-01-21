import { http } from './http';
import {
  OfficeCalendarAccount,
  CalendarSetupRequest,
  CalendarSetupResponse,
  ServiceAccountUploadRequest,
  CalendarUpdateRequest,
  CalendarDeleteResponse,
} from '@/types/calendar';

const API_V1_PREFIX = '/api/v1';

/**
 * カレンダー連携API
 */
export const calendarApi = {
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
