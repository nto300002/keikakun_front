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

export interface AnnouncementCreate {
  title: string;
  content: string;
}

export interface AnnouncementResponse {
  id: string;
  sender_staff_id: string | null;
  office_id: string;
  message_type: 'announcement';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  recipient_count?: number | null;
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
