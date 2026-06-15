'use client';

import Link from 'next/link';
import StepWizard from '@/components/ui/StepWizard';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function SetupSuccessPage() {
  const steps = [
    { id: 'signup', title: 'サインアップ', status: 'completed' as const },
    { id: 'verify', title: 'メール認証', status: 'completed' as const },
    { id: 'login', title: 'ログイン', status: 'completed' as const },
    { id: 'office', title: '事務所登録', status: 'completed' as const }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0C1421] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">
            セットアップ完了
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            すべての準備が整いました。
          </p>
        </div>

        <StepWizard steps={steps} />

        <div className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-slate-200 dark:border-gray-700 p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white mb-4">
            ようこそ、ケイカくんへ！
          </h2>
          <p className="text-slate-700 dark:text-gray-300 mb-8">
            事業所の登録が完了し、すべての機能が利用可能になりました。
            ダッシュボードからサービスの利用を開始してください。
          </p>
          <Link href="/dashboard" className="w-full inline-block bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200">
            ダッシュボードへ進む
          </Link>
        </div>
      </div>
    </div>
  );
}
