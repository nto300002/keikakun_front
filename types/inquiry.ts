/**
 * 問い合わせ関連の型定義
 */

/**
 * 問い合わせステータス
 */
export type InquiryStatus = 'new' | 'open' | 'in_progress' | 'answered' | 'closed' | 'spam';

/**
 * 問い合わせ優先度
 */
export type InquiryPriority = 'low' | 'normal' | 'high';

/**
 * 問い合わせカテゴリ
 */
export type InquiryCategory = '不具合' | '質問' | 'その他';

/**
 * スタッフ情報
 */
export interface StaffInfo {
  id: string;
  name: string;
  email: string;
}

/**
 * 問い合わせ送信リクエスト
 */
export interface InquiryCreateRequest {
  title: string;
  content: string;
  category?: InquiryCategory;
  sender_name?: string;
  sender_email?: string;
}

/**
 * 問い合わせ送信レスポンス
 */
export interface InquiryCreateResponse {
  id: string;
  message: string;
}

/**
 * 問い合わせ一覧項目
 */
export interface InquiryListItem {
  id: string;
  message_id: string;
  title: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  sender_name: string | null;
  sender_email: string | null;
  assigned_staff_id: string | null;
  assigned_staff?: StaffInfo | null;
  created_at: string;
  updated_at: string;
}

/**
 * メッセージ情報
 */
export interface MessageInfo {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

/**
 * 問い合わせ詳細情報
 */
export interface InquiryDetailInfo {
  id: string;
  sender_name: string | null;
  sender_email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  status: InquiryStatus;
  priority: InquiryPriority;
  assigned_staff_id: string | null;
  admin_notes: string | null;
  delivery_log: unknown[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * 問い合わせ詳細レスポンス
 */
export interface InquiryFullResponse {
  id: string;
  message: MessageInfo;
  inquiry_detail: InquiryDetailInfo;
  assigned_staff: StaffInfo | null;
  reply_history: InquiryReply[] | null;
}

/**
 * 問い合わせ返信履歴
 */
export interface InquiryReply {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
}

/**
 * 問い合わせ一覧レスポンス
 */
export interface InquiryListResponse {
  inquiries: InquiryListItem[];
  total: number;
}

/**
 * 問い合わせ返信リクエスト
 */
export interface InquiryReplyRequest {
  body: string;
  send_email?: boolean;
}

/**
 * 問い合わせ返信レスポンス
 */
export interface InquiryReplyResponse {
  id: string;
  message: string;
}

/**
 * 問い合わせ更新リクエスト
 */
export interface InquiryUpdateRequest {
  status?: InquiryStatus;
  assigned_staff_id?: string;
  priority?: InquiryPriority;
  admin_notes?: string;
}

/**
 * 問い合わせ更新レスポンス
 */
export interface InquiryUpdateResponse {
  id: string;
  message: string;
}

/**
 * 問い合わせ削除レスポンス
 */
export interface InquiryDeleteResponse {
  message: string;
}

/**
 * 問い合わせフィルターパラメータ
 */
export interface InquiryFilterParams {
  status?: InquiryStatus;
  assigned?: string;
  priority?: InquiryPriority;
  search?: string;
  skip?: number;
  limit?: number;
  sort?: 'created_at' | 'updated_at' | 'priority';
}
