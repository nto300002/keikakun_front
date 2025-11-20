/**
 * MFA（多要素認証）管理API関数
 */
import { http } from '../http';
import { MfaEnableResponse, MfaDisableResponse } from '@/types/mfa';
import { AuthResponse } from '@/types/auth';

const API_V1_PREFIX = '/api/v1';

export const mfaApi = {
  /**
   * 管理者によるスタッフのMFA有効化
   * @param staffId - 対象スタッフのID
   * @returns MFA有効化レスポンス
   */
  adminEnableStaffMfa: (staffId: string): Promise<MfaEnableResponse> => {
    return http.post<MfaEnableResponse>(
      `${API_V1_PREFIX}/auth/admin/staff/${staffId}/mfa/enable`,
      {}
    );
  },

  /**
   * 管理者によるスタッフのMFA無効化
   * @param staffId - 対象スタッフのID
   * @returns MFA無効化レスポンス
   */
  adminDisableStaffMfa: (staffId: string): Promise<MfaDisableResponse> => {
    return http.post<MfaDisableResponse>(
      `${API_V1_PREFIX}/auth/admin/staff/${staffId}/mfa/disable`,
      {}
    );
  },

  /**
   * MFA初回検証（管理者設定後）
   * @param temporaryToken - 一時トークン
   * @param totpCode - TOTPコード
   * @returns 認証レスポンス
   */
  verifyMfaFirstTime: (temporaryToken: string, totpCode: string): Promise<AuthResponse> => {
    return http.post<AuthResponse>(
      `${API_V1_PREFIX}/auth/mfa/first-time-verify`,
      {
        temporary_token: temporaryToken,
        totp_code: totpCode,
      }
    );
  },
};
