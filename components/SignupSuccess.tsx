'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignupSuccessContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const loginUrl = role === 'owner' ? '/auth/admin/login' : '/auth/login';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 dark:bg-[#0C1421]">
      <div className="max-w-lg w-full text-center">
        {/* アイコン */}
        <div className="w-20 h-20 bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-[#10B981] text-4xl">✓</span>
        </div>

        {/* メインメッセージ */}
        <h1 className="text-3xl font-bold text-slate-950 mb-4 dark:text-white">
          アカウント作成完了！
        </h1>
        
        <p className="text-lg text-slate-700 mb-8 dark:text-gray-300">
          アカウントの作成が完了しました。
          <br />
          メール認証を行ってログインしてください。
        </p>

        {/* メール認証の説明 */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 text-left shadow-sm dark:bg-[#2A2A2A] dark:border-gray-700">
          <h2 className="text-xl font-semibold text-slate-950 mb-4 flex items-center dark:text-white">
            <span className="text-blue-400 mr-2">📧</span>
            次のステップ
          </h2>
          
          <ol className="space-y-3 text-slate-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="bg-[#10B981] text-white text-sm rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 font-semibold">1</span>
              <span>登録されたメールアドレスに確認メールをお送りしました</span>
            </li>
            <li className="flex items-start">
              <span className="bg-[#10B981] text-white text-sm rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 font-semibold">2</span>
              <span>メール内の「認証リンク」をクリックしてください</span>
            </li>
            <li className="flex items-start">
              <span className="bg-[#10B981] text-white text-sm rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 font-semibold">3</span>
              <span>認証完了後、ログインしてご利用開始できます</span>
            </li>
          </ol>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 dark:bg-yellow-500/10 dark:border-yellow-500/20">
          <div className="flex items-start">
            <span className="text-yellow-400 text-lg mr-2">⚠️</span>
            <div className="text-left">
              <h3 className="font-semibold text-yellow-700 mb-1 dark:text-yellow-400">メールが届かない場合</h3>
              <p className="text-yellow-800 text-sm dark:text-yellow-300">
                迷惑メールフォルダをご確認ください。それでも届かない場合は、サポートまでお問い合わせください。
              </p>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-4">
          <a
            href={loginUrl}
            className="block w-full bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ログインページへ
          </a>
          
          <button className="block w-full border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-950 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 hover:bg-slate-100 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/30">
            確認メールを再送信
          </button>
        </div>

        {/* サポート情報 */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-sm mb-2 dark:text-gray-400">
            ご不明な点がございましたら、お気軽にお問い合わせください
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="text-[#10B981] hover:text-[#0F9F6E] underline">
              サポートセンター
            </a>
            <a href="#" className="text-[#10B981] hover:text-[#0F9F6E] underline">
              よくある質問
            </a>
            <a href="mailto:support@keikakun.com" className="text-[#10B981] hover:text-[#0F9F6E] underline">
              メールサポート
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupSuccess() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <SignupSuccessContent />
      </Suspense>
    );
  }
