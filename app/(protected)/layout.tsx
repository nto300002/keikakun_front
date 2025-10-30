import ProtectedLayoutClient from '@/components/protected/LayoutClient';
import { verifySession } from '@/lib/dal';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

/**
 * 保護されたレイアウト（サーバーコンポーネント）
 * DALパターンで認証チェックを実施
 */
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  // DALで認証検証（サーバーサイド）
  const session = await verifySession();

  if (!session) {
    // 未認証の場合はログインページにリダイレクト
    redirect('/auth/login');
  }

  // 認証済みの場合、セッション情報をクライアントコンポーネントに渡す
  return (
    <ProtectedLayoutClient user={session.user}>
      {children}
    </ProtectedLayoutClient>
  );
}
