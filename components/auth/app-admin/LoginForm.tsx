'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, tokenUtils } from '@/lib/auth';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { MdAdminPanelSettings } from 'react-icons/md';

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
  passphrase: z.string().min(1, '合言葉を入力してください'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AppAdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await authApi.login({
        username: data.email,
        password: data.password,
        passphrase: data.passphrase,
      });

      // MFA認証が必要な場合の処理
      if (response.requires_mfa_verification && response.temporary_token) {
        tokenUtils.setTemporaryToken(response.temporary_token);
        router.push('/auth/mfa-verify');
        return;
      }

      // ログイン成功 - ユーザー情報を確認
      try {
        const user = await authApi.getCurrentUser();

        // app_admin権限チェック
        if (user.role !== 'app_admin') {
          setFormError('root', {
            message: 'アプリ管理者としてのアクセス権限がありません。'
          });
          // 一般ユーザーの場合はログアウト
          await authApi.logout();
          return;
        }

        router.push('/app-admin');
      } catch (verifyError) {
        console.error('User verification failed:', verifyError);
        setFormError('root', { message: '認証に失敗しました。もう一度お試しください。' });
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setFormError('root', { message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MdAdminPanelSettings className="h-16 w-16 text-purple-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            アプリ管理者ログイン
          </h2>
          <p className="text-gray-400">
            ケイカくん管理コンソールにアクセス
          </p>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg border border-purple-500/30 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                {errors.root.message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                メールアドレス <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="admin@keikakun.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
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
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="passphrase" className="block text-sm font-medium text-gray-300 mb-2">
                合言葉 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="passphrase"
                  type={showPassphrase ? "text" : "password"}
                  {...register('passphrase')}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                  placeholder="合言葉を入力してください"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                >
                  {showPassphrase ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
                </button>
              </div>
              {errors.passphrase && (
                <p className="text-red-400 text-sm mt-1">{errors.passphrase.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/auth/login" className="text-gray-400 hover:text-gray-300 text-sm">
              一般ユーザーログインはこちら
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
