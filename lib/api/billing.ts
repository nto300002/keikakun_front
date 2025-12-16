/**
 * 課金API関数
 */
import { http } from '../http';
import {
  BillingStatusResponse,
  CheckoutSessionResponse,
  PortalSessionResponse,
} from '@/types/billing';

const API_V1_PREFIX = '/api/v1';

export const billingApi = {
  /**
   * 課金ステータスを取得
   *
   * 認証済みユーザーの所属事業所の課金情報を取得します。
   * プライマリの事業所がない場合は最初の事業所の情報を返します。
   *
   * @returns 課金ステータス情報
   * @throws 事業所が見つからない場合、Billing情報が存在しない場合
   */
  getBillingStatus: (): Promise<BillingStatusResponse> => {
    return http.get<BillingStatusResponse>(`${API_V1_PREFIX}/billing/status`);
  },

  /**
   * Stripe Checkout Sessionを作成
   *
   * オーナー権限のみ実行可能。
   * サブスクリプション登録のためのStripe Checkout URLを取得します。
   * 既存のStripe Customer IDがある場合は再利用されます。
   *
   * @returns Checkout SessionのIDとURL
   * @throws オーナー権限がない場合、Stripe設定が不正な場合
   */
  createCheckoutSession: (): Promise<CheckoutSessionResponse> => {
    return http.post<CheckoutSessionResponse>(
      `${API_V1_PREFIX}/billing/create-checkout-session`,
      {} // 空のボディ
    );
  },

  /**
   * Stripe Customer Portal Sessionを作成
   *
   * オーナー権限のみ実行可能。
   * サブスクリプション管理画面（支払い方法変更・キャンセル）へのURLを取得します。
   *
   * @returns Customer Portal URL
   * @throws オーナー権限がない場合、Stripe Customer IDが存在しない場合
   */
  createPortalSession: (): Promise<PortalSessionResponse> => {
    return http.post<PortalSessionResponse>(
      `${API_V1_PREFIX}/billing/create-portal-session`,
      {} // 空のボディ
    );
  },
};
