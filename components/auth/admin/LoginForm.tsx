'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, tokenUtils } from '@/lib/auth';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      });

      // Cookie認証: access_tokenはサーバー側でCookieに設定される
      // MFA認証が必要な場合の処理
      if (response.requires_mfa_verification && response.temporary_token) {
        tokenUtils.setTemporaryToken(response.temporary_token);
        router.push('/auth/mfa-verify');
        return;
      }

      // ログイン成功 - Cookieが有効であることを確認してから遷移
      try {
        await authApi.getCurrentUser();
        router.push('/auth/admin/office_setup');
      } catch (verifyError) {
        console.error('Cookie verification failed:', verifyError);
        setFormError('root', { message: '認証に失敗しました。もう一度お試しください。' });
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      setFormError('root', { message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0C1421] font-semibold flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ... header ... */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">
            管理者ログイン
          </h2>
          <p className="text-slate-600 dark:text-gray-400">
            ケイカくんにログインして、個別支援計画を管理しましょう
          </p>
        </div>

        <div className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-slate-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-base">
                {errors.root.message}
              </div>
            )}

            {/* ... email input ... */}
            <div>
              <label htmlFor="email" className="block text-base font-semibold text-slate-700 dark:text-gray-300 mb-2">
                メールアドレス <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-slate-300 dark:border-gray-600 rounded-lg text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="text-red-400 text-base mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-semibold text-slate-700 dark:text-gray-300 mb-2">
                パスワード <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
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
              {errors.password && (
                <p className="text-red-400 text-base mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* ... forgot password ... */}
            <div className="text-right">
              <a href="#" className="text-base font-semibold text-[#10B981] hover:text-[#0F9F6E] underline">
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
            <p className="text-slate-600 dark:text-gray-400 text-base">
              まだアカウントをお持ちでない方は
              <a href="/auth/admin/signup" className="font-semibold text-[#10B981] hover:text-[#0F9F6E] underline ml-1">
                こちらからサインアップ
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}