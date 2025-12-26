/**
 * 課金関連の型定義
 */
import { BillingStatus } from './enums';

/**
 * 課金ステータス取得APIのレスポンス
 */
export interface BillingStatusResponse {
  billing_status: BillingStatus;
  trial_end_date: string; // ISO 8601形式の日時文字列
  next_billing_date: string | null; // ISO 8601形式の日時文字列
  current_plan_amount: number; // 円単位（例: 6000）
  subscription_start_date: string | null; // サブスクリプション開始日
  scheduled_cancel_at: string | null; // スケジュールされたキャンセル日時
  trial_days_remaining: number | null; // 無料期間の残り日数（computed field）
}

/**
 * Checkout Session作成APIのレスポンス
 */
export interface CheckoutSessionResponse {
  session_id: string; // Stripe Checkout Session ID (cs_test_xxx)
  url: string; // Stripe Checkout URL
}

/**
 * Customer Portal Session作成APIのレスポンス
 */
export interface PortalSessionResponse {
  url: string; // Stripe Customer Portal URL
}
