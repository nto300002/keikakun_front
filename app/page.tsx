'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0C1421] text-white">
      {/* ヒーローセクション */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <div className="w-full h-full bg-gradient-to-l from-blue-500/20 via-transparent to-transparent"></div>
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
            <div className="absolute top-3/4 right-1/3 w-64 h-64 bg-cyan-400/5 rounded-full blur-2xl"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* メインキャッチコピー */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            計画の「うっかり」を、
            <br />
            確実な「あんしん」に。
          </h1>
          
          {/* サブキャッチコピー */}
          <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            忙しい毎日でも、もう更新期限は忘れない。
            <br className="hidden sm:block" />
            個別支援計画の管理をDX化し、本来の業務に集中できる環境を。
          </p>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              href="/auth/signup" 
              className="bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
              無料で試してみる
            </Link>
            <button className="border-2 border-white/30 hover:border-white/60 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 hover:bg-white/5 w-full sm:w-auto">
              資料請求
            </button>
          </div>

          {/* モックアップ画像プレースホルダー */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-8 shadow-2xl border border-gray-600">
              <div className="bg-[#0C1421] rounded-lg p-6 min-h-[300px] flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-600 rounded-lg flex items-center justify-center">
                    📊
                  </div>
                  <p>ダッシュボードプレビュー</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 課題提示セクション */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1A1A1A]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            個別支援計画の管理、こんなことで困っていませんか？
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#2A2A2A] p-8 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-2xl">
                ⚠️
              </div>
              <h3 className="text-xl font-semibold mb-4">更新期限の見落とし</h3>
              <p className="text-gray-400 leading-relaxed">
                日々の業務に追われ、気づけばモニタリング期限が過ぎていた…
              </p>
            </div>

            <div className="bg-[#2A2A2A] p-8 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-2xl">
                📄
              </div>
              <h3 className="text-xl font-semibold mb-4">書類作成・管理の煩雑さ</h3>
              <p className="text-gray-400 leading-relaxed">
                Excelや手書きの書類が散在。担当者しか進捗がわからない。
              </p>
            </div>

            <div className="bg-[#2A2A2A] p-8 rounded-xl text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-2xl">
                👥
              </div>
              <h3 className="text-xl font-semibold mb-4">チーム内の情報共有不足</h3>
              <p className="text-gray-400 leading-relaxed">
                承認フローが曖昧で、誰が責任者なのかはっきりしない。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 解決策（機能紹介）セクション */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            ケイカくんが、その課題を解決します
          </h2>

          {/* 機能1: 見える化ダッシュボード */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-2xl font-semibold mb-6">見える化ダッシュボード</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                利用者ごとの計画進捗と更新期限を一覧で可視化。対応すべきタスクが一目瞭然に。
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <span className="text-[#10B981] mr-3">✓</span>
                  残り日数のカラー表示
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#10B981] mr-3">✓</span>
                  優先度の自動判定
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#10B981] mr-3">✓</span>
                  進捗状況の一覧管理
                </li>
              </ul>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-6">
              <div className="bg-[#0C1421] rounded-lg p-4 h-64 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-[#10B981]/20 rounded-lg flex items-center justify-center text-[#10B981]">
                    📊
                  </div>
                  <p>ダッシュボード画面</p>
                </div>
              </div>
            </div>
          </div>

          {/* 機能2: 自動通知 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1 bg-[#1A1A1A] rounded-xl p-6">
              <div className="bg-[#0C1421] rounded-lg p-4 h-64 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                    🔔
                  </div>
                  <p>通知・カレンダー連携</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl font-semibold mb-6">自動通知 & Googleカレンダー連携</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                更新期限が近づくと、アプリとカレンダーが自動でお知らせ。チーム全体で見落としを防ぎます。
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <span className="text-[#10B981] mr-3">✓</span>
                  期限前の自動通知
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#10B981] mr-3">✓</span>
                  Googleカレンダー同期
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#10B981] mr-3">✓</span>
                  チーム全体への共有
                </li>
              </ul>
            </div>
          </div>

          {/* 機能3: 承認フロー */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-6">明確な承認フロー</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                役割に応じた権限設定とシステム化された承認フローで、責任の所在を明確にし、安全な運用を実現します。
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <span className="text-[#10B981] mr-3">✓</span>
                  役割別権限管理
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#10B981] mr-3">✓</span>
                  段階的な承認プロセス
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-[#10B981] mr-3">✓</span>
                  履歴の完全記録
                </li>
              </ul>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-6">
              <div className="bg-[#0C1421] rounded-lg p-4 h-64 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                    ✓
                  </div>
                  <p>承認フロー画面</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 料金プランセクション */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1A1A1A]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-16">
            シンプルで分かりやすい料金プラン
          </h2>

          <div className="bg-[#2A2A2A] rounded-2xl p-8 lg:p-12 max-w-md mx-auto border border-gray-600">
            <h3 className="text-2xl font-semibold mb-6">月額プラン</h3>
            <div className="mb-8">
              <span className="text-4xl lg:text-5xl font-bold">¥5,000</span>
              <span className="text-gray-400 ml-2">/ 月</span>
            </div>
            
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center">
                <span className="text-[#10B981] mr-3">✓</span>
                <span>利用者登録: 最大10名まで（無料）</span>
              </li>
              <li className="flex items-center">
                <span className="text-[#10B981] mr-3">✓</span>
                <span>11名以上は課金</span>
              </li>
              <li className="flex items-center">
                <span className="text-[#10B981] mr-3">✓</span>
                <span>全ての基本機能</span>
              </li>
              <li className="flex items-center">
                <span className="text-[#10B981] mr-3">✓</span>
                <span>Googleカレンダー連携</span>
              </li>
              <li className="flex items-center">
                <span className="text-[#10B981] mr-3">✓</span>
                <span>メールサポート</span>
              </li>
            </ul>

            <Link 
              href="/auth/admin/signup" 
              className="block bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              まずは無料で始める
            </Link>
          </div>
        </div>
      </section>

      {/* FAQセクション */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            よくあるご質問
          </h2>

          <div className="space-y-6">
            <details className="bg-[#2A2A2A] rounded-lg p-6 cursor-pointer">
              <summary className="text-xl font-semibold mb-4 list-none">
                Q. 導入は難しいですか？
              </summary>
              <p className="text-gray-300 leading-relaxed pl-4">
                A. いいえ、とても簡単です。管理者がサインアップした後、事務所を登録するだけで、従業員も簡単に登録できます。
              </p>
            </details>

            <details className="bg-[#2A2A2A] rounded-lg p-6 cursor-pointer">
              <summary className="text-xl font-semibold mb-4 list-none">
                Q. サポート体制はどうなっていますか？
              </summary>
              <p className="text-gray-300 leading-relaxed pl-4">
                A. メールサポートを提供しており、営業時間内（平日9:00-17:00）にお問い合わせいただければ、1~3日以内にご回答いたします。また、よくある質問やマニュアルもオンラインで公開しております。
              </p>
            </details>

            <details className="bg-[#2A2A2A] rounded-lg p-6 cursor-pointer">
              <summary className="text-xl font-semibold mb-4 list-none">
                Q. セキュリティは安全ですか？
              </summary>
              <p className="text-gray-300 leading-relaxed pl-4">
                A. はい、個人情報保護に最新の注意を払っています。データは暗号化して保存し、アクセス権限も厳格に管理しています。また、定期的なセキュリティ監査を実施し、常に安全性の向上に努めています。
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[#0C1421] border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">ケイカくん</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                個別支援計画の管理をシンプルに。
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">サービス</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">機能紹介</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">料金プラン</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">導入事例</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">ヘルプセンター</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">お問い合わせ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">よくある質問</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">法的情報</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">利用規約</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">運営会社</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 ケイカくん. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}