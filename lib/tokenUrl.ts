/**
 * メールリンクのfragmentからtokenを取り出します。
 * token以外のfragmentは受け付けず、不正なURLエンコードも無効扱いにします。
 */
export function extractTokenFromHash(hash: string): string | null {
  if (!hash.startsWith('#token=')) return null;

  const encodedToken = hash.slice('#token='.length);
  if (!encodedToken) return null;

  try {
    const token = decodeURIComponent(encodedToken);
    return token || null;
  } catch {
    return null;
  }
}
