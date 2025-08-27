'use client';

export default function SignupSuccess() {
  return (
    <div className="min-h-screen bg-[#0C1421] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        {/* アイコン */}
        <div className="w-20 h-20 bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-[#10B981] text-4xl">✓</span>
        </div>

        {/* メインメッセージ */}
        <h1 className="text-3xl font-bold text-white mb-4">
          アカウント作成完了！
        </h1>
        
        <p className="text-lg text-gray-300 mb-8">
          管理者アカウントの作成が完了しました。
          <br />
          メール認証を行ってログインしてください。
        </p>

        {/* メール認証の説明 */}
        <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="text-blue-400 mr-2">📧</span>
            次のステップ
          </h2>
          
          <ol className="space-y-3 text-gray-300">
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
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <span className="text-yellow-400 text-lg mr-2">⚠️</span>
            <div className="text-left">
              <h3 className="font-semibold text-yellow-400 mb-1">メールが届かない場合</h3>
              <p className="text-yellow-300 text-sm">
                迷惑メールフォルダをご確認ください。それでも届かない場合は、サポートまでお問い合わせください。
              </p>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-4">
          <a
            href="/auth/admin/login"
            className="block w-full bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ログインページへ
          </a>
          
          <button className="block w-full border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 hover:bg-gray-800/30">
            確認メールを再送信
          </button>
        </div>

        {/* サポート情報 */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-2">
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