'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, tokenUtils } from '@/lib/auth';

export default function MfaVerifyPage() {
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const temporaryToken = tokenUtils.getTemporaryToken();
    if (!temporaryToken) {
      setError('一時トークンが見つかりません。ログインからやり直してください。');
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.verifyMfa({
        temporary_token: temporaryToken,
        totp_code: totpCode,
      });

      if (data.access_token) {
        tokenUtils.setToken(data.access_token);
        tokenUtils.removeTemporaryToken();
        router.push('/dashboard');
      } else {
        setError('MFA検証に失敗しました。');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'MFA検証に失敗しました。';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            MFA認証
          </h2>
          <p className="text-gray-400">
            認証アプリで生成されたコードを入力してください。
          </p>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="totp-code" className="block text-sm font-medium text-gray-300 mb-2">
                認証コード <span className="text-red-400">*</span>
              </label>
              <input
                id="totp-code"
                name="totp-code"
                type="text"
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                placeholder="6桁のコード"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? '検証中...' : '検証'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
