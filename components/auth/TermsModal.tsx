'use client';

import { useState, useRef, useEffect } from 'react';
import { AiOutlineClose, AiOutlineCheck } from 'react-icons/ai';
import { MdCancel } from 'react-icons/md';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  type: 'terms' | 'privacy';
}

export default function TermsModal({ isOpen, onClose, onAgree, type }: TermsModalProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canAgree, setCanAgree] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const title = type === 'terms' ? '利用規約' : 'プライバシーポリシー';

  // スクロール検知
  const handleScroll = () => {
    if (!contentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const scrollableHeight = scrollHeight - clientHeight;

    if (scrollableHeight === 0) {
      // コンテンツが画面に収まる場合
      setScrollProgress(100);
      setCanAgree(true);
      return;
    }

    const progress = (scrollTop / scrollableHeight) * 100;
    setScrollProgress(progress);

    // 95%以上スクロールしたら同意可能
    if (progress >= 95) {
      setCanAgree(true);
    }
  };

  // モーダルが開かれたときにスクロール状態をリセット
  useEffect(() => {
    if (!isOpen) return;

    // モーダルが開かれた時の初期化処理（UI状態のリセット）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScrollProgress(0);
     
    setCanAgree(false);

    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    // 初期表示時にコンテンツの高さをチェック
    setTimeout(() => {
      handleScroll();
    }, 100);
  }, [isOpen]);

  const handleAgree = () => {
    onAgree();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-[#2A2A2A] rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            📄 {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
            aria-label="閉じる"
          >
            <AiOutlineClose className="h-6 w-6" />
          </button>
        </div>

        {/* プログレスバー */}
        <div className="px-6 pt-4">
          <div className="bg-[#1A1A1A] rounded-full h-2 overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${scrollProgress}%`,
                backgroundColor: scrollProgress >= 95 ? '#10B981' : scrollProgress >= 50 ? '#FBBF24' : '#EF4444'
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {canAgree ? '✓ 最後までお読みいただきました' : `あと${Math.max(0, Math.round(100 - scrollProgress))}%`}
          </p>
        </div>

        {/* スクロール可能なコンテンツエリア */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4 text-gray-300 leading-relaxed"
          style={{ scrollBehavior: 'smooth' }}
        >
          {type === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* フッター */}
        <div className="p-3 sm:p-4 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left order-2 sm:order-1">
              📍 最後まで読んで同意してください
            </p>
            <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <MdCancel className="h-4 w-4" />
                <span>キャンセル</span>
              </button>
              <button
                onClick={handleAgree}
                disabled={!canAgree}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                  canAgree
                    ? 'bg-[#10B981] hover:bg-[#0F9F6E] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {canAgree ? (
                  <>
                    <AiOutlineCheck className="h-4 w-4" />
                    <span>同意する</span>
                  </>
                ) : (
                  <span className="text-xs sm:text-sm">🔒 最後までお読みください</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 利用規約のコンテンツ
function TermsContent() {
  return (
    <div className="prose prose-invert max-w-none">
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

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第4条(料金とお支払い)</h3>
      <ol className="list-decimal pl-6 space-y-2">
        <li><strong>無料トライアル期間</strong>: 新規登録後、30日間の無料トライアル期間が提供されます。トライアル期間中はすべての機能を無料でご利用いただけます。</li>
        <li><strong>有料プランへの移行</strong>: トライアル期間終了後、本サービスを継続してご利用いただくには、有料プランへの登録が必要です。
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>料金: 月額6,000円（税込）</li>
            <li>課金サイクル: 毎月自動更新</li>
            <li>支払い方法: クレジットカード決済（Stripe経由）</li>
          </ul>
        </li>
        <li><strong>決済処理</strong>: すべての決済処理はStripe社のセキュアな決済システムを通じて行われます。運営者はクレジットカード番号などの決済情報を直接保持しません。</li>
        <li><strong>請求とサブスクリプション</strong>:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>有料プランは月次サブスクリプションとして自動更新されます</li>
            <li>請求書はStripeから電子的に発行されます</li>
            <li>決済失敗時は、サービスが一時停止される場合があります</li>
          </ul>
        </li>
        <li><strong>キャンセルと返金</strong>:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>サブスクリプションはいつでもキャンセル可能です</li>
            <li>キャンセル後、次回請求日までサービスをご利用いただけます</li>
            <li>月の途中でキャンセルした場合、日割り返金は行われません</li>
            <li>無料トライアル期間中のキャンセルには料金は発生しません</li>
          </ul>
        </li>
        <li><strong>料金改定</strong>: 運営者は、30日前までの事前通知により料金を改定することがあります。改定後も継続利用する場合、新料金に同意したものとみなします。</li>
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

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【法定保存データ（5年間）】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>アカウント操作履歴（削除、退会、利用規約同意等）</li>
        <li>支払い履歴・請求情報</li>
        <li>サブスクリプション変更履歴</li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【管理データ（3年間）】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>権限変更・事務所情報変更履歴</li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【アクセスログ（1年間）】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>ログイン履歴</li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【システムログ（90日間）】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Webhook処理ログ（決済イベント等）</li>
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
        <p className="text-sm text-gray-400"><strong>最終更新日</strong>: 2025年12月12日</p>
        <p className="text-xs text-gray-500 mt-2">【更新内容】有料プラン・Stripe決済の導入、データ保持期間の追加</p>
      </div>
    </div>
  );
}

// プライバシーポリシーのコンテンツ
function PrivacyContent() {
  return (
    <div className="prose prose-invert max-w-none">
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

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【決済・請求に関する情報】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>クレジットカード情報（Stripe社が安全に管理、運営者は保持しません）</li>
        <li>請求先情報（事業所名、住所、電話番号）</li>
        <li>支払い履歴</li>
        <li>サブスクリプション情報</li>
        <li>Stripe顧客ID（決済システムとの連携用）</li>
      </ul>
      <p className="mt-2 text-sm text-gray-400">
        ※ クレジットカード番号などの機密決済情報は、PCI DSS準拠のStripe社が安全に保管します。運営者はこれらの情報に直接アクセスすることはありません。
      </p>

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

      <h3 className="text-xl font-bold text-white mt-6 mb-3">第3条(個人情報を収集・利用する目的)</h3>
      <p>運営者が個人情報を収集・利用する目的は、以下のとおりです。</p>
      <ol className="list-decimal pl-6 space-y-2">
        <li>本サービスの提供・運営のため</li>
        <li>個別支援計画の作成・管理・モニタリングのため</li>
        <li><strong>料金の請求・決済処理のため（Stripe社を通じた決済含む）</strong></li>
        <li><strong>請求書・領収書の発行のため</strong></li>
        <li><strong>サブスクリプション管理・更新のため</strong></li>
        <li>ユーザー(スタッフ)からのお問い合わせに回答するため(本人確認を行うことを含む)</li>
        <li>サービスの新機能、更新情報、重要なお知らせ（料金改定含む）など必要に応じたご連絡のため</li>
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

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【決済サービス】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Stripe, Inc.</strong> - 決済処理・クレジットカード情報管理
          <ul className="list-disc pl-6 mt-1 text-sm">
            <li>提供情報: クレジットカード情報、請求先情報、支払い履歴</li>
            <li>利用目的: 決済処理、不正検知</li>
            <li>プライバシーポリシー: <a href="https://stripe.com/jp/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://stripe.com/jp/privacy</a></li>
          </ul>
        </li>
      </ul>

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【インフラサービス】</h4>
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

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【法定保存データ（5年間）】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>アカウント削除記録</li>
        <li>事務所退会申請・承認・却下記録</li>
        <li>利用規約同意記録</li>
        <li><strong>支払い履歴・請求情報</strong></li>
        <li><strong>サブスクリプション変更履歴</strong></li>
      </ul>
      <p className="mt-2 text-sm text-gray-400">
        ※ 支払い関連データは税法上の要請により5年間保持します
      </p>

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

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【システムログ（90日間）】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Webhook処理ログ（決済イベント、サブスクリプション変更等）</li>
        <li>決済エラーログ</li>
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

      <h4 className="text-lg font-semibold text-white mt-4 mb-2">【決済情報の安全管理】</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>クレジットカード情報は<strong>PCI DSS準拠</strong>のStripe社が管理</li>
        <li>運営者はクレジットカード番号を保持せず、安全なトークン方式を採用</li>
        <li>すべての決済通信はStripe社の暗号化通信を使用</li>
        <li>不正検知システム（Stripe Radar）による24時間監視</li>
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
        <p className="text-sm text-gray-400"><strong>最終更新日</strong>: 2025年12月12日</p>
        <p className="text-xs text-gray-500 mt-2">【更新内容】Stripe決済導入に伴う個人情報取扱い、第三者提供、安全管理措置の追加</p>
      </div>
    </div>
  );
}
