/**
 * 期限アラートAPI関数
 */
import { http } from '../http';
import { DeadlineAlertResponse } from '@/types/deadline';

const API_V1_PREFIX = '/api/v1';

export const deadlineApi = {
  /**
   * 更新期限が近い利用者のアラート一覧を取得
   * @param params - フィルターパラメータ
   * @returns 期限が近い利用者のリスト（残り日数が少ない順）
   */
  getAlerts: (params?: {
    threshold_days?: number; // 通知する残り日数の閾値（デフォルト: 30日）
    limit?: number; // 取得件数上限（指定しない場合は全件）
    offset?: number; // ページネーション用オフセット
  }): Promise<DeadlineAlertResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.threshold_days !== undefined) {
      queryParams.append('threshold_days', String(params.threshold_days));
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', String(params.limit));
    }
    if (params?.offset !== undefined) {
      queryParams.append('offset', String(params.offset));
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_V1_PREFIX}/welfare-recipients/deadline-alerts?${queryString}`
      : `${API_V1_PREFIX}/welfare-recipients/deadline-alerts`;
    return http.get<DeadlineAlertResponse>(endpoint);
  },
};
