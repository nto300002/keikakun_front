'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from '@/lib/toast-debug';
import { StaffResponse } from '@/types/staff';
import { profileApi } from '@/lib/profile';
import { StaffNameUpdate, PasswordChange, EmailChangeRequest } from '@/types/profile';
import { StaffRole } from '@/types/enums';
import RoleChangeModal from './RoleChangeModal';
import { inquiryApi } from '@/lib/api/inquiry';
import type { InquiryCategory } from '@/types/inquiry';
import { officeApi } from '@/lib/auth';
import { OfficeResponse } from '@/types/office';
import { getOfficeTypeLabel } from '@/lib/office-utils';

interface ProfileProps {
  staff: StaffResponse | null;
}

type TabType = 'staff_info' | 'feedback';

export default function Profile({ staff: initialStaff }: ProfileProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;

  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam === 'feedback' || tabParam === 'staff_info'
      ? tabParam
      : 'staff_info'
  );
  const [staff, setStaff] = useState<StaffResponse | null>(initialStaff);
  const [office, setOffice] = useState<OfficeResponse | null>(null);

  // URLのクエリパラメータが変更されたときにタブを切り替え
  useEffect(() => {
    if (tabParam === 'feedback' || tabParam === 'staff_info') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // 事業所情報を取得
  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const officeData = await officeApi.getMyOffice();
        setOffice(officeData);
      } catch (error) {
        console.error('事業所情報の取得に失敗しました:', error);
      }
    };
    fetchOffice();
  }, []);

  // 名前編集用のstate
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editedLastName, setEditedLastName] = useState<string>(staff?.last_name || '');
  const [editedFirstName, setEditedFirstName] = useState<string>(staff?.first_name || '');
  const [editedLastNameFurigana, setEditedLastNameFurigana] = useState<string>(staff?.last_name_furigana || '');
  const [editedFirstNameFurigana, setEditedFirstNameFurigana] = useState<string>(staff?.first_name_furigana || '');

  // パスワード変更モーダル用のstate
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('');

  // メールアドレス変更モーダル用のstate
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>('');
  const [emailChangePassword, setEmailChangePassword] = useState<string>('');
  const [emailModalError, setEmailModalError] = useState<string | null>(null);

  // Role変更リクエストモーダル用のstate
  const [isRoleChangeModalOpen, setIsRoleChangeModalOpen] = useState<boolean>(false);

  // 権限説明ポップオーバー用のstate
  const [isRoleHelpOpen, setIsRoleHelpOpen] = useState<boolean>(false);

  // フィードバック用のstate
  const [feedbackContent, setFeedbackContent] = useState<string>('');
  const [feedbackTitle, setFeedbackTitle] = useState<string>('');
  const [feedbackCategory, setFeedbackCategory] = useState<InquiryCategory>('その他');

  // UI状態
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 名前編集ハンドラ
  const handleNameEdit = () => {
    setIsEditingName(true);
    setEditedLastName(staff?.last_name || '');
    setEditedFirstName(staff?.first_name || '');
    setEditedLastNameFurigana(staff?.last_name_furigana || '');
    setEditedFirstNameFurigana(staff?.first_name_furigana || '');
  };

  const handleNameSave = async () => {
    setIsLoading(true);

    try {
      const nameData: StaffNameUpdate = {
        last_name: editedLastName,
        first_name: editedFirstName,
        last_name_furigana: editedLastNameFurigana,
        first_name_furigana: editedFirstNameFurigana,
      };

      const response = await profileApi.updateName(nameData);

      // スタッフ情報を更新
      setStaff({
        ...staff!,
        last_name: response.last_name,
        first_name: response.first_name,
        full_name: response.full_name,
        last_name_furigana: response.last_name_furigana,
        first_name_furigana: response.first_name_furigana,
        name: response.full_name, // 後方互換性
      });

      setIsEditingName(false);
      console.log('🎉 [Profile] 名前更新成功 - toastを表示します');
      toast.success('名前を更新しました');
      console.log('🎉 [Profile] toast.success呼び出し完了');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ [Profile] 名前更新失敗:', message);
      toast.error(message || '名前の更新に失敗しました');
      console.log('❌ [Profile] toast.error呼び出し完了');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditedLastName(staff?.last_name || '');
    setEditedFirstName(staff?.first_name || '');
    setEditedLastNameFurigana(staff?.last_name_furigana || '');
    setEditedFirstNameFurigana(staff?.first_name_furigana || '');
  };

  // パスワード変更ハンドラ
  const handlePasswordChange = async () => {
    setIsLoading(true);

    try {
      const passwordData: PasswordChange = {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      };

      const response = await profileApi.changePassword(passwordData);

      // モーダルを閉じる
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');

      console.log('🔐 [Profile] パスワード変更成功 - toastを表示します:', response.message);
      toast.success(response.message);
      console.log('🔐 [Profile] toast.success呼び出し完了');

      // パスワード変更後はログアウトされるため、ログインページにリダイレクト
      setTimeout(() => {
        window.location.href = '/auth/login?message=パスワードが変更されました。再度ログインしてください';
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ [Profile] パスワード変更失敗:', message);
      toast.error(message || 'パスワードの変更に失敗しました');
      console.log('❌ [Profile] toast.error呼び出し完了');
    } finally {
      setIsLoading(false);
    }
  };

  // メールアドレス変更リクエストハンドラ
  const handleEmailChangeRequest = async () => {
    // バリデーション
    setEmailModalError(null);

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail.trim()) {
      setEmailModalError('メールアドレスを入力してください');
      return;
    }
    if (!emailRegex.test(newEmail)) {
      setEmailModalError('有効なメールアドレスを入力してください');
      return;
    }

    // 現在のメールアドレスと同じでないかチェック
    if (newEmail.toLowerCase() === staff?.email?.toLowerCase()) {
      setEmailModalError('現在のメールアドレスと同じです。別のメールアドレスを入力してください');
      return;
    }

    // パスワードチェック
    if (!emailChangePassword.trim()) {
      setEmailModalError('パスワードを入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const emailData: EmailChangeRequest = {
        new_email: newEmail,
        password: emailChangePassword,
      };

      await profileApi.requestEmailChange(emailData);

      // モーダルを閉じる
      setIsEmailModalOpen(false);
      setNewEmail('');
      setEmailChangePassword('');
      setEmailModalError(null);

      const message = `確認メールを ${newEmail} に送信しました。メール内のリンクをクリックして変更を完了してください。`;
      console.log('📧 [Profile] メールアドレス変更リクエスト成功 - toastを表示します:', message);
      toast.success(message, { duration: 10000 });
      console.log('📧 [Profile] toast.success呼び出し完了');
    } catch (err: unknown) {
      // サーバーエラーをモーダル内に表示
      const message = err instanceof Error ? err.message : String(err);
      setEmailModalError(message || 'メールアドレス変更リクエストに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // フィードバック送信ハンドラ
  const handleFeedbackSubmit = async () => {
    // バリデーション
    if (!feedbackTitle.trim()) {
      console.log('⚠️ [Profile] フィードバック件名が空 - エラーtoastを表示します');
      toast.error('件名を入力してください');
      console.log('⚠️ [Profile] toast.error呼び出し完了');
      return;
    }

    if (!feedbackContent.trim()) {
      console.log('⚠️ [Profile] フィードバック内容が空 - エラーtoastを表示します');
      toast.error('フィードバック内容を入力してください');
      console.log('⚠️ [Profile] toast.error呼び出し完了');
      return;
    }

    setIsLoading(true);

    try {
      // 問い合わせAPIを使用して送信
      const response = await inquiryApi.createInquiry({
        title: feedbackTitle,
        content: feedbackContent,
        category: feedbackCategory,
      });

      console.log('📬 [Profile] フィードバック送信成功 - toastを表示します:', response.message);
      toast.success(response.message || 'フィードバックを送信しました。ご協力ありがとうございます。');
      console.log('📬 [Profile] toast.success呼び出し完了');

      // フォームをクリア
      setFeedbackTitle('');
      setFeedbackContent('');
      setFeedbackCategory('その他');
    } catch (error) {
      console.error('❌ [Profile] フィードバック送信失敗:', error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message || 'フィードバックの送信に失敗しました。しばらく時間をおいてからお試しください。');
      console.log('❌ [Profile] toast.error呼び出し完了');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* タブバー */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('staff_info')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'staff_info'
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            職員情報
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'feedback'
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            フィードバック
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-6">
        {/* 職員情報タブ */}
        {activeTab === 'staff_info' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">プロフィール</h2>

            {/* 基本情報カード */}
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">基本情報</h3>

              <div className="space-y-5">
                {/* 氏名 */}
                <div>
                  <label className="text-gray-400 text-sm block mb-2">氏名</label>
                  {isEditingName ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">姓</label>
                          <input
                            type="text"
                            value={editedLastName}
                            onChange={(e) => setEditedLastName(e.target.value)}
                            className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="山田"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">名</label>
                          <input
                            type="text"
                            value={editedFirstName}
                            onChange={(e) => setEditedFirstName(e.target.value)}
                            className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="太郎"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">姓（ふりがな）</label>
                          <input
                            type="text"
                            value={editedLastNameFurigana}
                            onChange={(e) => setEditedLastNameFurigana(e.target.value)}
                            className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="やまだ"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">名（ふりがな）</label>
                          <input
                            type="text"
                            value={editedFirstNameFurigana}
                            onChange={(e) => setEditedFirstNameFurigana(e.target.value)}
                            className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="たろう"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleNameSave}
                          disabled={isLoading}
                          className="bg-green-600/20 hover:bg-green-600/30 text-green-400 p-2 rounded-lg disabled:opacity-50 transition-colors"
                          title="保存"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleNameCancel}
                          disabled={isLoading}
                          className="bg-gray-700/50 hover:bg-gray-600/70 text-gray-300 p-2 rounded-lg disabled:opacity-50 transition-colors"
                          title="キャンセル"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {staff?.full_name}
                        </p>
                      </div>
                      <button
                        onClick={handleNameEdit}
                        className="bg-gray-700/50 hover:bg-gray-600/70 text-blue-400 p-2 rounded-lg transition-colors ml-4"
                        title="編集"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* メール */}
                <div>
                  <label className="text-gray-400 text-sm block mb-2">メールアドレス</label>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium">{staff?.email || '未設定'}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        変更には確認メールの認証が必要です
                      </p>
                      {staff?.is_mfa_enabled && (
                        <div className="mt-2 bg-blue-900/20 border border-blue-700/30 rounded-lg p-2">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-blue-300 text-xs leading-relaxed">
                              <span className="font-medium">2段階認証をご利用の方へ：</span>
                              <br />
                              メールアドレスを変更しても、Google認証システム（Authenticator）は引き続きご利用いただけます。アプリでの表示名は変更前のメールアドレスのままですが、認証コードは正常に動作します。
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setIsEmailModalOpen(true);
                        setEmailModalError(null);
                      }}
                      className="bg-gray-700/50 hover:bg-gray-600/70 text-blue-400 p-2 rounded-lg transition-colors ml-4"
                      title="編集"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* パスワード */}
                <div>
                  <label className="text-gray-400 text-sm block mb-2">パスワード</label>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium">••••••••</p>
                      <p className="text-gray-500 text-xs mt-1">
                        セキュリティ保護のため定期的に変更してください
                      </p>
                    </div>
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="bg-gray-700/50 hover:bg-gray-600/70 text-blue-400 p-2 rounded-lg transition-colors ml-4"
                      title="編集"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 権限 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-gray-400 text-sm">権限</label>
                    <div className="relative">
                      <button
                        onClick={() => setIsRoleHelpOpen(!isRoleHelpOpen)}
                        className="w-5 h-5 rounded-full bg-gray-700/50 hover:bg-gray-600/70 text-gray-300 flex items-center justify-center text-xs font-bold transition-colors"
                        title="権限の説明を表示"
                      >
                        ?
                      </button>
                      {isRoleHelpOpen && (
                        <>
                          {/* 背景オーバーレイ */}
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsRoleHelpOpen(false)}
                          />
                          {/* ポップオーバー */}
                          <div className="absolute left-0 top-full mt-2 w-80 bg-[#0f1419] border border-[#2a2a3e] rounded-lg shadow-xl z-50 p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-white font-semibold text-sm">権限について</h4>
                              <button
                                onClick={() => setIsRoleHelpOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="閉じる"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div>
                                <div className="font-medium text-blue-400 mb-1">管理者(事務所オーナー)</div>
                                <p className="text-gray-300 text-xs leading-relaxed">
                                  事務所の情報やスタッフを管理できる
                                </p>
                              </div>
                              <div>
                                <div className="font-medium text-blue-400 mb-1">マネージャー</div>
                                <p className="text-gray-300 text-xs leading-relaxed">
                                  個別支援計画のPDFアップロード、利用者の作成・編集・削除
                                </p>
                              </div>
                              <div>
                                <div className="font-medium text-blue-400 mb-1">一般社員</div>
                                <p className="text-gray-300 text-xs leading-relaxed">
                                  利用者の作成・編集・削除には許可が必要、PDFアップロード不可
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 rounded-2xl text-sm font-medium bg-[#4a9eff] text-white">
                        {staff?.role === 'owner' && '管理者'}
                        {staff?.role === 'manager' && 'マネージャー'}
                        {staff?.role === 'employee' && '従業員'}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsRoleChangeModalOpen(true)}
                      className="bg-gray-700/50 hover:bg-gray-600/70 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      権限変更をリクエスト
                    </button>
                  </div>
                </div>

                {/* 事業所 */}
                <div>
                  <label className="text-gray-400 text-sm block mb-1">事業所</label>
                  <p className="text-white font-medium">
                    {office ? `${office.name}${office.office_type ? `（${getOfficeTypeLabel(office.office_type)}）` : ''}` : staff?.office?.name || '未設定'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フィードバックタブ */}
        {activeTab === 'feedback' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">フィードバック</h2>

            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6">
              {/* 説明セクション */}
              <div className="mb-6 bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-blue-300 font-semibold mb-2">アプリ運営者へのフィードバック</h3>
                    <p className="text-blue-200 text-sm leading-relaxed">
                      このフォームは、アプリの運営者に直接フィードバックを送信するためのものです。<br />
                      ご意見・ご要望・不具合報告など、お気軽にお送りください。
                    </p>
                  </div>
                </div>
              </div>

              {/* フォーム */}
              <div className="space-y-5">
                {/* カテゴリ選択 */}
                <div>
                  <label className="text-gray-400 text-sm block mb-2">カテゴリ</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value as InquiryCategory)}
                    className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="不具合">不具合報告</option>
                    <option value="質問">質問</option>
                    <option value="その他">その他（ご意見・ご要望）</option>
                  </select>
                </div>

                {/* 件名入力 */}
                <div>
                  <label className="text-gray-400 text-sm block mb-2">
                    件名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={feedbackTitle}
                    onChange={(e) => setFeedbackTitle(e.target.value)}
                    placeholder="例: ログイン画面で不具合があります"
                    maxLength={200}
                    className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white placeholder-[#666] focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    {feedbackTitle.length} / 200文字
                  </p>
                </div>

                {/* 内容入力 */}
                <div>
                  <label className="text-gray-400 text-sm block mb-2">
                    内容 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={8}
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    placeholder="フィードバック内容を入力してください...&#10;&#10;【不具合報告の場合】&#10;・発生した状況&#10;・エラーメッセージ&#10;・再現手順&#10;などを記載いただけると助かります。"
                    maxLength={20000}
                    className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    {feedbackContent.length} / 20,000文字
                  </p>
                </div>

                {/* 送信ボタン */}
                <div className="flex gap-3">
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={isLoading || !feedbackTitle.trim() || !feedbackContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '送信中...' : '運営者に送信'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* パスワード変更モーダル */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">パスワード変更</h3>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">現在のパスワード</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-2">新しいパスワード</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-gray-500 text-xs mt-1">
                  8文字以上で、英字大小文字・数字・記号（!@#$%^&*(),.?&quot;:{}|&lt;&gt;）を全て組み合わせてください
                </p>
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-2">新しいパスワード（確認）</label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePasswordChange}
                disabled={isLoading || !currentPassword || !newPassword || !newPasswordConfirm}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '変更中...' : '変更'}
              </button>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setNewPasswordConfirm('');
                }}
                disabled={isLoading}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role変更リクエストモーダル */}
      {staff && (
        <RoleChangeModal
          currentRole={staff.role as StaffRole}
          isOpen={isRoleChangeModalOpen}
          onClose={() => setIsRoleChangeModalOpen(false)}
          onSuccess={() => {
            toast.success('権限変更リクエストを送信しました。承認をお待ちください。', { duration: 5000 });
          }}
        />
      )}

      {/* メールアドレス変更モーダル */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">メールアドレス変更</h3>

            {/* モーダル内エラー表示 */}
            {emailModalError && (
              <div className="mb-4 bg-red-900/30 border border-red-700/50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-200 text-sm">{emailModalError}</p>
                  </div>
                  <button
                    onClick={() => setEmailModalError(null)}
                    className="text-red-400 hover:text-red-300 ml-2 flex-shrink-0"
                    aria-label="エラーを閉じる"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">現在のメールアドレス</label>
                <p className="text-white font-medium">{staff?.email || '未設定'}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-2">新しいメールアドレス</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="new-email@example.com"
                />
                <p className="text-gray-500 text-xs mt-1">
                  確認メールが送信されます
                </p>
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-2">現在のパスワード</label>
                <input
                  type="password"
                  value={emailChangePassword}
                  onChange={(e) => setEmailChangePassword(e.target.value)}
                  className="w-full bg-[#0f1419] border border-[#2a2a3e] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="本人確認のため入力してください"
                />
              </div>

              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3">
                <p className="text-yellow-200 text-xs">
                  ⚠️ 確認メールを受信できるメールアドレスを入力してください。メール内のリンクをクリックすると変更が完了します。
                </p>
              </div>

              {staff?.is_mfa_enabled && (
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-blue-300 text-xs leading-relaxed">
                      <p className="font-medium mb-1">2段階認証について</p>
                      <p>
                        メールアドレスを変更しても、Google認証システムは引き続きご利用いただけます。Google Authenticatorアプリでの表示名は変更前のメールアドレスのままですが、認証コードは正常に動作します。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEmailChangeRequest}
                disabled={isLoading || !newEmail || !emailChangePassword}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '送信中...' : '確認メールを送信'}
              </button>
              <button
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setNewEmail('');
                  setEmailChangePassword('');
                  setEmailModalError(null);
                }}
                disabled={isLoading}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
