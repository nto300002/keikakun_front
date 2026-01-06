'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/auth';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // tokenがない場合は初期状態をerrorに設定
  const [status, setStatus] = useState(() => token ? 'verifying' : 'error');
  const [error, setError] = useState(() => token ? '' : '認証トークンが見つかりません。');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    if (!token) return;

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
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Eメール認証</h1>
        {status === 'verifying' && (
          <p className="text-gray-600">メール認証中...</p>
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
            <p className="text-gray-500">{error}</p>
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
