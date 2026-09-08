'use client';

import { useEffect, useState, Suspense } from 'react';
import { authApi } from '@/lib/auth';
import { extractTokenFromHash } from '@/lib/tokenUrl';
import Link from 'next/link';

function VerifyEmailContent() {
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = extractTokenFromHash(window.location.hash);
    window.history.replaceState(null, '', window.location.pathname);
    if (!token) {
      queueMicrotask(() => {
        setStatus('error');
        setError('確認リンクが見つかりません。');
      });
      return;
    }

    const verify = async () => {
      try {
        const response = await authApi.verifyEmail(token);
        setUserRole(response.role);
        setStatus('success');
      } catch (err: unknown) {
        setStatus('error');
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('不明なエラーが発生しました。');
        }
      }
    };

    verify();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0C1421]">
      <div className="max-w-md w-full bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-gray-700 p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-slate-950 dark:text-white">Eメール認証</h1>
        {status === 'verifying' && (
          <p className="text-slate-600 dark:text-gray-400">メール認証中...</p>
        )}
        {status === 'success' && (
          <div>
            <p className="text-green-600 mb-4">Eメールの確認が完了しました。</p>
            {userRole === 'owner' ? (
              <Link href="/auth/admin/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                事務所登録
              </Link>
            ) : (
              <Link href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                ログイン
              </Link>
            )}
          </div>
        )}
        {status === 'error' && (
          <div>
            <p className="text-red-600 mb-4">Eメールの確認に失敗しました。</p>
            <p className="text-slate-500 dark:text-gray-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
