'use client';

import { ReactNode, useEffect, useState } from 'react';
import { authApi } from '@/lib/auth';
import { initializeCsrfToken } from '@/lib/csrf';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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
    <div className="min-h-screen bg-slate-100 text-slate-900 font-semibold flex flex-col dark:bg-gray-900 dark:text-gray-200">
      {/* app-admin専用ヘッダー */}
      <header className="bg-white border-b border-slate-300 sticky top-0 z-10 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                ケイカくん 管理者コンソール
              </span>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-md text-base font-semibold border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
              >
                {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-6 md:p-8 bg-white text-slate-900 rounded-lg shadow-md my-6 dark:bg-gray-800 dark:text-gray-100">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-300 dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base font-semibold text-slate-600 dark:text-gray-300">
            © {new Date().getFullYear()} ケイカくん 管理者コンソール. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
