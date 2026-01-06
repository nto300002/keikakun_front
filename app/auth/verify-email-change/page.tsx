'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { profileApi } from '@/lib/profile';

function VerifyEmailChangeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  // tokenがない場合は初期状態をerrorに設定
  const [status, setStatus] = useState(() => token ? 'verifying' : 'error');
  const [error, setError] = useState(() => token ? '' : '確認トークンが見つかりません。');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    if (!token) {
      console.error('[DEBUG FRONT] No token found in URL');
      return;
    }

    console.log('[DEBUG FRONT] Token found:', token.substring(0, 10) + '...');

    const verify = async () => {
      try {
        console.log('[DEBUG FRONT] Calling verifyEmailChange API...');
        const response = await profileApi.verifyEmailChange(token);
        console.log('[DEBUG FRONT] API response:', response);

        setNewEmail(response.new_email);
        setStatus('success');

        // 5秒後にログインページにリダイレクト
        setTimeout(() => {
          router.push('/auth/login?message=メールアドレスを変更しました。新しいメールアドレスでログインしてください');
        }, 5000);
      } catch (err: unknown) {
        console.error('[DEBUG FRONT] Error in verifyEmailChange:', err);
        setStatus('error');
        if (err instanceof Error) {
          console.error('[DEBUG FRONT] Error message:', err.message);
          setError(err.message);
        } else {
          console.error('[DEBUG FRONT] Unknown error:', err);
          setError('メールアドレスの変更に失敗しました。');
        }
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="max-w-md w-full bg-[#1a1a2e] border border-[#2a2a3e] p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">メールアドレス変更</h1>

        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400">メールアドレスを変更中...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-green-500 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-green-500 mb-2 font-semibold">メールアドレスの変更が完了しました</p>
              <p className="text-gray-400 text-sm mb-4">新しいメールアドレス: {newEmail}</p>
            </div>

            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-sm">
                <strong>ℹ️ 再ログインが必要です</strong><br />
                セキュリティのため、新しいメールアドレスでログインし直してください。
              </p>
            </div>

            <p className="text-gray-500 text-sm mb-4">5秒後にログインページに移動します...</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              今すぐログイン
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-red-500 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-500 mb-2 font-semibold">メールアドレスの変更に失敗しました</p>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mb-6">
              <p className="text-yellow-200 text-sm">
                <strong>⚠️ よくある原因</strong><br />
                • 確認リンクの有効期限が切れています（30分）<br />
                • リンクが既に使用されています<br />
                • トークンが無効です
              </p>
            </div>

            <button
              onClick={() => router.push('/auth/login')}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium"
            >
              ログインページに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">読み込み中...</div>
      </div>
    }>
      <VerifyEmailChangeContent />
    </Suspense>
  );
}
