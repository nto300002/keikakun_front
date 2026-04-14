/**
 * E2Eテスト用データ生成ユーティリティ
 *
 * テスト間の衝突を避けるためタイムスタンプベースのユニーク値を使用する
 */

/** 事前にDBに存在するテスト用オーナーアカウント */
export const TEST_OWNER = {
  email: process.env.E2E_OWNER_EMAIL || 'e2e_owner@example.com',
  password: process.env.E2E_OWNER_PASSWORD || 'E2ePass123!',
};

/** テスト用スタッフ登録データ（毎回ユニークなメールアドレスを生成） */
export function generateStaffData() {
  const uid = Date.now().toString(36);
  return {
    last_name: 'E2E',
    first_name: `スタッフ${uid}`,
    last_name_furigana: 'いーつーいー',
    first_name_furigana: 'すたっふ',
    email: `e2e_staff_${uid}@example.com`,
    role: 'employee' as const,
    password: 'E2ePassword123!',
    confirmPassword: 'E2ePassword123!',
  };
}

/** テスト用利用者登録データ */
export function generateRecipientData() {
  const uid = Date.now().toString(36);
  return {
    last_name: 'E2E',
    first_name: `利用者${uid}`,
    last_name_furigana: 'いーつーいー',
    first_name_furigana: 'りようしゃ',
    birth_date: '1990-01-15',
    address: '東京都新宿区西新宿1-1-1',
    phone: '090-1234-5678',
    disability_type: '知的障害',
  };
}
