/**
 * E2Eテスト用データ生成ユーティリティ
 *
 * テスト間の衝突を避けるためタイムスタンプベースのユニーク値を使用する
 */

/**
 * 必須環境変数を取得する。未設定の場合は即エラーを投げる。
 * フォールバック値にパスワードを書かないためのガード。
 */
function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(
      `環境変数 ${key} が設定されていません。` +
      `E2Eテスト実行前に .env.local に設定してください。`
    );
  }
  return val;
}

/** 事前にDBに存在するテスト用オーナーアカウント（env必須） */
export const TEST_OWNER = {
  email: requireEnv('E2E_OWNER_EMAIL'),
  password: requireEnv('E2E_OWNER_PASSWORD'),
};

/**
 * テスト用スタッフ登録データ（毎回ユニークなメールアドレスを生成）
 *
 * パスワードは E2E_STAFF_PASSWORD 環境変数から取得（必須）。
 * .env.local に設定すること。
 */
export function generateStaffData() {
  const uid = Date.now().toString(36);
  const password = requireEnv('E2E_STAFF_PASSWORD');
  return {
    last_name: 'E2E',
    first_name: `スタッフ${uid}`,
    last_name_furigana: 'いーつーいー',
    first_name_furigana: 'すたっふ',
    email: `e2e_staff_${uid}@example.com`,
    role: 'employee' as const,
    password,
    confirmPassword: password,
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

/** バックエンド API のベース URL（テストヘルパー共通） */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
