export interface AdminCreateData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface StaffCreateData extends AdminCreateData {
  role: 'manager' | 'employee';
}

export interface StaffResponse {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: 'owner' | 'manager' | 'employee';
  is_mfa_enabled: boolean;
  office?: { id: string; name: string; } | null;
  // ふりがなフィールド（オプション）
  last_name_furigana?: string;
  first_name_furigana?: string;
  // 論理削除フィールド
  is_deleted: boolean;
  deleted_at: string | null;
  // DEPRECATED: 後方互換性のため残す。新規コードではfull_nameを使用すること
  name?: string;
}