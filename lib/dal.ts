/**
 * Data Access Layer (DAL)
 *
 * このレイヤーはすべての認証済みデータアクセスを管理します。
 * CVE-2025-29927対策として、Middlewareに依存せずに認証を検証します。
 *
 * @see https://nextjs.org/docs/app/guides/authentication#data-access-layer
 */

import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';

// AuthApiを直接importせず、サーバーサイドで安全に使用できるようにする
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * セッション情報の型定義
 */
export interface Session {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    office?: {
      id: string;
      name: string;
    } | null;
  };
}

/**
 * セッションを検証し、ユーザー情報を取得します
 *
 * この関数はReactの`cache`でラップされており、同一リクエスト内で複数回呼ばれても
 * 実際のAPI呼び出しは1回のみ実行されます（重複排除）
 *
 * @returns セッション情報またはnull（未認証の場合）
 */
export const verifySession = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token');

  // Step 1: Cookieの存在チェック（軽量）
  if (!accessToken) {
    return null;
  }

  // Step 2: バックエンドで実際の認証検証
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/staffs/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `access_token=${accessToken.value}`,
      },
      credentials: 'include',
      cache: 'no-store', // 常に最新の情報を取得
    });

    if (!response.ok) {
      // 401や403などの認証エラー
      return null;
    }

    const user = await response.json();

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        office: user.office ? {
          id: user.office.id,
          name: user.office.name,
        } : null,
      },
    };
  } catch (error) {
    console.error('[DAL] セッション検証に失敗しました:', error);
    return null;
  }
});

/**
 * セッションが有効かどうかをチェックします（簡易版）
 *
 * @returns セッションが有効な場合はtrue
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await verifySession();
  return session !== null;
}

/**
 * 認証が必要なアクションの前に使用します
 * 認証されていない場合はエラーをスローします
 *
 * @throws {Error} 認証されていない場合
 */
export async function requireAuth(): Promise<Session> {
  const session = await verifySession();

  if (!session) {
    throw new Error('未認証: 認証が必要です');
  }

  return session;
}

/**
 * 特定のロールが必要なアクションの前に使用します
 *
 * @param allowedRoles 許可されるロールの配列
 * @throws {Error} 認証されていないか、ロールが不正な場合
 */
export async function requireRole(allowedRoles: string[]): Promise<Session> {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    throw new Error(`アクセス拒否: 必要な権限は [${allowedRoles.join(', ')}] のいずれかです`);
  }

  return session;
}

/**
 * 事業所への所属が必要なアクションの前に使用します
 *
 * @throws {Error} 認証されていないか、事業所に所属していない場合
 */
export async function requireOffice(): Promise<Session> {
  const session = await requireAuth();

  if (!session.user.office) {
    throw new Error('アクセス拒否: 事業所への所属が必要です');
  }

  return session;
}
