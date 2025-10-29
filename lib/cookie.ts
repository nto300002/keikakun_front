/**
 * Server Component用: Cookieからアクセストークンを取得
 * Server Componentでのみ使用可能（Client Componentでは使用不可）
 *
 * 注意: この関数はServer Componentでのみ呼び出してください。
 * Client Componentから呼び出すとエラーになります。
 */
export async function getTokenFromCookies(): Promise<string | null> {
  try {
    // 動的インポートを使用してServer Component専用コードを読み込む
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token');
    return token?.value || null;
  } catch (error) {
    // Server Component以外で呼び出された場合はnullを返す
    console.error('[Cookie] Failed to get token from cookies:', error);
    return null;
  }
}

/**
 * Client Component用: localStorageからアクセストークンを取得（互換性維持）
 * 将来的にはCookieのみに移行予定
 */
export function getTokenFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}
