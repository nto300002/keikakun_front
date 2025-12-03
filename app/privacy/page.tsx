'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0C1421] text-white">
      {/* ヘッダーナビゲーション */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0C1421]/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
            ケイカくん
          </Link>
          <div className="flex items-center gap-4">
            <button
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
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">プライバシーポリシー</h1>
            <p className="text-gray-400">Privacy Policy</p>
          </div>

          {/* コンテンツ */}
          <div className="bg-[#1A1A1A] rounded-xl p-8 sm:p-12 shadow-2xl">
            <PrivacyContent />
          </div>

          {/* 戻るリンク */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-[#10B981] hover:text-[#0F9F6E] transition-colors inline-flex items-center gap-2"
            >
              <span>←</span>
              <span>トップページに戻る</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
      <p>
        <strong>安田尚人</strong>(以下、「運営者」といいます。)は、本ウェブサイト・アプリケーション上で提供する<strong>ケイカくん</strong>(以下、「本サービス」といいます。)における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー(以下、「本ポリシー」といいます。)を定めます。
      </p>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第1条(個人情報)</h3>
      <p>
        「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報(個人識別情報)を指します。
      </p>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第2条(個人情報の収集方法)</h3>
      <p>運営者は、ユーザーが利用登録をする際に以下の個人情報を収集することがあります。</p>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【スタッフユーザー(事業所職員)から収集する情報】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>氏名(姓・名、カナ)</li>
        <li>メールアドレス</li>
        <li>所属事業所情報</li>
        <li>パスワード(暗号化して保存)</li>
        <li>2段階認証に関する情報(有効化している場合)</li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【福祉サービス利用者に関する情報】</h4>
      <p>本サービスは福祉サービス事業所向けの個別支援計画管理システムであり、以下の情報を取り扱います：</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>利用者氏名(姓・名、カナ)</li>
        <li>生年月日</li>
        <li>性別</li>
        <li>住所</li>
        <li>電話番号</li>
        <li>緊急連絡先</li>
        <li>続柄</li>
        <li>受給者証番号</li>
        <li>障害者手帳番号</li>
        <li>障害支援区分</li>
        <li>個別支援計画の内容</li>
        <li>モニタリング記録</li>
        <li>その他福祉サービス提供に必要な情報</li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【自動的に収集される情報】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>IPアドレス</li>
        <li>Cookie情報</li>
        <li>アクセスログ</li>
        <li>利用状況に関する情報</li>
      </ul>

      <p className="mt-4">
        <strong>注意</strong>: 運営者は、銀行口座番号、クレジットカード番号、運転免許証番号などの決済情報は収集しません。本サービスは現在無償で提供されています。
      </p>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第3条(個人情報を収集・利用する目的)</h3>
      <p>運営者が個人情報を収集・利用する目的は、以下のとおりです。</p>
      <ol className="list-decimal pl-6 space-y-2">
        <li>本サービスの提供・運営のため</li>
        <li>個別支援計画の作成・管理・モニタリングのため</li>
        <li>ユーザー(スタッフ)からのお問い合わせに回答するため(本人確認を行うことを含む)</li>
        <li>サービスの新機能、更新情報、重要なお知らせなど必要に応じたご連絡のため</li>
        <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
        <li>ユーザーにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
        <li>サービスの改善、新機能の開発のため(統計データとして個人を特定できない形で利用)</li>
        <li>上記の利用目的に付随する目的</li>
      </ol>

      <p className="mt-4">
        <strong>福祉サービス利用者情報の利用目的</strong>：
        福祉サービス利用者の個人情報は、当該利用者に対する適切な福祉サービスの提供、個別支援計画の作成・実施・評価のためにのみ利用され、それ以外の目的では利用されません。
      </p>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第4条(利用目的の変更)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>運営者は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。</li>
        <li>利用目的の変更を行った場合には、変更後の目的について、本ウェブサイト上に公表し、ユーザーに通知するものとします。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第5条(個人情報の第三者提供)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>運営者は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
          <ol className="list-decimal pl-6 mt-2 space-y-1" style={{ listStyleType: 'lower-alpha' }}>
            <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
          </ol>
        </li>
        <li>前項の定めにかかわらず、次に掲げる場合には、当該情報の提供先は第三者に該当しないものとします。
          <ol className="list-decimal pl-6 mt-2 space-y-1" style={{ listStyleType: 'lower-alpha' }}>
            <li>運営者が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合(クラウドサービス提供事業者への委託を含む)</li>
            <li>合併その他の事由による事業の承継に伴って個人情報が提供される場合</li>
          </ol>
        </li>
      </ol>

      <p className="mt-4">
        <strong>現在の第三者提供の状況</strong>：
        本サービスは以下のサービスを利用しており、これらの事業者に情報が送信されます：
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Amazon Web Services (AWS) - メールサーバー, 画像(PDF保存)</li>
        <li>Google Cloud Run - ホスティング</li>
        <li>neonDB - データベース</li>
      </ul>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第6条(個人情報の開示)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>運営者は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。
          <ol className="list-decimal pl-6 mt-2 space-y-1" style={{ listStyleType: 'lower-alpha' }}>
            <li>本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
            <li>運営者の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
            <li>その他法令に違反することとなる場合</li>
          </ol>
        </li>
        <li>前項の定めにかかわらず、履歴情報および特性情報などの個人情報以外の情報については、原則として開示いたしません。</li>
        <li>個人情報の開示請求については、以下の窓口までご連絡ください。手数料は無料です。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第7条(個人情報の訂正および削除)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>ユーザーは、運営者の保有する自己の個人情報が誤った情報である場合には、運営者が定める手続きにより、運営者に対して個人情報の訂正、追加または削除(以下、「訂正等」といいます。)を請求することができます。</li>
        <li>運営者は、ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとします。</li>
        <li>運営者は、前項の規定に基づき訂正等を行った場合、または訂正等を行わない旨の決定をしたときは遅滞なく、これをユーザーに通知します。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第8条(個人情報の利用停止等)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>運営者は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去(以下、「利用停止等」といいます。)を求められた場合には、遅滞なく必要な調査を行います。</li>
        <li>前項の調査結果に基づき、その請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の利用停止等を行います。</li>
        <li>運営者は、前項の規定に基づき利用停止等を行った場合、または利用停止等を行わない旨の決定をしたときは、遅滞なく、これをユーザーに通知します。</li>
        <li>前2項にかかわらず、利用停止等に多額の費用を有する場合その他利用停止等を行うことが困難な場合であって、ユーザーの権利利益を保護するために必要なこれに代わるべき措置をとれる場合は、この代替策を講じるものとします。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第9条(データの保持期間)</h3>
      <p>運営者は、個人情報および関連ログデータについて、以下の期間保持します：</p>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【重要操作履歴（5年間）】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>アカウント削除記録</li>
        <li>事務所退会申請・承認・却下記録</li>
        <li>利用規約同意記録</li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【管理操作履歴（3年間）】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>権限変更履歴</li>
        <li>事務所情報変更履歴</li>
        <li>スタッフ管理操作履歴</li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【アクセスログ（1年間）】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>ログイン履歴（成功・失敗）</li>
        <li>IPアドレス、ユーザーエージェント情報</li>
      </ul>

      <p className="mt-4">
        保持期間経過後、データは自動的に削除されます。法令に基づく開示請求があった場合、保持期間内のデータを提供することがあります。
      </p>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第10条(安全管理措置)</h3>
      <p>運営者は、個人情報の漏えい、滅失または毀損の防止その他の個人情報の安全管理のため、以下の措置を講じています。</p>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【組織的安全管理措置】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>個人情報の取扱いに関する規程の整備</li>
        <li>個人情報の取扱状況の記録と定期的な確認</li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【人的安全管理措置】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>個人情報の適切な取扱いに関する教育の実施</li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【物理的安全管理措置】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>サーバーは信頼性の高いクラウドサービス(AWS,Google Cloud Run)を利用</li>
        <li>データセンターでの適切なアクセス制御</li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【技術的安全管理措置】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>SSL/TLS暗号化通信の使用</li>
        <li>パスワードの暗号化保存</li>
        <li>不正アクセス防止のためのファイアウォール設置</li>
        <li>定期的なセキュリティアップデート</li>
        <li>アクセスログの記録と監視</li>
      </ul>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第11条(Cookie等の利用)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>本サービスでは、ユーザーの利便性向上およびサービス改善のため、Cookieを使用しています。</li>
        <li>Cookieによって収集される情報には、以下が含まれます：
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>ログイン状態の維持</li>
            <li>セッション管理</li>
            <li>サービス利用状況の分析(Google Analytics使用)</li>
          </ul>
        </li>
        <li>ユーザーは、ブラウザの設定によりCookieの受け取りを拒否することができますが、その場合、本サービスの一部機能が利用できなくなる可能性があります。</li>
        <li>Google Analyticsについて：
          本サービスはGoogle Analyticsを使用してアクセス解析を行っています。Google Analyticsはデータの収集のためにCookieを使用します。このデータは匿名で収集されており、個人を特定するものではありません。
        </li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第12条(プライバシーポリシーの変更)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。</li>
        <li>変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。</li>
        <li>重要な変更がある場合は、サービス内での通知またはメールにて事前にお知らせします。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第13条(お問い合わせ窓口)</h3>
      <p>本ポリシーに関するお問い合わせ、個人情報の開示・訂正・削除・利用停止等のご請求は、下記の窓口までお願いいたします。</p>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">運営者情報：</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>運営者氏名</strong>: 安田尚人</li>
        <li><strong>サービス名</strong>: ケイカくん</li>
        <li><strong>メールアドレス</strong>: samonkntd@gmail.com</li>
        <li><strong>お問い合わせフォーム</strong>: 本サービス内のお問い合わせフォームをご利用ください</li>
      </ul>

      <p className="mt-4">
        <strong>対応時間</strong>：
        個人運営のため、お問い合わせへの対応は主に平日夜間・休日となります。通常1週間以内に返信いたしますが、内容によっては時間を要する場合があります。あらかじめご了承ください。
      </p>

      <div className="mt-8 pt-6 border-t border-gray-600">
        <p className="text-sm text-gray-400"><strong>制定日</strong>: 2025年11月17日</p>
        <p className="text-sm text-gray-400"><strong>最終更新日</strong>: 2025年11月27日</p>
      </div>
    </div>
  );
}
