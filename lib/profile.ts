/**
 * プロフィール編集用API関数
 */
import { http } from './http';
import {
  StaffNameUpdate,
  StaffNameUpdateResponse,
  PasswordChange,
  PasswordChangeResponse,
  EmailChangeRequest,
  EmailChangeRequestResponse,
  EmailChangeConfirmResponse,
} from '@/types/profile';

const API_V1_PREFIX = '/api/v1';

/**
 * プロフィール編集API
 */
export const profileApi = {
  /**
   * 名前を更新
   */
  updateName: (data: StaffNameUpdate): Promise<StaffNameUpdateResponse> => {
    return http.patch<StaffNameUpdateResponse>(`${API_V1_PREFIX}/staffs/me/name`, data);
  },

  /**
   * パスワードを変更
   */
  changePassword: (data: PasswordChange): Promise<PasswordChangeResponse> => {
    return http.patch<PasswordChangeResponse>(`${API_V1_PREFIX}/staffs/me/password`, data);
  },

  /**
   * メールアドレス変更をリクエスト
   */
  requestEmailChange: (data: EmailChangeRequest): Promise<EmailChangeRequestResponse> => {
    return http.post<EmailChangeRequestResponse>(`${API_V1_PREFIX}/staffs/me/email`, data);
  },

  /**
   * メールアドレス変更を確認・完了
   */
  verifyEmailChange: (token: string): Promise<EmailChangeConfirmResponse> => {
    return http.post<EmailChangeConfirmResponse>(`${API_V1_PREFIX}/staffs/me/email/verify`, { verification_token: token });
  },
};
