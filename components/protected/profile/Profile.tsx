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
import NotificationSettings from './NotificationSettings';

interface ProfileProps {
  staff: StaffResponse | null;
}

type TabType = 'staff_info' | 'feedback' | 'notifications';

export default function Profile({ staff: initialStaff }: ProfileProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;

  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam === 'feedback' || tabParam === 'staff_info' || tabParam === 'notifications'
      ? tabParam
      : 'staff_info'
  );
  const [staff, setStaff] = useState<StaffResponse | null>(initialStaff);
  const [office, setOffice] = useState<OfficeResponse | null>(null);

  // URLのクエリパラメータが変更されたときにタブを切り替え
  useEffect(() => {
    if (tabParam === 'feedback' || tabParam === 'staff_info' || tabParam === 'notifications') {
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
      toast.success('名前を更新しました');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || '名前の更新に失敗しました');
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

      toast.success(response.message);

      // パスワード変更後はログアウトされるため、ログインページにリダイレクト
      setTimeout(() => {
        window.location.href = '/auth/login?message=パスワードが変更されました。再度ログインしてください';
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'パスワードの変更に失敗しました');
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
      toast.success(message, { duration: 10000 });
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
      toast.error('件名を入力してください');
      return;
    }

    if (!feedbackContent.trim()) {
      toast.error('フィードバック内容を入力してください');
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

      toast.success(response.message || 'フィードバックを送信しました。ご協力ありがとうございます。');

      // フォームをクリア
      setFeedbackTitle('');
      setFeedbackContent('');
      setFeedbackCategory('その他');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message || 'フィードバックの送信に失敗しました。しばらく時間をおいてからお試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-gray-900 dark:text-gray-200">
      {/* タブバー */}
      <div className="bg-white border-b border-slate-300 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('staff_info')}
            className={`px-7 py-4 text-base font-semibold ${
              activeTab === 'staff_info'
                ? 'bg-white text-slate-950 border-b-2 border-blue-500 dark:bg-gray-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            職員情報
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-7 py-4 text-base font-semibold ${
              activeTab === 'feedback'
                ? 'bg-white text-slate-950 border-b-2 border-blue-500 dark:bg-gray-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            フィードバック
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-7 py-4 text-base font-semibold ${
              activeTab === 'notifications'
                ? 'bg-white text-slate-950 border-b-2 border-blue-500 dark:bg-gray-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            通知設定
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-6 font-semibold">
        {/* 職員情報タブ */}
        {activeTab === 'staff_info' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-7">プロフィール</h2>

            {/* 基本情報カード */}
            <div className="bg-white border border-slate-300 shadow-sm dark:bg-[#1a1a2e] dark:border-[#2a2a3e] rounded-xl p-6 mb-7">
              <h3 className="text-2xl font-semibold mb-5">基本情報</h3>

              <div className="space-y-6">
                {/* 氏名 */}
                <div>
                  <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">氏名</label>
                  {isEditingName ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-600 dark:text-gray-400 text-base block mb-1">姓</label>
                          <input
                            type="text"
                            value={editedLastName}
                            onChange={(e) => setEditedLastName(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-5 py-4 text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white focus:outline-none focus:border-blue-500"
                            placeholder="山田"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 dark:text-gray-400 text-base block mb-1">名</label>
                          <input
                            type="text"
                            value={editedFirstName}
                            onChange={(e) => setEditedFirstName(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-5 py-4 text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white focus:outline-none focus:border-blue-500"
                            placeholder="太郎"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-600 dark:text-gray-400 text-base block mb-1">姓（ふりがな）</label>
                          <input
                            type="text"
                            value={editedLastNameFurigana}
                            onChange={(e) => setEditedLastNameFurigana(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-5 py-4 text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white focus:outline-none focus:border-blue-500"
                            placeholder="やまだ"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 dark:text-gray-400 text-base block mb-1">名（ふりがな）</label>
                          <input
                            type="text"
                            value={editedFirstNameFurigana}
                            onChange={(e) => setEditedFirstNameFurigana(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-5 py-4 text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white focus:outline-none focus:border-blue-500"
                            placeholder="たろう"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleNameSave}
                          disabled={isLoading}
                          className="bg-green-600/20 hover:bg-green-600/30 text-green-400 p-3 rounded-lg disabled:opacity-50 transition-colors"
                          title="保存"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleNameCancel}
                          disabled={isLoading}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-gray-700/50 dark:hover:bg-gray-600/70 dark:text-gray-300 p-3 rounded-lg disabled:opacity-50 transition-colors"
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
                        <p className="text-lg text-slate-900 dark:text-white font-semibold">
                          {staff?.full_name}
                        </p>
                      </div>
                      <button
                        onClick={handleNameEdit}
                        className="bg-slate-100 hover:bg-slate-200 text-blue-600 dark:bg-gray-700/50 dark:hover:bg-gray-600/70 dark:text-blue-400 p-3 rounded-lg transition-colors ml-4"
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
                  <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">メールアドレス</label>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-lg text-slate-900 dark:text-white font-semibold">{staff?.email || '未設定'}</p>
                      <p className="text-slate-500 dark:text-gray-500 text-base mt-1">
                        変更には確認メールの認証が必要です
                      </p>
                      {staff?.is_mfa_enabled && (
                        <div className="mt-2 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/30 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-blue-800 dark:text-blue-300 text-base leading-relaxed">
                              <span className="font-semibold">2段階認証をご利用の方へ：</span>
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
                      className="bg-slate-100 hover:bg-slate-200 text-blue-600 dark:bg-gray-700/50 dark:hover:bg-gray-600/70 dark:text-blue-400 p-3 rounded-lg transition-colors ml-4"
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
                  <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">パスワード</label>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-lg text-slate-900 dark:text-white font-semibold">••••••••</p>
                      <p className="text-slate-500 dark:text-gray-500 text-base mt-1">
                        セキュリティ保護のため定期的に変更してください
                      </p>
                    </div>
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="bg-slate-100 hover:bg-slate-200 text-blue-600 dark:bg-gray-700/50 dark:hover:bg-gray-600/70 dark:text-blue-400 p-3 rounded-lg transition-colors ml-4"
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
                    <label className="text-slate-600 dark:text-gray-400 text-base">権限</label>
                    <div className="relative">
                      <button
                        onClick={() => setIsRoleHelpOpen(!isRoleHelpOpen)}
                        className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-gray-700/50 dark:hover:bg-gray-600/70 dark:text-gray-300 flex items-center justify-center text-base font-bold transition-colors"
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
                          <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-slate-300 rounded-lg shadow-xl dark:bg-[#0f1419] dark:border-[#2a2a3e] z-50 p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-slate-950 dark:text-white font-semibold text-base">権限について</h4>
                              <button
                                onClick={() => setIsRoleHelpOpen(false)}
                                className="text-slate-600 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white transition-colors"
                                aria-label="閉じる"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="space-y-3 text-base">
                              <div>
                                <div className="font-semibold text-blue-400 mb-1">管理者(事務所オーナー)</div>
                                <p className="text-slate-700 dark:text-gray-300 text-base leading-relaxed">
                                  事務所の情報やスタッフを管理できる
                                </p>
                              </div>
                              <div>
                                <div className="font-semibold text-blue-400 mb-1">マネージャー</div>
                                <p className="text-slate-700 dark:text-gray-300 text-base leading-relaxed">
                                  個別支援計画のPDFアップロード、利用者の作成・編集・削除
                                </p>
                              </div>
                              <div>
                                <div className="font-semibold text-blue-400 mb-1">一般社員</div>
                                <p className="text-slate-700 dark:text-gray-300 text-base leading-relaxed">
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
                      <span className="inline-block px-3 py-1 rounded-2xl text-base font-semibold bg-[#4a9eff] text-white">
                        {staff?.role === 'owner' && '管理者'}
                        {staff?.role === 'manager' && 'マネージャー'}
                        {staff?.role === 'employee' && '従業員'}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsRoleChangeModalOpen(true)}
                      className="bg-slate-100 hover:bg-slate-200 text-blue-600 dark:bg-gray-700/50 dark:hover:bg-gray-600/70 dark:text-blue-400 px-5 py-3 rounded-lg text-base font-semibold transition-colors"
                    >
                      権限変更をリクエスト
                    </button>
                  </div>
                </div>

                {/* 事業所 */}
                <div>
                  <label className="text-slate-600 dark:text-gray-400 text-base block mb-1">事業所</label>
                  <p className="text-lg text-slate-900 dark:text-white font-semibold">
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
            <h2 className="text-3xl font-bold mb-7">フィードバック</h2>

            <div className="bg-white border border-slate-300 shadow-sm dark:bg-[#1a1a2e] dark:border-[#2a2a3e] rounded-xl p-6">
              {/* 説明セクション */}
              <div className="mb-7 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/30 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">アプリ運営者へのフィードバック</h3>
                    <p className="text-blue-700 dark:text-blue-200 text-base leading-relaxed">
                      このフォームは、アプリの運営者に直接フィードバックを送信するためのものです。<br />
                      ご意見・ご要望・不具合報告など、お気軽にお送りください。
                    </p>
                  </div>
                </div>
              </div>

              {/* フォーム */}
              <div className="space-y-6">
                {/* カテゴリ選択 */}
                <div>
                  <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">カテゴリ</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value as InquiryCategory)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-5 py-3 text-lg text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="不具合">不具合報告</option>
                    <option value="質問">質問</option>
                    <option value="その他">その他（ご意見・ご要望）</option>
                  </select>
                </div>

                {/* 件名入力 */}
                <div>
                  <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">
                    件名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={feedbackTitle}
                    onChange={(e) => setFeedbackTitle(e.target.value)}
                    placeholder="例: ログイン画面で不具合があります"
                    maxLength={200}
                    className="w-full bg-white border border-slate-300 rounded-lg px-5 py-3 text-lg text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white placeholder-slate-500 dark:placeholder-[#666] focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-slate-500 dark:text-gray-500 text-base mt-1">
                    {feedbackTitle.length} / 200文字
                  </p>
                </div>

                {/* 内容入力 */}
                <div>
                  <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">
                    内容 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={8}
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    placeholder="フィードバック内容を入力してください...&#10;&#10;【不具合報告の場合】&#10;・発生した状況&#10;・エラーメッセージ&#10;・再現手順&#10;などを記載いただけると助かります。"
                    maxLength={20000}
                    className="w-full bg-white border border-slate-300 rounded-lg px-5 py-4 text-lg text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white placeholder-slate-500 dark:placeholder-[#666] focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <p className="text-slate-500 dark:text-gray-500 text-base mt-1">
                    {feedbackContent.length} / 20,000文字
                  </p>
                </div>

                {/* 送信ボタン */}
                <div className="flex gap-3">
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={isLoading || !feedbackTitle.trim() || !feedbackContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '送信中...' : '運営者に送信'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 通知設定タブ */}
        {activeTab === 'notifications' && (
          <div className="max-w-4xl mx-auto">
            <NotificationSettings />
          </div>
        )}
      </div>

      {/* パスワード変更モーダル */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border border-slate-300 shadow-sm dark:bg-[#1a1a2e] dark:border-[#2a2a3e] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-3xl font-bold mb-5">パスワード変更</h3>

            <div className="space-y-4">
              <div>
                <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">現在のパスワード</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-5 py-3 text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">新しいパスワード</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-5 py-3 text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-slate-500 dark:text-gray-500 text-base mt-1">
                  8文字以上で、英字大小文字・数字・記号（!@#$%^&*(),.?&quot;:{}|&lt;&gt;）を全て組み合わせてください
                </p>
              </div>

              <div>
                <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">新しいパスワード（確認）</label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-5 py-3 text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePasswordChange}
                disabled={isLoading || !currentPassword || !newPassword || !newPasswordConfirm}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white dark:bg-gray-700 dark:hover:bg-gray-600 px-5 py-3 rounded-lg font-semibold disabled:opacity-50"
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
          <div className="bg-white border border-slate-300 shadow-sm dark:bg-[#1a1a2e] dark:border-[#2a2a3e] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-3xl font-bold mb-5">メールアドレス変更</h3>

            {/* モーダル内エラー表示 */}
            {emailModalError && (
              <div className="mb-5 bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-700/50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 dark:text-red-200 text-base">{emailModalError}</p>
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
                <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">現在のメールアドレス</label>
                <p className="text-slate-900 dark:text-white font-semibold">{staff?.email || '未設定'}</p>
              </div>

              <div>
                <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">新しいメールアドレス</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-5 py-3 text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white focus:outline-none focus:border-blue-500"
                  placeholder="new-email@example.com"
                />
                <p className="text-slate-500 dark:text-gray-500 text-base mt-1">
                  確認メールが送信されます
                </p>
              </div>

              <div>
                <label className="text-slate-600 dark:text-gray-400 text-base block mb-2">現在のパスワード</label>
                <input
                  type="password"
                  value={emailChangePassword}
                  onChange={(e) => setEmailChangePassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-5 py-3 text-slate-900 dark:bg-[#0f1419] dark:border-[#2a2a3e] dark:text-white focus:outline-none focus:border-blue-500"
                  placeholder="本人確認のため入力してください"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50 rounded-lg p-3">
                <p className="text-yellow-800 dark:text-yellow-200 text-base">
                  ⚠️ 確認メールを受信できるメールアドレスを入力してください。メール内のリンクをクリックすると変更が完了します。
                </p>
              </div>

              {staff?.is_mfa_enabled && (
                <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-blue-800 dark:text-blue-300 text-base leading-relaxed">
                      <p className="font-semibold mb-1">2段階認証について</p>
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white dark:bg-gray-700 dark:hover:bg-gray-600 px-5 py-3 rounded-lg font-semibold disabled:opacity-50"
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
