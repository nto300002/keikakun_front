'use client';

import { useState, useEffect, ReactNode, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, tokenUtils, officeApi } from '@/lib/auth';
import { StaffResponse } from '@/types/staff';


export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffResponse | null>(null);
  const [officeName, setOfficeName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!tokenUtils.getToken()) {
        router.push('/auth/login');
        return;
      }

      try {
        const [user, office] = await Promise.all([
          authApi.getCurrentUser(),
          officeApi.getMyOffice().catch(error => {
            if (error.message.includes('404') || error.message.includes('Not Found')) {
              return null;
            }
            throw error;
          })
        ]);

        setStaff(user);
        if (office) {
          setOfficeName(office.name);
        }

      } catch (error) {
        console.error('認証またはデータ取得に失敗しました', error);
        tokenUtils.removeToken();
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleLogout = () => {
    tokenUtils.removeToken();
    const params = new URLSearchParams({
        hotbar_message: 'ログアウトしました',
        hotbar_type: 'success'
    });
    router.push(`/auth/login?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={null}> 
      <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left Side */}
              <div className="flex items-center">
                <Link href="/dashboard" className="text-lg font-semibold text-white hover:text-blue-400">
                  {officeName ? officeName : '事務所名が登録されていません'}
                </Link>
              </div>

              {/* Right Side */}
              <div className="flex items-center space-x-4">
                {staff?.role === 'owner' && (
                  <Link href="/admin/settings" className="text-sm font-medium text-gray-300 hover:text-white">
                    管理者設定
                  </Link>
                )}
                <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white">
                  ダッシュボード
                </Link>
                <Link href="/profile" className="text-sm font-medium text-gray-300 hover:text-white">
                  プロフィール
                </Link>
                <button className="text-gray-400 hover:text-white relative p-2 rounded-md hover:bg-gray-700">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md text-sm font-medium border border-gray-600"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-grow container mx-auto p-6 md:p-8 bg-gray-800 text-gray-100 rounded-lg shadow-md my-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700">
          <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-400">
              © {new Date().getFullYear()} ケイカくん. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Suspense>
  );
}
