'use client';

import { useState, useEffect } from 'react';
import { MdEdit, MdCheckCircle, MdCancel, MdDelete } from 'react-icons/md';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { QRCodeCanvas } from 'qrcode.react';
import { StaffResponse } from '@/types/staff';
import { OfficeResponse, OfficeInfoUpdateRequest, OfficeTypeValue } from '@/types/office';
import { calendarApi } from '@/lib/calendar';
import { OfficeCalendarAccount, CalendarConnectionStatus } from '@/types/calendar';
import { authApi, officeApi } from '@/lib/auth';
import { officesApi } from '@/lib/api/offices';

interface AdminMenuProps {
  office: OfficeResponse | null;
}

type TabType = 'office' | 'integration' | 'plan';

export default function AdminMenu({ office }: AdminMenuProps) {
  const [activeTab, setActiveTab] = useState<TabType>('office');
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

  // MFA management state
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState<string | null>(null);
  const [mfaSetupData, setMfaSetupData] = useState<{
    qr_code_uri: string;
    secret_key: string;
    recovery_codes: string[];
  } | null>(null);
  const [showMfaSetupModal, setShowMfaSetupModal] = useState<boolean>(false);

  // Office staffs management state
  const [officeStaffs, setOfficeStaffs] = useState<StaffResponse[]>([]);
  const [isLoadingStaffs, setIsLoadingStaffs] = useState<boolean>(false);
  const [loadStaffsError, setLoadStaffsError] = useState<string | null>(null);
  const [staffMfaTogglingId, setStaffMfaTogglingId] = useState<string | null>(null);

  // Staff deletion state
  const [staffDeletingId, setStaffDeletingId] = useState<string | null>(null);
  const [deleteStaffError, setDeleteStaffError] = useState<string | null>(null);
  const [deleteStaffSuccess, setDeleteStaffSuccess] = useState<string | null>(null);

  // Bulk MFA operations state
  const [isBulkMfaProcessing, setIsBulkMfaProcessing] = useState<boolean>(false);
  const [bulkMfaError, setBulkMfaError] = useState<string | null>(null);
  const [bulkMfaSuccess, setBulkMfaSuccess] = useState<string | null>(null);
  const [showBulkMfaResultModal, setShowBulkMfaResultModal] = useState<boolean>(false);
  const [bulkMfaResultData, setBulkMfaResultData] = useState<{
    enabled_count?: number;
    disabled_count?: number;
    staff_mfa_data?: Array<{
      staff_id: string;
      staff_name: string;
      qr_code_uri: string;
      secret_key: string;
      recovery_codes: string[];
    }>;
  } | null>(null);

  // Office edit modal state
  const [showOfficeEditModal, setShowOfficeEditModal] = useState<boolean>(false);
  const [officeName, setOfficeName] = useState<string>('');
  const [officeType, setOfficeType] = useState<OfficeTypeValue>('type_B_office');
  const [officeAddress, setOfficeAddress] = useState<string>('');
  const [officePhoneNumber, setOfficePhoneNumber] = useState<string>('');
  const [officeEmail, setOfficeEmail] = useState<string>('');
  const [isSavingOffice, setIsSavingOffice] = useState<boolean>(false);
  const [saveOfficeError, setSaveOfficeError] = useState<string | null>(null);
  const [saveOfficeSuccess, setSaveOfficeSuccess] = useState<string | null>(null);

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

  // 事務所スタッフ一覧を取得
  useEffect(() => {
    const fetchOfficeStaffs = async () => {
      if (activeTab !== 'office') return;

      setIsLoadingStaffs(true);
      setLoadStaffsError(null);

      try {
        const staffs = await officeApi.getOfficeStaffs();
        setOfficeStaffs(staffs);
      } catch (error: unknown) {
        const err = error as { response?: { status?: number; data?: { detail?: string } }; message?: string };
        const errorMessage = err?.response?.data?.detail || err?.message || 'スタッフ一覧の取得に失敗しました。';
        setLoadStaffsError(errorMessage);
      } finally {
        setIsLoadingStaffs(false);
      }
    };

    fetchOfficeStaffs();
  }, [activeTab]);

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

  // 事務所スタッフのMFA有効化
  const handleStaffMfaEnable = async (targetStaff: StaffResponse) => {
    setStaffMfaTogglingId(targetStaff.id);
    setMfaError(null);
    setMfaSuccess(null);

    try {
      const response = await authApi.enableStaffMfa(targetStaff.id);
      setMfaSuccess(`${targetStaff.full_name}さんのMFAを有効化しました。`);

      // MFA設定データを保存してモーダル表示
      setMfaSetupData({
        qr_code_uri: response.qr_code_uri,
        secret_key: response.secret_key,
        recovery_codes: response.recovery_codes,
      });
      setShowMfaSetupModal(true);

      // スタッフ一覧を再取得
      const staffs = await officeApi.getOfficeStaffs();
      setOfficeStaffs(staffs);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        'MFA有効化に失敗しました。';
      setMfaError(errorMessage);
    } finally {
      setStaffMfaTogglingId(null);
    }
  };

  // 事務所スタッフのMFA無効化
  const handleStaffMfaDisable = async (targetStaff: StaffResponse) => {
    if (!window.confirm(`本当に${targetStaff.full_name}さんのMFAを無効化しますか？セキュリティが低下します。`)) {
      return;
    }

    setStaffMfaTogglingId(targetStaff.id);
    setMfaError(null);
    setMfaSuccess(null);

    try {
      await authApi.disableStaffMfa(targetStaff.id);
      setMfaSuccess(`${targetStaff.full_name}さんのMFAを無効化しました。`);

      // スタッフ一覧を再取得
      const staffs = await officeApi.getOfficeStaffs();
      setOfficeStaffs(staffs);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        'MFA無効化に失敗しました。';
      setMfaError(errorMessage);
    } finally {
      setStaffMfaTogglingId(null);
    }
  };

  // オフィス編集モーダルを開く
  const handleOpenOfficeEditModal = () => {
    if (office) {
      setOfficeName(office.name);
      setOfficeType(office.office_type);
      setOfficeAddress(office.address || '');
      setOfficePhoneNumber(office.phone_number || '');
      setOfficeEmail(office.email || '');
    }
    setSaveOfficeError(null);
    setSaveOfficeSuccess(null);
    setShowOfficeEditModal(true);
  };

  // オフィス編集を保存（モーダル用）
  const handleSaveOfficeEdit = async () => {
    setIsSavingOffice(true);
    setSaveOfficeError(null);
    setSaveOfficeSuccess(null);

    try {
      // 変更されたフィールドのみ送信
      const updateData: OfficeInfoUpdateRequest = {};

      if (officeName !== office?.name) {
        updateData.name = officeName;
      }
      if (officeType !== office?.office_type) {
        updateData.type = officeType;
      }
      if (officeAddress !== (office?.address || '')) {
        updateData.address = officeAddress;
      }
      if (officePhoneNumber !== (office?.phone_number || '')) {
        updateData.phone_number = officePhoneNumber;
      }
      if (officeEmail !== (office?.email || '')) {
        updateData.email = officeEmail;
      }

      // 変更がない場合
      if (Object.keys(updateData).length === 0) {
        setSaveOfficeSuccess('変更はありません');
        setIsSavingOffice(false);
        setTimeout(() => setShowOfficeEditModal(false), 1500);
        return;
      }

      await officesApi.updateOfficeInfo(updateData);
      setSaveOfficeSuccess('事務所情報を更新しました');

      // 成功したら1.5秒後にモーダルを閉じてページをリロード
      setTimeout(() => {
        setShowOfficeEditModal(false);
        window.location.reload();
      }, 1500);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        '事務所情報の更新に失敗しました。';
      setSaveOfficeError(errorMessage);
    } finally {
      setIsSavingOffice(false);
    }
  };

  // 全スタッフのMFA一括有効化
  const handleBulkEnableMfa = async () => {
    if (!window.confirm('事務所の全スタッフのMFAを一括で有効化しますか？\n各スタッフのQRコードとリカバリーコードが生成されます。')) {
      return;
    }

    setIsBulkMfaProcessing(true);
    setBulkMfaError(null);
    setBulkMfaSuccess(null);

    try {
      const response = await authApi.enableAllOfficeMfa();
      setBulkMfaSuccess(`${response.enabled_count}名のスタッフのMFAを有効化しました。`);
      setBulkMfaResultData(response);
      setShowBulkMfaResultModal(true);

      // スタッフ一覧を再取得
      const staffs = await officeApi.getOfficeStaffs();
      setOfficeStaffs(staffs);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        'MFA一括有効化に失敗しました。';
      setBulkMfaError(errorMessage);
    } finally {
      setIsBulkMfaProcessing(false);
    }
  };

  // 全スタッフのMFA一括無効化
  const handleBulkDisableMfa = async () => {
    if (!window.confirm('事務所の全スタッフのMFAを一括で無効化しますか？\nセキュリティが低下します。')) {
      return;
    }

    setIsBulkMfaProcessing(true);
    setBulkMfaError(null);
    setBulkMfaSuccess(null);

    try {
      const response = await authApi.disableAllOfficeMfa();
      setBulkMfaSuccess(`${response.disabled_count}名のスタッフのMFAを無効化しました。`);
      setBulkMfaResultData(response);

      // スタッフ一覧を再取得
      const staffs = await officeApi.getOfficeStaffs();
      setOfficeStaffs(staffs);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        'MFA一括無効化に失敗しました。';
      setBulkMfaError(errorMessage);
    } finally {
      setIsBulkMfaProcessing(false);
    }
  };

  // スタッフ削除
  const handleStaffDelete = async (targetStaff: StaffResponse) => {
    if (!window.confirm(`本当に${targetStaff.full_name}さんを削除しますか？\nこの操作は取り消せません。`)) {
      return;
    }

    setStaffDeletingId(targetStaff.id);
    setDeleteStaffError(null);
    setDeleteStaffSuccess(null);

    try {
      const response = await authApi.deleteStaff(targetStaff.id);
      setDeleteStaffSuccess(`${targetStaff.full_name}さんを削除しました。`);

      // スタッフ一覧を再取得
      const staffs = await officeApi.getOfficeStaffs();
      setOfficeStaffs(staffs);

      // 成功メッセージを3秒後にクリア
      setTimeout(() => setDeleteStaffSuccess(null), 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        'スタッフの削除に失敗しました。';
      setDeleteStaffError(errorMessage);
    } finally {
      setStaffDeletingId(null);
    }
  };

  // 削除済みスタッフの残り日数を計算
  const calculateRemainingDays = (deletedAt: string | null): number => {
    if (!deletedAt) return 0;

    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30日後
    const now = new Date();
    const remainingMs = expiryDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

    return Math.max(0, remainingDays);
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
      {/* メニュー */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="flex">
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

        <div className="flex-1 overflow-y-auto p-6">
          {/* オフィス: 内容変更 */}
          {activeTab === 'office' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">事業所設定</h2>

              {/* MFA成功メッセージ */}
              {mfaSuccess && (
                <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
                  <p className="text-green-400 text-sm">{mfaSuccess}</p>
                </div>
              )}

              {/* MFAエラーメッセージ */}
              {mfaError && (
                <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                  <p className="text-red-400 text-sm font-semibold">エラー</p>
                  <p className="text-red-400 text-sm mt-1">{mfaError}</p>
                </div>
              )}

              {/* スタッフ削除成功メッセージ */}
              {deleteStaffSuccess && (
                <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
                  <p className="text-green-400 text-sm">{deleteStaffSuccess}</p>
                </div>
              )}

              {/* スタッフ削除エラーメッセージ */}
              {deleteStaffError && (
                <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                  <p className="text-red-400 text-sm font-semibold">エラー</p>
                  <p className="text-red-400 text-sm mt-1">{deleteStaffError}</p>
                </div>
              )}

              {/* オフィス情報カード */}
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">事業所情報</h3>
                  <button
                    onClick={handleOpenOfficeEditModal}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <MdEdit className="w-5 h-5" />
                    編集
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">事業所名</p>
                    <p className="text-white font-medium">{office?.name || '未設定'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">事業所種別</p>
                    <p className="text-white font-medium">
                      {office?.office_type === 'transition_to_employment' && '移行支援'}
                      {office?.office_type === 'type_A_office' && '就労A型'}
                      {office?.office_type === 'type_B_office' && '就労B型'}
                      {!office?.office_type && '未設定'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">住所</p>
                    <p className="text-white font-medium">{office?.address || '未設定'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">電話番号</p>
                    <p className="text-white font-medium">{office?.phone_number || '未設定'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">メールアドレス</p>
                    <p className="text-white font-medium">{office?.email || '未設定'}</p>
                  </div>
                </div>
              </div>

              {/* スタッフ管理セクション */}
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">事務所スタッフ管理</h3>
                    <span className="text-gray-400 text-sm">
                      {officeStaffs.length}名
                    </span>

                    {/* QRコード紛失時のヘルプツールチップ */}
                    <div className="group relative">
                      <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors">
                        <AiOutlineQuestionCircle className="h-5 w-5" />
                        <span className="underline">QRコードを紛失した場合</span>
                      </button>

                      {/* ツールチップ */}
                      <div className="absolute left-0 top-full mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="flex items-start gap-2">
                          <AiOutlineQuestionCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-white mb-2">QRコード紛失時の対処法</p>
                            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                              <li>対象スタッフのMFAを一度無効化する</li>
                              <li>再度MFAを有効化する</li>
                              <li>新しいQRコードとシークレットキーが発行される</li>
                              <li>スタッフに新しいQRコードを共有する</li>
                            </ol>
                            <p className="text-xs text-gray-400 mt-3">
                              ⚠️ 無効化すると、既存のTOTPアプリの設定は使用できなくなります。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkEnableMfa}
                      disabled={isBulkMfaProcessing || isLoadingStaffs}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      {isBulkMfaProcessing ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          処理中...
                        </>
                      ) : (
                        <>
                          <MdCheckCircle className="w-5 h-5" />
                          全員MFA有効化
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleBulkDisableMfa}
                      disabled={isBulkMfaProcessing || isLoadingStaffs}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      {isBulkMfaProcessing ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          処理中...
                        </>
                      ) : (
                        <>
                          <MdCancel className="w-5 h-5" />
                          全員MFA無効化
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* バルクMFA操作エラーメッセージ */}
                {bulkMfaError && (
                  <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-sm font-semibold">エラー</p>
                    <p className="text-red-400 text-sm mt-1">{bulkMfaError}</p>
                  </div>
                )}

                {/* バルクMFA操作成功メッセージ */}
                {bulkMfaSuccess && !showBulkMfaResultModal && (
                  <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
                    <p className="text-green-400 text-sm font-semibold">成功</p>
                    <p className="text-green-400 text-sm mt-1">{bulkMfaSuccess}</p>
                  </div>
                )}

                {/* ローディング中 */}
                {isLoadingStaffs && (
                  <div className="p-4 bg-gray-700 rounded-lg flex items-center">
                    <svg className="animate-spin h-5 w-5 text-blue-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-400 text-sm">スタッフ一覧を読み込み中...</p>
                  </div>
                )}

                {/* エラー表示 */}
                {loadStaffsError && !isLoadingStaffs && (
                  <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-sm font-semibold">読み込みエラー</p>
                    <p className="text-red-400 text-sm mt-1">{loadStaffsError}</p>
                  </div>
                )}



                {/* スタッフ一覧テーブル */}
                {!isLoadingStaffs && !loadStaffsError && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">氏名</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">メールアドレス</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">役割</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">MFA状態/変更</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">スタッフ削除</th>
                        </tr>
                      </thead>
                      <tbody>
                        {officeStaffs.map((s) => {
                          const isDeleted = s.is_deleted;
                          const remainingDays = isDeleted ? calculateRemainingDays(s.deleted_at) : 0;

                          return (
                            <tr key={s.id} className={`border-b border-gray-700 hover:bg-gray-700/50 ${isDeleted ? 'opacity-50' : ''}`}>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className={isDeleted ? 'text-gray-500 line-through' : 'text-white'}>
                                    {s.full_name}
                                  </span>
                                  {isDeleted && (
                                    <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-900/50 text-red-400 border border-red-500">
                                      削除済み - 残り{remainingDays}日で完全削除
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-300">{s.email}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(s.role)}`}
                                >
                                  {getRoleLabel(s.role)}
                                </span>
                              </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-3 py-1 rounded-lg text-sm font-semibold border flex items-center gap-1 ${
                                    s.is_mfa_enabled
                                      ? 'bg-green-900/50 text-green-400 border-green-500'
                                      : 'bg-gray-700 text-gray-400 border-gray-600'
                                  }`}
                                >
                                  {s.is_mfa_enabled ? (
                                    <>
                                      <MdCheckCircle className="w-4 h-4" />
                                      有効
                                    </>
                                  ) : (
                                    <>
                                      <MdCancel className="w-4 h-4" />
                                      無効
                                    </>
                                  )}
                                </span>
                                {s.is_mfa_enabled ? (
                                  <button
                                    onClick={() => handleStaffMfaDisable(s)}
                                    disabled={staffMfaTogglingId === s.id || isDeleted}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    {staffMfaTogglingId === s.id ? (
                                      <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        処理中...
                                      </>
                                    ) : (
                                      '無効化'
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleStaffMfaEnable(s)}
                                    disabled={staffMfaTogglingId === s.id || isDeleted}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    {staffMfaTogglingId === s.id ? (
                                      <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        処理中...
                                      </>
                                    ) : (
                                      '有効化'
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                              <td className="py-3 px-4">
                                {isDeleted ? (
                                  <span className="text-gray-500 text-sm">削除済み</span>
                                ) : (
                                  <button
                                    onClick={() => handleStaffDelete(s)}
                                    disabled={staffDeletingId === s.id}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    {staffDeletingId === s.id ? (
                                      <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        削除中...
                                      </>
                                    ) : (
                                      <>
                                        <MdDelete className="w-4 h-4" />
                                        削除
                                      </>
                                    )}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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

      {/* MFA設定情報モーダル */}
      {showMfaSetupModal && mfaSetupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-white">MFA設定情報</h3>
            <p className="text-gray-400 mb-6">
              以下の情報をスタッフに安全な方法で共有してください。この情報は一度しか表示されません。
            </p>

            {/* QRコード */}
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h4 className="text-lg font-semibold mb-3 text-white">QRコード</h4>
              <p className="text-gray-400 text-sm mb-3">
                Google AuthenticatorなどのTOTPアプリで以下のQRコードをスキャンしてください。
              </p>
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCodeCanvas
                  value={mfaSetupData.qr_code_uri}
                  size={192}
                  level="H"
                />
              </div>
            </div>

            {/* シークレットキー */}
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h4 className="text-lg font-semibold mb-3 text-white">シークレットキー（手動入力用）</h4>
              <p className="text-gray-400 text-sm mb-3">
                QRコードをスキャンできない場合は、以下のキーを手動で入力してください。
              </p>
              <div className="bg-gray-900 p-3 rounded font-mono text-sm text-white break-all">
                {mfaSetupData.secret_key}
              </div>
            </div>

            {/* リカバリーコード */}
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h4 className="text-lg font-semibold mb-3 text-white">リカバリーコード</h4>
              <p className="text-gray-400 text-sm mb-3">
                デバイスを紛失した場合に使用できるバックアップコードです。安全な場所に保管してください。
              </p>
              <div className="bg-gray-900 p-4 rounded">
                <div className="grid grid-cols-2 gap-2">
                  {mfaSetupData.recovery_codes.map((code, index) => (
                    <div key={index} className="font-mono text-sm text-white">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 閉じるボタン */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowMfaSetupModal(false);
                  setMfaSetupData(null);
                  // ページをリロードしてスタッフ情報を更新
                  window.location.reload();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* オフィス編集モーダル */}
      {showOfficeEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-white">事業所情報を編集</h3>

            {/* エラーメッセージ */}
            {saveOfficeError && (
              <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm font-semibold">エラー</p>
                <p className="text-red-400 text-sm mt-1">{saveOfficeError}</p>
              </div>
            )}

            {/* 成功メッセージ */}
            {saveOfficeSuccess && (
              <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
                <p className="text-green-400 text-sm">{saveOfficeSuccess}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  事業所名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="事業所名を入力"
                  required
                  minLength={1}
                  maxLength={255}
                  disabled={isSavingOffice}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">事業所種別</label>
                <select
                  value={officeType}
                  onChange={(e) => setOfficeType(e.target.value as OfficeTypeValue)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  disabled={isSavingOffice}
                >
                  <option value="transition_to_employment">移行支援</option>
                  <option value="type_A_office">就労A型</option>
                  <option value="type_B_office">就労B型</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">住所</label>
                <input
                  type="text"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="例: 東京都渋谷区1-2-3"
                  maxLength={500}
                  disabled={isSavingOffice}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">電話番号</label>
                <input
                  type="tel"
                  value={officePhoneNumber}
                  onChange={(e) => setOfficePhoneNumber(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="例: 03-1234-5678"
                  pattern="\d{2,4}-\d{2,4}-\d{4}"
                  disabled={isSavingOffice}
                />
                <p className="mt-1 text-xs text-gray-500">
                  形式: 03-1234-5678（ハイフン区切り）
                </p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">メールアドレス</label>
                <input
                  type="email"
                  value={officeEmail}
                  onChange={(e) => setOfficeEmail(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="例: info@example.com"
                  disabled={isSavingOffice}
                />
              </div>
            </div>

            {/* ボタン */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowOfficeEditModal(false)}
                disabled={isSavingOffice}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveOfficeEdit}
                disabled={isSavingOffice}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingOffice ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </>
                ) : (
                  '保存'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* バルクMFA有効化結果モーダル */}
      {showBulkMfaResultModal && bulkMfaResultData?.staff_mfa_data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">MFA一括有効化結果</h2>
              <p className="text-green-400 mt-2">
                {bulkMfaResultData.enabled_count}名のスタッフのMFAを有効化しました
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-yellow-900/50 border border-yellow-500 rounded-lg">
                <p className="text-yellow-400 text-sm font-semibold">重要</p>
                <p className="text-yellow-400 text-sm mt-1">
                  以下の情報を各スタッフに安全な方法で伝えてください。QRコードをスキャンしてTOTPアプリに登録し、リカバリーコードは安全な場所に保管してください。
                </p>
              </div>

              <div className="space-y-6">
                {bulkMfaResultData.staff_mfa_data.map((staffData, index) => (
                  <div key={staffData.staff_id} className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {index + 1}. {staffData.staff_name}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* QRコード */}
                      <div>
                        <p className="text-gray-400 text-sm mb-2">QRコード</p>
                        <div className="bg-white p-4 rounded-lg inline-block">
                          <QRCodeCanvas
                            value={staffData.qr_code_uri}
                            size={192}
                            level="H"
                          />
                        </div>
                      </div>

                      {/* シークレットキーとリカバリーコード */}
                      <div>
                        <div className="mb-4">
                          <p className="text-gray-400 text-sm mb-2">シークレットキー</p>
                          <code className="block bg-gray-900 text-green-400 p-2 rounded text-xs break-all">
                            {staffData.secret_key}
                          </code>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm mb-2">リカバリーコード（10個）</p>
                          <div className="bg-gray-900 p-3 rounded max-h-40 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                              {staffData.recovery_codes.map((code, codeIndex) => (
                                <code key={codeIndex} className="text-green-400 text-xs">
                                  {code}
                                </code>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ボタン */}
            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowBulkMfaResultModal(false);
                  setBulkMfaResultData(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
