'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import StepWizard from '@/components/ui/StepWizard';
import { officeApi } from '@/lib/auth';

const officeSetupSchema = z.object({
  name: z.string()
    .min(5, '事業所名は5文字以上で入力してください')
    .max(100, '事業所名は100文字以内で入力してください'),
  type: z.enum(['transition_to_employment', 'type_A_office', 'type_B_office'], {
    message: '事業所種別を正しく選択してください',
  }),
});

type OfficeFormData = z.infer<typeof officeSetupSchema>;

export default function OfficeSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError
  } = useForm<OfficeFormData>({
    resolver: zodResolver(officeSetupSchema)
  });

  const steps = [
    { id: 'signup', title: 'アカウント作成', status: 'completed' as const },
    { id: 'office', title: '事業所登録', status: 'current' as const },
    { id: 'complete', title: 'セットアップ完了', status: 'pending' as const }
  ];

  const officeTypes = [
    { value: 'transition_to_employment', label: '就労移行支援' },
    { value: 'type_A_office', label: '就労継続支援A型' },
    { value: 'type_B_office', label: '就労継続支援B型' }
  ];

  const onSubmit = async (data: OfficeFormData) => {
    setIsLoading(true);

    try {
      await officeApi.setupOffice({
        name: data.name,
        office_type: data.type,
      });
      
      router.push('/auth/setup-success');
    } catch (error) {
      setFormError('root', { 
        message: error instanceof Error ? error.message : '事業所情報の登録に失敗しました' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 dark:bg-[#0C1421]">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-950 mb-2 dark:text-white">
            事業所情報の登録
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            ケイカくんをご利用いただくため、事業所の基本情報を登録してください
          </p>
        </div>

        {/* ステップウィザード */}
        <StepWizard steps={steps} />

        {/* フォーム */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm dark:bg-[#2A2A2A] dark:border-gray-700">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
                {errors.root.message}
              </div>
            )}

            {/* 基本情報 */}
            <div className="border-b border-slate-200 pb-6 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-slate-950 mb-4 dark:text-white">基本情報</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-gray-300">
                    事業所名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
                    placeholder="○○就労移行支援事業所"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-gray-300">
                    事業所種別 <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white"
                  >
                    <option value="">選択してください</option>
                    {officeTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-red-400 text-sm mt-1">{errors.type.message}</p>
                  )}
                </div>

              </div>
            </div>

 

            {/* ボタン */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-950 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-300 dark:hover:text-white"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? '登録中...' : '登録してセットアップ完了'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
