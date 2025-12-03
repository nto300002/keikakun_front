'use client';

import Link from 'next/link';

export default function TermsPage() {
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
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">利用規約</h1>
            <p className="text-gray-400">Terms of Service</p>
          </div>

          {/* コンテンツ */}
          <div className="bg-[#1A1A1A] rounded-xl p-8 sm:p-12 shadow-2xl">
            <TermsContent />
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

function TermsContent() {
  return (
    <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
      <p>
        この利用規約(以下、「本規約」といいます。)は、<strong>安田尚人</strong>(以下、「運営者」といいます。)がこのウェブサイト・アプリケーション上で提供する<strong>ケイカくん</strong>(以下、「本サービス」といいます。)の利用条件を定めるものです。ユーザーの皆さま(以下、「ユーザー」といいます。)には、本規約に従って、本サービスをご利用いただきます。
      </p>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第1条(適用)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>本規約は、ユーザーと運営者との間の本サービスの利用に関わる一切の関係に適用されるものとします。</li>
        <li>運営者は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め(以下、「個別規定」といいます。)をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。</li>
        <li>本規約の規定が前項の個別規定の規定と矛盾する場合には、個別規定において特段の定めなき限り、個別規定の規定が優先されるものとします。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第2条(利用登録)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>本サービスにおいては、登録希望者が本規約に同意の上、運営者の定める方法によって利用登録を申請し、運営者がこれを承認することによって、利用登録が完了するものとします。</li>
        <li>運営者は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
            <li>本規約に違反したことがある者からの申請である場合</li>
            <li>その他、運営者が利用登録を相当でないと判断した場合</li>
          </ul>
        </li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第3条(ユーザーIDおよびパスワードの管理)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。</li>
        <li>ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。運営者は、ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には、そのユーザーIDを登録しているユーザー自身による利用とみなします。</li>
        <li>ユーザーID及びパスワードが第三者によって使用されたことによって生じた損害は、運営者に故意又は重大な過失がある場合を除き、運営者は一切の責任を負わないものとします。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第4条(サービスの無償提供)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>本サービスは現在無償で提供されています。</li>
        <li>運営者は、将来的にサービスの一部または全部を有償化する場合があります。その場合は、事前にユーザーに通知し、同意を得るものとします。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第5条(禁止事項)</h3>
      <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
      <ol className="list-decimal pl-6 space-y-2">
        <li>法令または公序良俗に違反する行為</li>
        <li>犯罪行為に関連する行為</li>
        <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
        <li>運営者、他のユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
        <li>本サービスによって得られた情報を商業的に利用する行為</li>
        <li>運営者のサービスの運営を妨害するおそれのある行為</li>
        <li>不正アクセスをし、またはこれを試みる行為</li>
        <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
        <li>不正な目的を持って本サービスを利用する行為</li>
        <li>本サービスの他のユーザーまたはその他の第三者に不利益、損害、不快感を与える行為</li>
        <li>他のユーザーに成りすます行為</li>
        <li>運営者が許諾しない本サービス上での宣伝、広告、勧誘、または営業行為</li>
        <li>反社会的勢力に対して直接または間接に利益を供与する行為</li>
        <li>その他、運営者が不適切と判断する行為</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第6条(本サービスの提供の停止等)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
            <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
            <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
          </ul>
        </li>
        <li>運営者は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第7条(利用制限および登録抹消)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>運営者は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>本規約のいずれかの条項に違反した場合</li>
            <li>登録事項に虚偽の事実があることが判明した場合</li>
            <li>運営者からの連絡に対し、一定期間返答がない場合</li>
            <li>本サービスについて、最終の利用から一定期間(1年以上)利用がない場合</li>
            <li>その他、運営者が本サービスの利用を適当でないと判断した場合</li>
          </ul>
        </li>
        <li>運営者は、本条に基づき運営者が行った行為によりユーザーに生じた損害について、一切の責任を負いません。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第8条(退会)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>ユーザーは、運営者の定める退会手続により、本サービスから退会できるものとします。</li>
        <li>事務所オーナーは、事務所の退会申請を行うことができます。退会申請後、運営者による承認が必要となります。</li>
        <li>退会承認後、事務所データおよび所属するすべてのスタッフアカウントは論理削除され、30日間の猶予期間を経て完全に削除されます。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第9条(データの保持期間)</h3>
      <p>当サービスでは、以下のデータを所定の期間保持します：</p>
      <ul className="list-disc pl-6 space-y-2 mt-2">
        <li><strong>アカウント操作履歴</strong>（削除、退会、利用規約同意等）: 5年間</li>
        <li><strong>権限変更・事務所情報変更履歴</strong>: 3年間</li>
        <li><strong>ログイン履歴</strong>: 1年間</li>
      </ul>
      <p className="mt-4">
        保持期間経過後、データは自動的に削除されます。法令に基づく開示請求があった場合、保持期間内のデータを提供することがあります。
      </p>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第10条(保証の否認および免責事項)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>運営者は、本サービスに事実上または法律上の瑕疵(安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。)がないことを明示的にも黙示的にも保証しておりません。</li>
        <li>運営者は、本サービスに起因してユーザーに生じたあらゆる損害について、運営者の故意又は重過失による場合を除き、一切の責任を負いません。ただし、本サービスに関する運営者とユーザーとの間の契約(本規約を含みます。)が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。</li>
        <li>前項ただし書に定める場合であっても、運営者は、運営者の過失(重過失を除きます。)による債務不履行または不法行為によりユーザーに生じた損害のうち特別な事情から生じた損害(運営者またはユーザーが損害発生につき予見し、または予見し得た場合を含みます。)について一切の責任を負いません。</li>
        <li>運営者は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。</li>
        <li><strong>本サービスは個人により開発・運営されているため、サポート体制や対応時間に制限があることをご了承ください。</strong></li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第11条(サービス内容の変更・終了)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>運営者は、ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、ユーザーはこれを承諾するものとします。</li>
        <li><strong>運営者は、本サービスを予告なく終了することがあります。個人運営のため、継続的なサービス提供を保証することはできません。</strong></li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第12条(利用規約の変更)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>運営者は以下の場合には、ユーザーの個別の同意を要せず、本規約を変更することができるものとします。
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>本規約の変更がユーザーの一般の利益に適合するとき</li>
            <li>本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき</li>
          </ul>
        </li>
        <li>運営者はユーザーに対し、前項による本規約の変更にあたり、事前に、本規約を変更する旨及び変更後の本規約の内容並びにその効力発生時期を本サービス上で通知します。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第13条(個人情報の取扱い)</h3>
      <p>運営者は、本サービスの利用によって取得する個人情報については、別途定める「プライバシーポリシー」に従い適切に取り扱うものとします。</p>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第14条(通知または連絡)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>ユーザーと運営者との間の通知または連絡は、運営者の定める方法によって行うものとします。</li>
        <li>運営者は、ユーザーから変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時にユーザーへ到達したものとみなします。</li>
        <li><strong>お問い合わせへの回答は、運営者の対応可能な時間内(主に平日夜間・休日)に行います。即時の対応は保証できませんのでご了承ください。</strong></li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第15条(権利義務の譲渡の禁止)</h3>
      <p>ユーザーは、運営者の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。</p>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第16条(準拠法・裁判管轄)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
        <li>本サービスに関して紛争が生じた場合には、<strong>大阪地方裁判所</strong>を第一審の専属的合意管轄裁判所とします。</li>
      </ol>

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第17条(運営者情報)</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>運営者氏名</strong>: 安田尚人</li>
        <li><strong>サービス名</strong>: ケイカくん</li>
        <li><strong>連絡先</strong>: samonkntd@gmail.com</li>
        <li><strong>お問い合わせ</strong>: 本サービス内のお問い合わせフォームをご利用ください</li>
      </ul>

      <div className="mt-8 pt-6 border-t border-gray-600">
        <p className="text-sm text-gray-400"><strong>制定日</strong>: 2025年11月17日</p>
        <p className="text-sm text-gray-400"><strong>最終更新日</strong>: 2025年11月27日</p>
      </div>
    </div>
  );
}
