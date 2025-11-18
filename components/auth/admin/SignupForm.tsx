'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import StepWizard from '@/components/ui/StepWizard';
import { authApi } from '@/lib/auth';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import TermsAgreement from '@/components/auth/TermsAgreement';

const signupSchema = z.object({
  last_name: z.string()
    .min(1, '姓を入力してください')
    .max(50, '姓は50文字以内で入力してください')
    .regex(/^[ぁ-ん ァ-ヶー一-龥々・　]+$/, '姓は日本語のみ使用可能です'),
  first_name: z.string()
    .min(1, '名を入力してください')
    .max(50, '名は50文字以内で入力してください')
    .regex(/^[ぁ-ん ァ-ヶー一-龥々・　]+$/, '名は日本語のみ使用可能です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '英字大小文字・数字・記号を組み合わせてください'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword']
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function AdminSignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const steps = [
    { id: 'signup', title: 'サインアップ', status: 'current' as const },
    { id: 'verify', title: 'メール認証', status: 'pending' as const },
    { id: 'login', title: 'ログイン', status: 'pending' as const },
    { id: 'office', title: '事務所登録', status: 'pending' as const }
  ];

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);

    try {
      await authApi.registerAdmin({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      });

      router.push('/auth/signup-success');
    } catch (error) {
      setFormError('root', {
        message: error instanceof Error ? error.message : 'サインアップに失敗しました'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1421] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* ... header ... */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            管理者アカウント作成
          </h1>
          <p className="text-gray-400">
            ケイカくんへようこそ。まずは管理者アカウントを作成してください。
          </p>
        </div>

        <StepWizard steps={steps} />

        <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                {errors.root.message}
              </div>
            )}

            {/* 名前フィールド (姓・名) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                  姓 <span className="text-red-400">*</span>
                </label>
                <input
                  id="last_name"
                  type="text"
                  {...register('last_name')}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder="山田"
                />
                {errors.last_name && <p className="text-red-400 text-sm mt-1">{errors.last_name.message}</p>}
              </div>
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                  名 <span className="text-red-400">*</span>
                </label>
                <input
                  id="first_name"
                  type="text"
                  {...register('first_name')}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder="太郎"
                />
                {errors.first_name && <p className="text-red-400 text-sm mt-1">{errors.first_name.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                メールアドレス <span className="text-red-400">*</span>
              </label>
              <input id="email" type="email" {...register('email')} className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent" placeholder="admin@example.com" />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
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
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
              <p className="text-xs text-gray-500 mt-1">
                8文字以上で、英字大小文字・数字・記号を組み合わせてください
              </p>
            </div>

            {/* ... confirm password ... */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード（確認） <span className="text-red-400">*</span>
              </label>
              <input id="confirmPassword" type="password" {...register('confirmPassword')} className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent" placeholder="パスワードを再入力してください" />
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* 利用規約・プライバシーポリシーへの同意 */}
            <TermsAgreement
              onTermsAgree={setTermsAgreed}
              onPrivacyAgree={setPrivacyAgreed}
              termsAgreed={termsAgreed}
              privacyAgreed={privacyAgreed}
            />

            <button
              type="submit"
              disabled={isLoading || !termsAgreed || !privacyAgreed}
              className="w-full bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? '作成中...' : 'アカウントを作成する'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              すでにアカウントをお持ちの方は
              <a href="/auth/admin/login" className="text-[#10B981] hover:text-[#0F9F6E] underline ml-1">
                こちらからログイン
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}