'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, tokenUtils } from '@/lib/auth';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'; // アイコンをインポート
import { toast } from '@/lib/toast-debug';
import DeletedOfficeNotice from './DeletedOfficeNotice';
import { useSlowLoadingMessage } from '@/hooks/useSlowLoadingMessage';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOfficeDeleted, setIsOfficeDeleted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const messageShownRef = useRef(false); // メッセージ表示済みフラグ
  const showSlowLoadingMessage = useSlowLoadingMessage(isLoading);

  // 自動認証チェックを削除: middlewareとDALパターンに委譲
  // これによりログインページでの不要な401エラーを防ぐ

  // クエリパラメータからメッセージを読み取ってtoastを表示
  useEffect(() => {
    // 既にメッセージを表示済みの場合はスキップ（重複防止）
    if (messageShownRef.current) {
      return;
    }

    const message = searchParams.get('message');
    if (message) {
      toast.success(decodeURIComponent(message));
      messageShownRef.current = true; // 表示済みフラグを立てる

      // クエリパラメータをクリア
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
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
        password: formData.password
      });

      if (data.requires_mfa_first_setup && data.temporary_token) {
        // 管理者が設定したMFAの初回セットアップが必要な場合
        tokenUtils.setTemporaryToken(data.temporary_token);
        // QRコードURIとシークレットキーをセッションストレージに保存
        if (data.qr_code_uri) {
          sessionStorage.setItem('mfa_qr_code_uri', data.qr_code_uri);
        }
        if (data.secret_key) {
          sessionStorage.setItem('mfa_secret_key', data.secret_key);
        }
        if (data.message) {
          sessionStorage.setItem('mfa_setup_message', data.message);
        }
        router.push('/auth/mfa-first-setup');
      } else if (data.requires_mfa_verification && data.temporary_token) {
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

      // 退会済み事務所のエラーを検出
      if (errorMessage.includes('退会済み') || errorMessage.includes('削除済み')) {
        setIsOfficeDeleted(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 退会済み事務所の場合は専用の通知を表示
  if (isOfficeDeleted) {
    return <DeletedOfficeNotice />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ... header ... */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">
            ログイン
          </h2>
          <p className="text-slate-600 dark:text-gray-400">
            ケイカくんにログインして、個別支援計画を管理しましょう
          </p>
        </div>

        <div className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-slate-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* ... email input ... */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                メールアドレス <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-gray-600 rounded-lg text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-gray-600 rounded-lg text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent pr-10"
                  placeholder="パスワードを入力してください"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* ... forgot password ... */}
            <div className="text-right">
              <a href="/auth/forgot-password" className="text-sm text-[#10B981] hover:text-[#0F9F6E] underline">
                パスワードをお忘れですか？
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>

            {showSlowLoadingMessage && (
              <p className="text-sm font-semibold text-slate-600 dark:text-gray-400">
                読み込みに時間がかかっています。画面が変わらない場合は、通信状況を確認してページを更新してください。
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-gray-400 text-sm">
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
