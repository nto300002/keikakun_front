/**
 * 期限アラート関連の型定義
 */

export interface DeadlineAlert {
  id: string; // 利用者ID（recipient.id）
  full_name: string; // 利用者フルネーム
  alert_type: 'renewal_deadline' | 'renewal_overdue' | 'assessment_incomplete'; // アラートタイプ
  message: string; // アラートメッセージ
  next_renewal_deadline?: string | null; // 次回更新期限（ISO 8601形式、renewal_deadlineの場合）
  days_remaining?: number | null; // 残り日数（renewal_deadlineまたはrenewal_overdueの場合、負の値は期限切れ日数を示す）
  current_cycle_number: number; // 現在のサイクル番号
}

export interface DeadlineAlertResponse {
  alerts: DeadlineAlert[]; // 期限が近い利用者のリスト
  total: number; // 条件に合致する全利用者数
}
