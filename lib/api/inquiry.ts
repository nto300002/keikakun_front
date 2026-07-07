/**
 * 問い合わせAPIクライアント
 */

import { http } from '../http';
import type {
  InquiryCreateRequest,
  InquiryCreateResponse,
  InquiryListResponse,
  InquiryFullResponse,
  InquiryUpdateRequest,
  InquiryUpdateResponse,
  InquiryDeleteResponse,
  InquiryReplyRequest,
  InquiryReplyResponse,
} from '@/types/inquiry';
import { buildInquiryListEndpoint, type InquiryListQueryParams } from './inquiryQuery';

const API_V1_PREFIX = '/api/v1';

export const inquiryApi = {
  /**
   * 問い合わせを作成（公開API）
   *
   * ログイン済み・未ログインユーザー両方が利用可能
   */
  createInquiry: (data: InquiryCreateRequest): Promise<InquiryCreateResponse> => {
    return http.post<InquiryCreateResponse>(`${API_V1_PREFIX}/inquiries`, data);
  },

  /**
   * 問い合わせ一覧を取得（管理者専用）
   */
  getInquiries: (params?: InquiryListQueryParams): Promise<InquiryListResponse> => {
    return http.get<InquiryListResponse>(buildInquiryListEndpoint(params));
  },

  /**
   * 問い合わせ詳細を取得（管理者専用）
   */
  getInquiry: (inquiryId: string): Promise<InquiryFullResponse> => {
    return http.get<InquiryFullResponse>(
      `${API_V1_PREFIX}/admin/inquiries/${inquiryId}`
    );
  },

  /**
   * 問い合わせに返信（管理者専用）
   */
  replyToInquiry: (
    inquiryId: string,
    data: InquiryReplyRequest
  ): Promise<InquiryReplyResponse> => {
    return http.post<InquiryReplyResponse>(
      `${API_V1_PREFIX}/admin/inquiries/${inquiryId}/reply`,
      data
    );
  },

  /**
   * 問い合わせを更新（管理者専用）
   */
  updateInquiry: (
    inquiryId: string,
    data: InquiryUpdateRequest
  ): Promise<InquiryUpdateResponse> => {
    return http.patch<InquiryUpdateResponse>(
      `${API_V1_PREFIX}/admin/inquiries/${inquiryId}`,
      data
    );
  },

  /**
   * 問い合わせを削除（管理者専用）
   */
  deleteInquiry: (inquiryId: string): Promise<InquiryDeleteResponse> => {
    return http.delete<InquiryDeleteResponse>(
      `${API_V1_PREFIX}/admin/inquiries/${inquiryId}`
    );
  },
};
