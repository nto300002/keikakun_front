'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { toast } from '@/lib/toast-debug';
import { validatePassword, ALLOWED_PASSWORD_SYMBOLS } from '@/lib/password-validation';
import { http } from '@/lib/http';

interface VerifyTokenResponse {
  valid: boolean;
  message?: string;
}

interface ResetPasswordResponse {
  message: string;
}

export default function ResetPasswordForm() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const router = useRouter();

  // URLフラグメントからトークンを取得
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#token=')) {
      const extractedToken = hash.substring(7); // '#token='の7文字を除去
      setToken(extractedToken);

      // セキュリティのため、履歴からフラグメントを削除
      window.history.replaceState(null, '', window.location.pathname);

      // トークンの有効性を確認
      verifyToken(extractedToken);
    } else {
      setIsVerifyingToken(false);
      setTokenError('トークンが見つかりません。パスワードリセットメールのリンクからアクセスしてください。');
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      // 統一されたHTTPクライアントでリクエスト送信
      const data = await http.get<VerifyTokenResponse>(`/api/v1/auth/verify-reset-token?token=${encodeURIComponent(tokenToVerify)}`);

      if (!data.valid) {
        throw new Error(data.message || 'トークンが無効または期限切れです');
      }

      setIsTokenValid(true);
      toast.success('トークンが有効です。新しいパスワードを設定してください。');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'トークンの検証に失敗しました';
      setTokenError(errorMessage);
      setIsTokenValid(false);
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // パスワード確認
    if (password !== confirmPassword) {
      toast.error('パスワードが一致しません');
      return;
    }

    // パスワードバリデーション
    const validationError = validatePassword(password);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // CSRF保護付きでリクエスト送信
      const data = await http.post<ResetPasswordResponse>('/api/v1/auth/reset-password', {
        token,
        new_password: password,
      });

      // 成功時
      toast.success(data.message || 'パスワードが正常にリセットされました');

      // ログイン画面にリダイレクト
      setTimeout(() => {
        router.push('/auth/login?message=' + encodeURIComponent('パスワードが変更されました。新しいパスワードでログインしてください。'));
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // トークン検証中
  if (isVerifyingToken) {
    return (
      <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto"></div>
            <p className="mt-4 text-gray-400">トークンを確認中...</p>
          </div>
        </div>
      </div>
    );
  }

  // トークンが無効
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              トークンエラー
            </h2>
            <p className="text-gray-400">
              トークンが無効または期限切れです
            </p>
          </div>

          <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8">
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{tokenError}</p>
              </div>

              <button
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                新しいリセットリンクをリクエスト
              </button>

              <button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                ログイン画面に戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // パスワードリセットフォーム
  return (
    <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            新しいパスワードを設定
          </h2>
          <p className="text-gray-400">
            新しいパスワードを入力してください
          </p>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-gray-300 text-sm">
                <strong>パスワード要件（全て必須）:</strong>
              </p>
              <ul className="text-gray-300 text-sm mt-2 space-y-1 list-disc list-inside">
                <li>8文字以上</li>
                <li>小文字を含む (a-z)</li>
                <li>大文字を含む (A-Z)</li>
                <li>数字を含む (0-9)</li>
                <li>記号を含む（使用可能な記号: {ALLOWED_PASSWORD_SYMBOLS}）</li>
              </ul>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                新しいパスワード <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent pr-10"
                  placeholder="新しいパスワードを入力"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード確認 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent pr-10"
                  placeholder="もう一度入力してください"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'リセット中...' : 'パスワードをリセット'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
