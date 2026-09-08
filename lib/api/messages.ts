/**
 * メッセージAPI関数
 */
import { http } from '../http';
import {
  MessageInboxResponse,
  MessageDetailResponse,
  UnreadCountResponse,
  MessageMarkAsReadResponse,
  MessageStatsResponse,
  MessageArchiveResponse,
  MessageBulkOperationResponse,
  SendPersonalMessageRequest,
  SendAnnouncementRequest,
  MessagePersonalCreateResponse,
  MessageAnnouncementCreateResponse,
} from '@/types/message';
import { buildMessageInboxEndpoint, type MessageInboxQueryParams } from './messageQuery';

const API_V1_PREFIX = '/api/v1';

export const messagesApi = {
  /**
   * 受信箱（メッセージ一覧）取得
   * @param params - フィルターパラメータ（is_read: 既読/未読、message_type: メッセージタイプ、skip/limit: ページネーション）
   */
  getInbox: (params?: MessageInboxQueryParams): Promise<MessageInboxResponse> => {
    return http.get<MessageInboxResponse>(buildMessageInboxEndpoint(params));
  },

  /**
   * メッセージ詳細取得
   * @param messageId - メッセージID
   */
  getMessageDetail: (messageId: string): Promise<MessageDetailResponse> => {
    return http.get<MessageDetailResponse>(`${API_V1_PREFIX}/messages/${messageId}`);
  },

  /**
   * 未読件数取得
   */
  getUnreadCount: (): Promise<UnreadCountResponse> => {
    return http.get<UnreadCountResponse>(`${API_V1_PREFIX}/messages/unread-count`);
  },

  /**
   * メッセージを既読にする
   * @param messageId - メッセージID
   */
  markAsRead: (messageId: string): Promise<MessageMarkAsReadResponse> => {
    return http.post<MessageMarkAsReadResponse>(`${API_V1_PREFIX}/messages/${messageId}/read`, {});
  },

  /**
   * 全メッセージを既読にする
   */
  markAllAsRead: (): Promise<MessageBulkOperationResponse> => {
    return http.post<MessageBulkOperationResponse>(`${API_V1_PREFIX}/messages/mark-all-read`, {});
  },

  /**
   * メッセージをアーカイブ/解除する
   * @param messageId - メッセージID
   * @param is_archived - アーカイブするか（true）、解除するか（false）
   */
  archiveMessage: (messageId: string, is_archived: boolean): Promise<MessageArchiveResponse> => {
    return http.post<MessageArchiveResponse>(`${API_V1_PREFIX}/messages/${messageId}/archive`, {
      is_archived,
    });
  },

  /**
   * メッセージ統計を取得（送信者のみ）
   * @param messageId - メッセージID
   */
  getStats: (messageId: string): Promise<MessageStatsResponse> => {
    return http.get<MessageStatsResponse>(`${API_V1_PREFIX}/messages/${messageId}/stats`);
  },

  /**
   * 個別メッセージを送信
   * @param request - 送信リクエスト（受信者ID、タイトル、本文、優先度）
   */
  sendPersonalMessage: (
    request: SendPersonalMessageRequest
  ): Promise<MessagePersonalCreateResponse> => {
    return http.post<MessagePersonalCreateResponse>(`${API_V1_PREFIX}/messages/personal`, request);
  },

  /**
   * 一斉通知（お知らせ）を送信
   * @param request - 送信リクエスト（タイトル、本文、優先度）
   */
  sendAnnouncement: (
    request: SendAnnouncementRequest
  ): Promise<MessageAnnouncementCreateResponse> => {
    return http.post<MessageAnnouncementCreateResponse>(
      `${API_V1_PREFIX}/messages/announcement`,
      request
    );
  },
};
