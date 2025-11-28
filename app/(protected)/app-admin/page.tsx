'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth';
import { StaffResponse } from '@/types/staff';
import AppAdminDashboard from '@/components/protected/app-admin/AppAdminDashboard';

export default function AppAdminPage() {
  const [staff, setStaff] = useState<StaffResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await authApi.getCurrentUser();

        // app_adminのみアクセス可能
        if (user.role !== 'app_admin') {
          router.push('/dashboard');
          return;
        }

        setStaff(user);
      } catch (error) {
        console.error('AppAdminPage: データ取得エラー', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!staff || staff.role !== 'app_admin') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">権限がありません</h1>
          <p className="text-gray-400">このページはアプリ管理者のみがアクセスできます。</p>
        </div>
      </div>
    );
  }

  return <AppAdminDashboard staff={staff} />;
}
