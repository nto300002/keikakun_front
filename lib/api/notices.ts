/**
 * 通知API関数
 */
import { http } from '../http';
import {
  Notice,
  NoticeListResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  DeleteNoticeResponse,
} from '@/types/notice';

const API_V1_PREFIX = '/api/v1';

export const noticesApi = {
  /**
   * 通知一覧取得
   * @param params - フィルターパラメータ（is_read: 既読/未読、type: 通知タイプ）
   */
  getNotices: (params?: { is_read?: boolean; type?: string }): Promise<NoticeListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.is_read !== undefined) {
      queryParams.append('is_read', String(params.is_read));
    }
    if (params?.type) {
      queryParams.append('type', params.type);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/notices?${queryString}`
      : `${API_V1_PREFIX}/notices`;
    return http.get<NoticeListResponse>(endpoint);
  },

  /**
   * 通知詳細取得
   * @param noticeId - 通知ID
   * @returns 通知の詳細（取得時に自動的に既読になる）
   */
  getNoticeDetail: (noticeId: string): Promise<Notice> => {
    return http.get<Notice>(`${API_V1_PREFIX}/notices/${noticeId}`);
  },

  /**
   * 未読件数取得
   */
  getUnreadCount: (): Promise<UnreadCountResponse> => {
    return http.get<UnreadCountResponse>(`${API_V1_PREFIX}/notices/unread-count`);
  },

  /**
   * 通知を既読にする
   * @param noticeId - 通知ID
   */
  markAsRead: (noticeId: string): Promise<MarkAsReadResponse> => {
    return http.patch<MarkAsReadResponse>(`${API_V1_PREFIX}/notices/${noticeId}/read`, {});
  },

  /**
   * 全通知を既読にする
   */
  markAllAsRead: (): Promise<MarkAllAsReadResponse> => {
    return http.patch<MarkAllAsReadResponse>(`${API_V1_PREFIX}/notices/read-all`, {});
  },

  /**
   * 通知削除
   * @param noticeId - 通知ID
   */
  deleteNotice: (noticeId: string): Promise<DeleteNoticeResponse> => {
    return http.delete<DeleteNoticeResponse>(`${API_V1_PREFIX}/notices/${noticeId}`);
  },
};
