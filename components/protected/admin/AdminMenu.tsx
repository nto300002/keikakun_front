'use client';

import { useState, useEffect } from 'react';
import { StaffResponse } from '@/types/staff';
import { OfficeResponse } from '@/types/office';
import { calendarApi } from '@/lib/calendar';
import { OfficeCalendarAccount, CalendarConnectionStatus } from '@/types/calendar';

interface AdminMenuProps {
  staff: StaffResponse | null;
  office: OfficeResponse | null;
}

type TabType = 'staff' | 'office' | 'integration' | 'plan';

export default function AdminMenu({ staff, office }: AdminMenuProps) {
  const [activeTab, setActiveTab] = useState<TabType>('staff');
  const [calendarFile, setCalendarFile] = useState<File | null>(null);
  const [calendarId, setCalendarId] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [existingCalendar, setExistingCalendar] = useState<OfficeCalendarAccount | null>(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState<boolean>(false);
  const [loadCalendarError, setLoadCalendarError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // 既存のカレンダー設定を取得
  useEffect(() => {
    const fetchExistingCalendar = async () => {
      if (!office?.id || activeTab !== 'integration') return;

      setIsLoadingCalendar(true);
      setLoadCalendarError(null);

      try {
        const calendar = await calendarApi.getOfficeCalendar(office.id);
        setExistingCalendar(calendar);

        // 既存のカレンダーIDがあれば入力フィールドにセット
        if (calendar.google_calendar_id) {
          setCalendarId(calendar.google_calendar_id);
        }
      } catch (error: unknown) {
        // 404エラーの場合は設定がまだないだけなので、エラーとして扱わない
        const err = error as { response?: { status?: number; data?: { detail?: string } }; message?: string };
        if (err?.response?.status === 404) {
          setExistingCalendar(null);
        } else {
          const errorMessage = err?.response?.data?.detail || err?.message || 'カレンダー設定の取得に失敗しました。';
          setLoadCalendarError(errorMessage);
        }
      } finally {
        setIsLoadingCalendar(false);
      }
    };

    fetchExistingCalendar();
  }, [office?.id, activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCalendarFile(e.target.files[0]);
    }
  };

  const handleCalendarSubmit = async () => {
    if (!calendarFile || !calendarId || !office?.id) {
      setUploadError('カレンダーIDとJSONファイルを入力してください。');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // ファイルを読み込んで文字列化
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error('ファイルの読み込みに失敗しました。'));
          }
        };
        reader.onerror = () => reject(new Error('ファイルの読み込み中にエラーが発生しました。'));
        reader.readAsText(calendarFile);
      });

      // JSONとして検証
      try {
        JSON.parse(fileContent);
      } catch {
        setUploadError('無効なJSONファイルです。正しいサービスアカウントJSONファイルを選択してください。');
        setIsUploading(false);
        return;
      }

      let response;

      // 既存設定がある場合は更新、ない場合は新規作成
      if (existingCalendar) {
        response = await calendarApi.updateCalendar(existingCalendar.id, {
          google_calendar_id: calendarId,
          service_account_json: fileContent,
          office_id: office.id,
        });
      } else {
        response = await calendarApi.uploadServiceAccountKey({
          google_calendar_id: calendarId,
          service_account_json: fileContent,
          office_id: office.id,
        });
      }

      if (response.success) {
        setUploadSuccess(response.message || 'Google カレンダー設定を保存しました。');
        setCalendarFile(null);

        // 成功後、既存の設定を再取得
        try {
          const calendar = await calendarApi.getOfficeCalendar(office.id);
          setExistingCalendar(calendar);
        } catch (refreshError) {
          console.error('カレンダー設定の再取得に失敗:', refreshError);
        }
      } else {
        setUploadError(response.error_details || '保存に失敗しました。');
      }
    } catch (error: unknown) {
      // バックエンドからのエラーメッセージを適切に表示
      const err = error as { response?: { data?: { detail?: string; error_details?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.error_details ||
        err?.message ||
        '保存に失敗しました。';
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-600';
      case 'manager':
        return 'bg-blue-600';
      case 'employee':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'オーナー';
      case 'manager':
        return 'マネージャー';
      case 'employee':
        return '従業員';
      default:
        return 'その他';
    }
  };

  const handleCalendarDelete = async () => {
    if (!existingCalendar) return;

    setIsDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(null);

    try {
      const response = await calendarApi.deleteCalendar(existingCalendar.id);

      if (response.success) {
        setDeleteSuccess(response.message || 'カレンダー連携を解除しました。');
        setExistingCalendar(null);
        setCalendarId('');
        setCalendarFile(null);
        setShowDeleteConfirm(false);
      } else {
        setDeleteError('連携解除に失敗しました。');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        '連携解除に失敗しました。';
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const getConnectionStatusLabel = (status: CalendarConnectionStatus) => {
    switch (status) {
      case CalendarConnectionStatus.CONNECTED:
        return '接続済み';
      case CalendarConnectionStatus.NOT_CONNECTED:
        return '未接続';
      case CalendarConnectionStatus.ERROR:
        return 'エラー';
      case CalendarConnectionStatus.SYNCING:
        return '同期中';
      default:
        return '不明';
    }
  };

  const getConnectionStatusColor = (status: CalendarConnectionStatus) => {
    switch (status) {
      case CalendarConnectionStatus.CONNECTED:
        return 'text-green-400 bg-green-900/50 border-green-500';
      case CalendarConnectionStatus.NOT_CONNECTED:
        return 'text-gray-400 bg-gray-700 border-gray-600';
      case CalendarConnectionStatus.ERROR:
        return 'text-red-400 bg-red-900/50 border-red-500';
      case CalendarConnectionStatus.SYNCING:
        return 'text-blue-400 bg-blue-900/50 border-blue-500';
      default:
        return 'text-gray-400 bg-gray-700 border-gray-600';
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      {/* タブ: スタッフ */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">事業所設定</h2>
            {/* オフィス: 概要 */}
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">オフィス</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">概要</h3>
                <div className="space-y-3">
                    <div>
                    <p className="text-gray-400 text-sm">事業所</p>
                    <p className="text-white font-medium">{office?.name || '未設定'}</p>
                    </div>
                </div>
                </div>
            </div>
            <br />
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">スタッフ</h2>
          <div className="space-y-2">
            {staff ? (
              <div className="p-3 rounded-lg bg-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{staff.full_name}</p>
                    <p className="text-sm text-gray-400">{staff.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(
                      staff.role
                    )}`}
                  >
                    {getRoleLabel(staff.role)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-gray-700">
                <p className="text-gray-400 text-sm">ユーザー情報を読み込み中...</p>
              </div>
            )}
          </div>
          <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
            + スタッフを招待
          </button>
        </div>
      </div>

      {/* メニュー */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'staff'
                  ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              スタッフ
            </button>
            <button
              onClick={() => setActiveTab('office')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'office'
                  ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              事業所
            </button>
            <button
              onClick={() => setActiveTab('integration')}
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'integration'
                  ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              連携
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'plan'
                  ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              プラン
            </button>
          </div>
        </div>

        {/* スタッフ */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* スタッフ詳細 */}
          {activeTab === 'staff' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">スタッフ</h2>
              {staff ? (
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">スタッフ詳細</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm">氏名</label>
                      <p className="text-white">{staff.full_name}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">メールアドレス</label>
                      <p className="text-white">{staff.email}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">役割</label>
                      <p className="text-white">{getRoleLabel(staff.role)}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">MFA</label>
                      <p className="text-white">
                        {staff.is_mfa_enabled ? '有効' : '無効'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                      編集
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                      削除
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">ユーザー情報を読み込み中...</p>
              )}
            </div>
          )}

          {/* オフィス: 内容変更 */}
          {activeTab === 'office' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">事業所設定</h2>
            {/* オフィス: 概要 */}
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">オフィス新規作成</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">概要</h3>
                <div className="space-y-3">
                    <div>
                    <p className="text-gray-400 text-sm">事業所</p>
                    <p className="text-white font-medium">{office?.name || '未設定'}</p>
                    </div>
                </div>
                </div>

                <div className="mt-4 bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">アクション</h3>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">
                    新規作成
                </button>
                </div>
            </div>
            <br />
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">オフィス編集</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">事業所名</label>
                    <input
                      type="text"
                      defaultValue={office?.name || ''}
                      className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm">事業所種別</label>
                    <select
                      defaultValue={office?.office_type || ''}
                      className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="transition_to_employment">移行支援</option>
                      <option value="type_A_office">就労A型</option>
                      <option value="type_B_office">就労B型</option>
                    </select>
                  </div>
                  <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* オフィス: 連携 */}
          {activeTab === 'integration' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">連携</h2>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Google カレンダー</h3>
                <p className="text-gray-400 mb-4">
                  Google Calendarへの通知はGoogle Consoleから設定します 詳しくは下記を参照してください
                </p>

                <div className="mb-4">
                  <a
                    href="https://www.canva.com/design/DAG1XaxL5l4/ghDvPurpO76f1kQDMmwFuA/view?utm_content=DAG1XaxL5l4&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hcda6560690"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Google Calendar設定方法
                  </a>
                </div>

                {/* ローディング中 */}
                {isLoadingCalendar && (
                  <div className="mb-4 p-4 bg-gray-700 rounded-lg flex items-center">
                    <svg className="animate-spin h-5 w-5 text-blue-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-400 text-sm">設定を読み込み中...</p>
                  </div>
                )}

                {/* カレンダー設定読み込みエラー */}
                {loadCalendarError && (
                  <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-sm font-semibold">設定の読み込みエラー</p>
                    <p className="text-red-400 text-sm mt-1">{loadCalendarError}</p>
                  </div>
                )}

                {/* 既存のカレンダー設定情報 */}
                {existingCalendar && !isLoadingCalendar && (
                  <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      現在の設定
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">接続ステータス</p>
                        <span className={`inline-block mt-1 px-3 py-1 rounded-lg text-sm font-semibold border ${getConnectionStatusColor(existingCalendar.connection_status)}`}>
                          {getConnectionStatusLabel(existingCalendar.connection_status)}
                        </span>
                      </div>
                      {existingCalendar.google_calendar_id && (
                        <div>
                          <p className="text-gray-400 text-sm">カレンダー ID</p>
                          <p className="text-white font-mono text-sm mt-1 break-all">{existingCalendar.google_calendar_id}</p>
                        </div>
                      )}
                      {existingCalendar.service_account_email && (
                        <div>
                          <p className="text-gray-400 text-sm">サービスアカウント</p>
                          <p className="text-white font-mono text-sm mt-1 break-all">{existingCalendar.service_account_email}</p>
                        </div>
                      )}
                      {existingCalendar.calendar_name && (
                        <div>
                          <p className="text-gray-400 text-sm">カレンダー名</p>
                          <p className="text-white text-sm mt-1">{existingCalendar.calendar_name}</p>
                        </div>
                      )}
                      {existingCalendar.last_sync_at && (
                        <div>
                          <p className="text-gray-400 text-sm">最終同期日時</p>
                          <p className="text-white text-sm mt-1">{new Date(existingCalendar.last_sync_at).toLocaleString('ja-JP')}</p>
                        </div>
                      )}
                      {existingCalendar.last_error_message && (
                        <div>
                          <p className="text-red-400 text-sm font-semibold">最後のエラー</p>
                          <p className="text-red-300 text-sm mt-1">{existingCalendar.last_error_message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* アップロードエラー */}
                {uploadError && (
                  <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-sm font-semibold">アップロードエラー</p>
                    <p className="text-red-400 text-sm mt-1">{uploadError}</p>
                  </div>
                )}

                {/* アップロード成功 */}
                {uploadSuccess && (
                  <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
                    <p className="text-green-400 text-sm">{uploadSuccess}</p>
                  </div>
                )}

                {/* 削除エラー */}
                {deleteError && (
                  <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-sm font-semibold">削除エラー</p>
                    <p className="text-red-400 text-sm mt-1">{deleteError}</p>
                  </div>
                )}

                {/* 削除成功 */}
                {deleteSuccess && (
                  <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
                    <p className="text-green-400 text-sm">{deleteSuccess}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold mb-3">
                    {existingCalendar ? '設定を更新' : '新規設定'}
                  </h4>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      カレンダー ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={calendarId}
                      onChange={(e) => setCalendarId(e.target.value)}
                      placeholder="example@group.calendar.google.com"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Googleカレンダーの設定から取得できます
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      サービスアカウント JSON ファイル <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    {calendarFile && (
                      <p className="mt-2 text-sm text-green-400">
                        選択済み: {calendarFile.name}
                      </p>
                    )}
                    {existingCalendar && !calendarFile && (
                      <p className="mt-1 text-xs text-gray-500">
                        既存の認証情報が設定されています。変更する場合のみファイルを選択してください。
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleCalendarSubmit}
                    disabled={!calendarFile || !calendarId || isUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        アップロード中...
                      </>
                    ) : existingCalendar ? (
                      '設定を更新'
                    ) : (
                      'アップロード'
                    )}
                  </button>
                </div>

                {/* 連携解除セクション */}
                {existingCalendar && (
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <h4 className="text-lg font-semibold mb-3 text-red-400">危険なアクション</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      カレンダー連携を解除すると、今後のイベント同期が停止されます。この操作は元に戻せません。
                    </p>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                      >
                        連携解除
                      </button>
                    ) : (
                      <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
                        <p className="text-red-400 font-semibold mb-3">
                          本当にカレンダー連携を解除しますか？
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={handleCalendarDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                          >
                            {isDeleting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                解除中...
                              </>
                            ) : (
                              '解除を実行'
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg disabled:cursor-not-allowed"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* オフィス: プラン */}
          {activeTab === 'plan' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">プラン</h2>
              <div className="bg-gray-800 p-6 rounded-lg">
                <p className="text-gray-400">プランに関する情報はまだありません。</p>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
