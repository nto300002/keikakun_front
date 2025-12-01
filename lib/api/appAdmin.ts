/**
 * アプリ管理者用API関数
 */
import { http } from '../http';
import { OfficeResponse, OfficeListItemResponse, OfficeDetailResponse } from '@/types/office';
import { StaffResponse } from '@/types/staff';

const API_V1_PREFIX = '/api/v1';

export interface OfficeWithStaffsResponse extends OfficeResponse {
  staffs: StaffResponse[];
  staff_count: number;
  terms_agreed_count: number;
}

export interface OfficeListResponse {
  offices: OfficeResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface InquiryResponse {
  id: string;
  staff_id: string;
  staff_name: string;
  office_id: string;
  office_name: string;
  subject: string;
  content: string;
  status: 'unread' | 'read' | 'replied';
  reply_content?: string;
  replied_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InquiryListResponse {
  inquiries: InquiryResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface AnnouncementCreate {
  title: string;
  content: string;
}

export interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
}

export interface AnnouncementListResponse {
  announcements: AnnouncementResponse[];
  total: number;
  skip: number;
  limit: number;
}

export const appAdminApi = {
  /**
   * 事務所一覧取得
   * @param params - 検索パラメータ
   */
  getOffices: async (params?: {
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<OfficeListItemResponse[]> => {
    const queryParams = new URLSearchParams();

    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/admin/offices?${queryString}`
      : `${API_V1_PREFIX}/admin/offices`;

    return http.get<OfficeListItemResponse[]>(endpoint);
  },

  /**
   * 事務所詳細取得（スタッフ情報込み）
   * @param officeId - 事務所ID
   */
  getOffice: (officeId: string): Promise<OfficeDetailResponse> => {
    return http.get<OfficeDetailResponse>(
      `${API_V1_PREFIX}/admin/offices/${officeId}`
    );
  },

  /**
   * 問い合わせ一覧取得
   * @param params - フィルターパラメータ
   */
  getInquiries: async (params?: {
    status?: 'unread' | 'read' | 'replied';
    skip?: number;
    limit?: number;
  }): Promise<InquiryListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/admin/inquiries?${queryString}`
      : `${API_V1_PREFIX}/admin/inquiries`;

    return http.get<InquiryListResponse>(endpoint);
  },

  /**
   * 問い合わせに返信
   * @param inquiryId - 問い合わせID
   * @param content - 返信内容
   */
  replyToInquiry: (
    inquiryId: string,
    content: string
  ): Promise<InquiryResponse> => {
    return http.post<InquiryResponse>(
      `${API_V1_PREFIX}/admin/inquiries/${inquiryId}/reply`,
      { content }
    );
  },

  /**
   * 問い合わせを既読にする
   * @param inquiryId - 問い合わせID
   */
  markInquiryAsRead: (inquiryId: string): Promise<InquiryResponse> => {
    return http.patch<InquiryResponse>(
      `${API_V1_PREFIX}/admin/inquiries/${inquiryId}/read`,
      {}
    );
  },

  /**
   * お知らせ送信
   * @param data - お知らせデータ
   */
  sendAnnouncement: (data: AnnouncementCreate): Promise<AnnouncementResponse> => {
    return http.post<AnnouncementResponse>(
      `${API_V1_PREFIX}/admin/announcements`,
      data
    );
  },

  /**
   * お知らせ履歴取得
   * @param params - ページネーションパラメータ
   */
  getAnnouncements: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<AnnouncementListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/admin/announcements?${queryString}`
      : `${API_V1_PREFIX}/admin/announcements`;

    return http.get<AnnouncementListResponse>(endpoint);
  },
};
