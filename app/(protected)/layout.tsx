import ProtectedLayoutClient from '@/components/protected/LayoutClient';
import { verifySession } from '@/lib/dal';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

/**
 * 保護されたレイアウト（サーバーコンポーネント）
 * DALパターンで認証チェックを実施
 *
 * app_adminロールの場合は専用レイアウトを使用するため、
 * ProtectedLayoutClientをスキップしてchildrenのみを返す
 */
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  // DALで認証検証（サーバーサイド）
  const session = await verifySession();

  if (!session) {
    // 未認証の場合はログインページにリダイレクト
    redirect('/auth/login');
  }

  // app_adminロールの場合は専用レイアウト（app-admin/layout.tsx）に委譲
  // ProtectedLayoutClientの事務所向けヘッダー/フッターは表示しない
  if (session.user.role === 'app_admin') {
    return <>{children}</>;
  }

  // 通常の認証済みユーザーはProtectedLayoutClientを使用
  return (
    <ProtectedLayoutClient user={session.user}>
      {children}
    </ProtectedLayoutClient>
  );
}
