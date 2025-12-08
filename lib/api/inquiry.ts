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
  InquiryStatus,
  InquiryPriority,
} from '@/types/inquiry';

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
  getInquiries: (params?: {
    status?: InquiryStatus;
    assigned?: string;
    priority?: InquiryPriority;
    search?: string;
    skip?: number;
    limit?: number;
    sort?: 'created_at' | 'updated_at' | 'priority';
    order?: 'asc' | 'desc';
    include_test_data?: boolean;
  }): Promise<InquiryListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.status) queryParams.append('status', params.status);
    if (params?.assigned) queryParams.append('assigned', params.assigned);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
    if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    if (params?.include_test_data !== undefined) {
      queryParams.append('include_test_data', String(params.include_test_data));
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/admin/inquiries?${queryString}`
      : `${API_V1_PREFIX}/admin/inquiries`;

    return http.get<InquiryListResponse>(endpoint);
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
