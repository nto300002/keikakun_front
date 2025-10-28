'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, officeApi } from '@/lib/auth';
import { StaffResponse } from '@/types/staff';
import { OfficeResponse } from '@/types/office';
import AdminMenu from '@/components/protected/admin/AdminMenu';

export default function AdminPage() {
  const [staff, setStaff] = useState<StaffResponse | null>(null);
  const [office, setOffice] = useState<OfficeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      // Cookie認証: httpOnly Cookieから自動的に認証
      // 401エラー時は http.ts で自動的にログインページにリダイレクト

      try {
        const [user, officeData] = await Promise.all([
          authApi.getCurrentUser(),
          officeApi.getMyOffice().catch((error) => {
            if (error.message.includes('404') || error.message.includes('Not Found')) {
              return null;
            }
            throw error;
          }),
        ]);

        // ownerのみアクセス可能（オーナー以外はダッシュボードへリダイレクト）
        if (user.role !== 'owner') {
          router.push('/dashboard');
          return;
        }

        setStaff(user);
        setOffice(officeData);
      } catch (error) {
        console.error('AdminPage: データ取得エラー', error);
        // Cookie認証: 401エラーは http.ts で自動処理されるため、ここでは何もしない
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!staff || staff.role !== 'owner') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">権限がありません</h1>
          <p className="text-gray-400">このページはオーナーのみがアクセスできます。ダッシュボードに戻ります。</p>
        </div>
      </div>
    );
  }

  return <AdminMenu staff={staff} office={office} />;
}
