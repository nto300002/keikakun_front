'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, tokenUtils } from '@/lib/auth';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'; // アイコンをインポート
import { toast } from '@/lib/toast-debug';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const messageShownRef = useRef(false); // メッセージ表示済みフラグ

  // 自動認証チェックを削除: middlewareとDALパターンに委譲
  // これによりログインページでの不要な401エラーを防ぐ

  // クエリパラメータからメッセージを読み取ってtoastを表示
  useEffect(() => {
    // 既にメッセージを表示済みの場合はスキップ（重複防止）
    if (messageShownRef.current) {
      console.log('📨 [LoginForm] メッセージは既に表示済みです。スキップします。');
      return;
    }

    const message = searchParams.get('message');
    if (message) {
      console.log('📨 [LoginForm] クエリパラメータからメッセージを検出:', message);
      console.log('📨 [LoginForm] toastを表示します');
      toast.success(decodeURIComponent(message));
      console.log('📨 [LoginForm] toast.success呼び出し完了');
      messageShownRef.current = true; // 表示済みフラグを立てる

      // クエリパラメータをクリア
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
      console.log('📨 [LoginForm] クエリパラメータをクリアしました');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await authApi.login({
        username: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (data.requires_mfa_verification && data.temporary_token) {
        // MFA認証が必要な場合
        tokenUtils.setTemporaryToken(data.temporary_token);
        router.push('/auth/mfa-verify');
      } else {
        // ログイン成功（Cookieで管理される）
        // ログインユーザーの情報を取得
        const currentUser = await authApi.getCurrentUser();

        // 条件分岐
        if (currentUser.role !== 'owner' && !currentUser.office) {
          // ownerではなく、事業所にも所属していない場合
          router.push('/auth/select-office');
        } else {
          // それ以外は、リダイレクト元があればそこへ、なければダッシュボードへ
          const from = searchParams.get('from');
          const params = new URLSearchParams({
            hotbar_message: 'ログインに成功しました',
            hotbar_type: 'success'
          });

          // リダイレクト先を決定
          let redirectTo = '/dashboard';
          if (from && from.startsWith('/') && !from.startsWith('/auth')) {
            // `from` パラメータが有効な内部パスの場合はそこへリダイレクト
            redirectTo = from;
          }

          router.push(`${redirectTo}?${params.toString()}`);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ... header ... */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            ログイン
          </h2>
          <p className="text-gray-400">
            ケイカくんにログインして、個別支援計画を管理しましょう
          </p>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* ... email input ... */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                メールアドレス <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent pr-10"
                  placeholder="パスワードを入力してください"
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

            {/* ... remember me and forgot password ... */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="text-[#10B981] bg-[#1A1A1A] border-gray-600 rounded focus:ring-[#10B981]"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                  ログイン状態を保持(8時間)
                </label>
              </div>
              
              <a href="#" className="text-sm text-[#10B981] hover:text-[#0F9F6E] underline">
                パスワードをお忘れですか？
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              まだアカウントをお持ちでない方は
              <a href="/auth/signup" className="text-[#10B981] hover:text-[#0F9F6E] underline ml-1">
                こちらからサインアップ
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}