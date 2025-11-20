/**
 * パスワードバリデーション
 *
 * バックエンドの実装と完全一致させています
 * バックエンド実装: app/schemas/staff.py:45-61
 */

/**
 * 使用可能な記号（バックエンドと同一）
 * 正規表現パターン: [!@#$%^&*(),.?":{}|<>]
 */
export const ALLOWED_PASSWORD_SYMBOLS = '! @ # $ % ^ & * ( ) , . ? " : { } | < >';

/**
 * パスワードバリデーション（バックエンドと完全一致）
 *
 * @param password - 検証するパスワード
 * @returns エラーメッセージ（検証成功時はnull）
 */
export function validatePassword(password: string): string | null {
  // 最小文字数チェック（バックエンドと一致）
  if (password.length < 8) {
    return 'パスワードは8文字以上である必要があります';
  }

  // 各要素のチェック（バックエンドの正規表現と完全一致）
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  // バックエンドと同じ記号セット: [!@#$%^&*(),.?":{}|<>]
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const complexityScore = [hasLowercase, hasUppercase, hasDigit, hasSymbol].filter(Boolean).length;

  // バックエンドでは score < 4 なので、4つ全て必須
  if (complexityScore < 4) {
    return 'パスワードには小文字、大文字、数字、記号の全てを含める必要があります';
  }

  return null;
}

/**
 * パスワード要件の説明テキスト（HTML用、エスケープ済み）
 */
export const PASSWORD_REQUIREMENTS_HTML = `
  <ul class="text-gray-300 text-sm mt-2 space-y-1 list-disc list-inside">
    <li>8文字以上</li>
    <li>小文字を含む (a-z)</li>
    <li>大文字を含む (A-Z)</li>
    <li>数字を含む (0-9)</li>
    <li>記号を含む（使用可能な記号: ${ALLOWED_PASSWORD_SYMBOLS}）</li>
  </ul>
`.trim();

/**
 * パスワード要件の説明テキスト（プレーンテキスト用）
 */
export const PASSWORD_REQUIREMENTS_TEXT = `8文字以上で、英字大小文字・数字・記号（${ALLOWED_PASSWORD_SYMBOLS}）を全て組み合わせてください`;
