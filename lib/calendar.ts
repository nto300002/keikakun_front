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
import { buildCalendarIcsExportEndpoint, type CalendarIcsExportQuery } from './calendarExport';

const API_V1_PREFIX = '/api/v1';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

function getFilenameFromContentDisposition(contentDisposition: string | null): string {
  const match = contentDisposition?.match(/filename="([^"]+)"/);
  return match?.[1] || 'keikakun-calendar.ics';
}

function triggerFileDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

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
   * 支援計画ページ向けに期限イベントを .ics ファイルとしてダウンロード
   */
  downloadIcs: async (query: CalendarIcsExportQuery = {}): Promise<void> => {
    const endpoint = buildCalendarIcsExportEndpoint(query);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'カレンダーファイルのダウンロードに失敗しました' }));
      throw new Error(errorData.detail || 'カレンダーファイルのダウンロードに失敗しました');
    }

    const blob = await response.blob();
    const filename = getFilenameFromContentDisposition(response.headers.get('content-disposition'));
    triggerFileDownload(blob, filename);
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
