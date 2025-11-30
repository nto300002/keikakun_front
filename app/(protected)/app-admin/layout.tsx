'use client';

import { ReactNode, useEffect, useState } from 'react';
import { authApi } from '@/lib/auth';
import { initializeCsrfToken } from '@/lib/csrf';

interface AppAdminLayoutProps {
  children: ReactNode;
}

/**
 * app-admin専用レイアウト
 *
 * 通常の事務所向けヘッダー/フッターを表示せず、
 * アプリ管理者向けのシンプルなレイアウトを提供
 */
export default function AppAdminLayout({ children }: AppAdminLayoutProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // CSRFトークンを初期化
    initializeCsrfToken().catch(error => {
      console.error('CSRFトークンの初期化に失敗しました', error);
    });
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await authApi.logout();
      const params = new URLSearchParams({
        hotbar_message: 'ログアウトしました',
        hotbar_type: 'success'
      });
      window.location.href = `/auth/app-admin/login?${params.toString()}`;
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/auth/app-admin/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      {/* app-admin専用ヘッダー */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side */}
            <div className="flex items-center">
              <span className="text-lg font-semibold text-white">
                ケイカくん 管理者コンソール
              </span>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md text-sm font-medium border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
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
            © {new Date().getFullYear()} ケイカくん 管理者コンソール. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
