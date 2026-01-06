'use client';

import Link from 'next/link';

export default function ActOnSpecifiedCommercialTransactionsPage() {
  return (
    <div className="min-h-screen bg-[#0C1421] text-white">
      {/* ヘッダーナビゲーション */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0C1421]/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
            ケイカくん
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              ログイン
            </Link>
            <Link
              href="/auth/admin/signup"
              className="bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              新規登録
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* タイトル */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">特定商取引法に基づく表記</h1>
            <p className="text-gray-400">Act on Specified Commercial Transactions</p>
          </div>

          {/* コンテンツ */}
          <div className="bg-[#1A1A1A] rounded-xl p-8 sm:p-12 shadow-2xl">
            <div className="space-y-8 text-gray-300">
              {/* 販売業者 */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">販売業者</h2>
                <p>安田尚人</p>
              </section>

              {/* 運営責任者 */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">運営責任者</h2>
                <p>安田尚人</p>
              </section>

              {/* 所在地 */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">所在地</h2>
                <p>〒388-8007</p>
                <p>長野県長野市篠ノ井布施高田995-14</p>
              </section>

              {/* 連絡先 */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">連絡先</h2>
                <p>メールアドレス: samonkntd@gmail.com</p>
                <p className="text-sm text-gray-400 mt-2">
                  ※お客様からのお問い合わせにつきましては、メールにてご連絡ください
                </p>
              </section>

              {/* 販売価格 */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">販売価格</h2>
                <p>月額プラン: 6,000円（税抜）/ 月</p>
                <p className="text-sm text-gray-400 mt-2">
                  ※消費税を含めた金額を購入時に表示いたします
                </p>
              </section>

              {/* 支払方法 */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">支払方法</h2>
                <p>クレジットカード決済（Stripe）</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>VISA</li>
                  <li>Mastercard</li>
                  <li>American Express</li>
                  <li>JCB</li>
                </ul>
              </section>

              {/* 支払時期 */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">支払時期</h2>
                <p>サブスクリプション登録時に決済されます。</p>
                <p className="text-sm text-gray-400 mt-2">
                  ※トライアル期間（6ヶ月）終了後、自動的に課金が開始されます
                </p>
              </section>

              {/* サービス提供時期 */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">サービス提供時期</h2>
                <p>アカウント登録後、即時ご利用いただけます。</p>
              </section>

              {/* 返品・キャンセルについて */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">返品・キャンセルについて</h2>
                <p>サービスの性質上、返品には応じかねます。</p>
                <p className="mt-2">
                  サブスクリプションのキャンセルはいつでも可能です。キャンセル後、当月末までサービスをご利用いただけます。
                </p>
              </section>

              {/* 動作環境 */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">動作環境</h2>
                <p>以下の環境でのご利用を推奨しております：</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>最新版のGoogle Chrome、Firefox、Safari、Microsoft Edge</li>
                  <li>インターネット接続環境</li>
                </ul>
              </section>

              {/* 免責事項 */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">免責事項</h2>
                <p>
                  当サービスは、利用者の責任においてご利用ください。サービスの利用により発生したいかなる損害についても、
                  当社は責任を負いかねます。
                </p>
              </section>

              {/* 更新日 */}
              <section className="pt-8 border-t border-gray-700">
                <p className="text-sm text-gray-400">最終更新日: 2026年1月</p>
              </section>
            </div>
          </div>

          {/* 戻るリンク */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block text-gray-400 hover:text-white transition-colors"
            >
              ← トップページに戻る
            </Link>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[#0C1421] border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
              利用規約
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
              プライバシーポリシー
            </Link>
            <Link href="/act-on-specified-commercial-transactions" className="text-gray-400 hover:text-white transition-colors text-sm">
              特定商取引法
            </Link>
          </div>
          <p className="text-sm text-gray-400">&copy; 2025 ケイカくん. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
