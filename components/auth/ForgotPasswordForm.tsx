'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast-debug';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'パスワードリセットメールの送信に失敗しました');
      }

      // 成功時
      setIsSubmitted(true);
      toast.success(data.message || 'パスワードリセット用のメールを送信しました');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              メール送信完了
            </h2>
            <p className="text-gray-400">
              パスワードリセット用のメールを送信しました
            </p>
          </div>

          <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8">
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 text-sm mb-2">
                  <strong>{email}</strong> 宛にパスワードリセット用のメールを送信しました。
                </p>
                <p className="text-gray-300 text-sm">
                  メール内のリンクをクリックして、新しいパスワードを設定してください。
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 text-sm font-medium mb-2">
                  📧 メールが届かない場合
                </p>
                <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                  <li>迷惑メールフォルダをご確認ください</li>
                  <li>メールアドレスが正しいか確認してください</li>
                  <li>リンクの有効期限は30分です</li>
                </ul>
              </div>

              <button
                onClick={handleBackToLogin}
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

  return (
    <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            パスワードをリセット
          </h2>
          <p className="text-gray-400">
            登録済みのメールアドレスを入力してください
          </p>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-gray-300 text-sm">
                入力されたメールアドレス宛に、パスワードリセット用のリンクを送信します。
                リンクの有効期限は30分です。
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                メールアドレス <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                placeholder="admin@example.com"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? '送信中...' : 'リセットメールを送信'}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              ログイン画面に戻る
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
