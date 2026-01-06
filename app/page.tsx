'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LogoAnimation } from '@/components/LogoAnimation';
import InquiryModal from '@/components/inquiry/InquiryModal';

export default function LandingPage() {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0C1421] text-white">
      {/* お問い合わせモーダル */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
      />

      {/* ヘッダーナビゲーション */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0C1421]/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">ケイカくん</div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              お問い合わせ
            </button>
            <Link
              href="/auth/login"
              className="text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              ログイン
            </Link>
            <Link
              href="/auth/signup"
              className="bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              新規登録
            </Link>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <div className="w-full h-full bg-gradient-to-l from-blue-500/20 via-transparent to-transparent"></div>
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
            <div className="absolute top-3/4 right-1/3 w-64 h-64 bg-cyan-400/5 rounded-full blur-2xl"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左側: テキストコンテンツ */}
            <div>
              {/* メインキャッチコピー */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-8">
                計画の「うっかり」を、
                <br />
                確実な「あんしん」に。
              </h1>

              {/* サブキャッチコピー */}
              <p className="text-xl sm:text-2xl text-gray-300 mb-12 leading-relaxed">
                福祉サービス事業所の
                <br />
                個別支援計画をかんたんに。
              </p>

              {/* CTAボタン */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/auth/signup"
                  className="bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
                >
                  始める
                </Link>
                <Link
                  href="/auth/admin/signup"
                  className="bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
                >
                  オーナーの方はこちら
                </Link>
              </div>

              {/* スクロール誘導 */}
              <div className="text-center text-gray-400 mt-12">
                <p className="mb-2">∨ Scroll</p>
              </div>
            </div>

            {/* 右側: ロゴアニメーション */}
            <div className="flex items-center justify-center">
              <LogoAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* 課題提示セクション */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 bg-[#1A1A1A]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-20">
            こんなお悩みありませんか？
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-[#2A2A2A] p-10 rounded-xl text-center hover:bg-[#333333] transition-colors">
              <div className="w-20 h-20 mx-auto mb-8 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-3xl">
                ⚠️
              </div>
              <h3 className="text-2xl font-semibold mb-6">計画更新の漏れ</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                通知がこないから、気づいたら更新期限が過ぎていた…
              </p>
            </div>

            <div className="bg-[#2A2A2A] p-10 rounded-xl text-center hover:bg-[#333333] transition-colors">
              <div className="w-20 h-20 mx-auto mb-8 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-3xl">
                📁
              </div>
              <h3 className="text-2xl font-semibold mb-6">書類管理の煩雑さ</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                GoogleDriveでの管理、各々がフォルダを管理しているとどこに何があるかわからない
              </p>
            </div>

            <div className="bg-[#2A2A2A] p-10 rounded-xl text-center hover:bg-[#333333] transition-colors">
              <div className="w-20 h-20 mx-auto mb-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-3xl">
                📅
              </div>
              <h3 className="text-2xl font-semibold mb-6">更新期限がわかりにくい</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                残り期限をいちいち管理するのが面倒で、つい後回しに…
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 解決策（機能紹介）セクション */}
      <section id="features-detail" className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-24">
            ケイカくんが、その課題を解決します
          </h2>

          {/* 機能1: 見える化ダッシュボード */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            <div>
              <h3 className="text-3xl font-bold mb-8">見える化ダッシュボード</h3>
              <p className="text-gray-300 text-xl leading-relaxed mb-8">
                利用者ごとの計画進捗と更新期限を一覧で可視化。対応すべきタスクが一目瞭然に。
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-300 text-lg">
                  <span className="text-[#10B981] mr-4 text-xl">✓</span>
                  残り日数のカラー表示
                </li>
                <li className="flex items-center text-gray-300 text-lg">
                  <span className="text-[#10B981] mr-4 text-xl">✓</span>
                  優先度の自動判定
                </li>
                <li className="flex items-center text-gray-300 text-lg">
                  <span className="text-[#10B981] mr-4 text-xl">✓</span>
                  進捗状況の一覧管理
                </li>
              </ul>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl shadow-2xl">
                <Image
                  src="/dashboard.png"
                  alt="ダッシュボード画面のスクリーンショット"
                  width={1200}
                  height={700}
                  className="w-full h-auto rounded-lg"
                  priority
                />
            </div>
          </div>

          {/* 機能2: 自動通知 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            <div className="order-2 lg:order-1 rounded-xl overflow-hidden shadow-2xl">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/xAXWnT_kP2g"
                  title="自動通知 & Googleカレンダー連携"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-3xl font-bold mb-8">自動通知 & Googleカレンダー連携</h3>
              <p className="text-gray-300 text-xl leading-relaxed mb-8">
                更新期限が近づくと、アプリとカレンダーが自動でお知らせ。チーム全体で見落としを防ぎます。
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-300 text-lg">
                  <span className="text-[#10B981] mr-4 text-xl">✓</span>
                  期限前の自動通知
                </li>
                <li className="flex items-center text-gray-300 text-lg">
                  <span className="text-[#10B981] mr-4 text-xl">✓</span>
                  Googleカレンダー同期
                </li>
                <li className="flex items-center text-gray-300 text-lg">
                  <span className="text-[#10B981] mr-4 text-xl">✓</span>
                  チーム全体への共有
                </li>
              </ul>
            </div>
          </div>

          {/* 機能3: 承認フロー */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-8">わかりやすいPDF管理</h3>
              <p className="text-gray-300 text-xl leading-relaxed mb-8">
                PDF管理が簡単に、個別支援計画の進捗状況が一目でわかる。
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-300 text-lg">
                  <span className="text-[#10B981] mr-4 text-xl">✓</span>
                  PDFアップロード
                </li>
                <li className="flex items-center text-gray-300 text-lg">
                  <span className="text-[#10B981] mr-4 text-xl">✓</span>
                  PDFプレビュー
                </li>
                <li className="flex items-center text-gray-300 text-lg">
                  <span className="text-[#10B981] mr-4 text-xl">✓</span>
                  今どの段階?が一目でわかる
                </li>
              </ul>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl shadow-2xl">
              <Image
                  src="/support_plan.png"
                  alt="ダッシュボード画面のスクリーンショット"
                  width={1200}
                  height={700}
                  className="w-full h-auto rounded-lg"
                />
            </div>
          </div>
        </div>
      </section>

      {/* 料金プランセクション */}
      <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 bg-[#1A1A1A]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-20">
            シンプルで分かりやすい料金プラン
          </h2>

          <div className="bg-[#2A2A2A] rounded-2xl p-12 lg:p-16 max-w-lg mx-auto border-2 border-[#10B981]/20 hover:border-[#10B981]/40 transition-colors">
            <div className="mb-10">
              <div className="inline-block bg-[#10B981]/10 text-[#10B981] px-6 py-2 rounded-full text-lg font-semibold mb-6">
                半年間無料
              </div>
              <h3 className="text-3xl font-semibold mb-8">月額プラン</h3>
              <div className="mb-4">
                <span className="text-6xl font-bold">¥6,000</span>
                <span className="text-gray-400 text-xl ml-2">/ 月</span>
              </div>
              <p className="text-gray-400 text-lg">7ヶ月目から課金開始</p>
            </div>

            <ul className="space-y-5 mb-12 text-left">
              <li className="flex items-center text-lg">
                <span className="text-[#10B981] mr-4 text-xl">✓</span>
                <span>最初の6ヶ月は完全無料</span>
              </li>
              <li className="flex items-center text-lg">
                <span className="text-[#10B981] mr-4 text-xl">✓</span>
                <span>全ての基本機能が使い放題</span>
              </li>
              <li className="flex items-center text-lg">
                <span className="text-[#10B981] mr-4 text-xl">✓</span>
                <span>Googleカレンダー連携</span>
              </li>
              <li className="flex items-center text-lg">
                <span className="text-[#10B981] mr-4 text-xl">✓</span>
                <span>自動通知機能</span>
              </li>
              <li className="flex items-center text-lg">
                <span className="text-[#10B981] mr-4 text-xl">✓</span>
                <span>メールサポート</span>
              </li>
            </ul>

            <Link
              href="/auth/admin/signup"
              className="block bg-[#10B981] hover:bg-[#0F9F6E] text-white font-semibold py-5 px-10 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
            >
              まずは無料でお試しください
            </Link>
          </div>
        </div>
      </section>

      {/* FAQセクション */}
      <section id="faq" className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-20">
            よくあるご質問
          </h2>

          <div className="space-y-6">
            <details className="bg-[#2A2A2A] rounded-xl p-8 cursor-pointer hover:bg-[#333333] transition-colors">
              <summary className="text-2xl font-semibold mb-4 list-none cursor-pointer">
                Q. 導入は難しいですか？
              </summary>
              <p className="text-gray-300 text-lg leading-relaxed pl-4 pt-4 border-t border-gray-600">
                A. いいえ、とても簡単です。管理者がサインアップした後、事務所を登録するだけで、従業員も簡単に登録できます。
              </p>
            </details>

            <details className="bg-[#2A2A2A] rounded-xl p-8 cursor-pointer hover:bg-[#333333] transition-colors">
              <summary className="text-2xl font-semibold mb-4 list-none cursor-pointer">
                Q. サポート体制はどうなっていますか？
              </summary>
              <p className="text-gray-300 text-lg leading-relaxed pl-4 pt-4 border-t border-gray-600">
                A. メールサポートを提供しており、営業時間内（平日9:00-17:00）にお問い合わせいただければ、1~3日以内にご回答いたします。また、よくある質問やマニュアルもオンラインで公開しております。
              </p>
            </details>

            <details className="bg-[#2A2A2A] rounded-xl p-8 cursor-pointer hover:bg-[#333333] transition-colors">
              <summary className="text-2xl font-semibold mb-4 list-none cursor-pointer">
                Q. セキュリティは安全ですか？
              </summary>
              <p className="text-gray-300 text-lg leading-relaxed pl-4 pt-4 border-t border-gray-600">
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
                <li><a href="#features-detail" className="hover:text-white transition-colors">機能紹介</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">料金プラン</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button
                    onClick={() => setIsInquiryModalOpen(true)}
                    className="hover:text-white transition-colors"
                  >
                    お問い合わせ
                  </button>
                </li>
                <li><a href="#faq" className="hover:text-white transition-colors">よくある質問</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">法的情報</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">利用規約</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
                <li><Link href="/act-on-specified-commercial-transactions" className="hover:text-white transition-colors">特定商取引法に基づく表記</Link></li>
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