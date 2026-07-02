'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { StaffResponse } from '@/types/staff';
import { OfficeResponse, OfficeInfoUpdateRequest, OfficeTypeValue } from '@/types/office';
import { calendarApi } from '@/lib/calendar';
import { OfficeCalendarAccount, CalendarConnectionStatus } from '@/types/calendar';
import { authApi, officeApi } from '@/lib/auth';
import { officesApi } from '@/lib/api/offices';
import WithdrawalModal from './WithdrawalModal';
import BillingPlanTab from './BillingPlanTab';
import OfficeInfoTab from './OfficeInfoTab';
import StaffManagementTab from './StaffManagementTab';
import GoogleIntegrationTab from './GoogleIntegrationTab';
import OfficeEditModal from './OfficeEditModal';

interface AdminMenuProps {
  office: OfficeResponse | null;
}

type TabType = 'office' | 'integration' | 'plan';

export default function AdminMenu({ office }: AdminMenuProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam && ['office', 'integration', 'plan'].includes(tabParam) ? tabParam : 'office');
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

  // ２段階認証 management state
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

  // Bulk ２段階認証 operations state
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

  // Withdrawal modal state
  const [showWithdrawalModal, setShowWithdrawalModal] = useState<boolean>(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<string | null>(null);

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
        } catch {
          console.error('カレンダー設定の再取得に失敗');
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
        return 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-500 dark:bg-purple-950/30 dark:text-purple-300';
      case 'manager':
        return 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-300';
      case 'employee':
        return 'border-green-300 bg-green-50 text-green-700 dark:border-green-500 dark:bg-green-950/30 dark:text-green-300';
      default:
        return 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-300';
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

  // 事務所スタッフの２段階認証有効化
  const handleStaffMfaEnable = async (targetStaff: StaffResponse) => {
    setStaffMfaTogglingId(targetStaff.id);
    setMfaError(null);
    setMfaSuccess(null);

    try {
      const response = await authApi.enableStaffMfa(targetStaff.id);
      setMfaSuccess(`${targetStaff.full_name}さんの２段階認証を有効化しました。`);

      // ２段階認証設定データを保存してモーダル表示
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
        '２段階認証の有効化に失敗しました。';
      setMfaError(errorMessage);
    } finally {
      setStaffMfaTogglingId(null);
    }
  };

  // 事務所スタッフの２段階認証無効化
  const handleStaffMfaDisable = async (targetStaff: StaffResponse) => {
    if (!window.confirm(`本当に${targetStaff.full_name}さんの２段階認証を無効化しますか？セキュリティが低下します。`)) {
      return;
    }

    setStaffMfaTogglingId(targetStaff.id);
    setMfaError(null);
    setMfaSuccess(null);

    try {
      await authApi.disableStaffMfa(targetStaff.id);
      setMfaSuccess(`${targetStaff.full_name}さんの２段階認証を無効化しました。`);

      // スタッフ一覧を再取得
      const staffs = await officeApi.getOfficeStaffs();
      setOfficeStaffs(staffs);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        '２段階認証の無効化に失敗しました。';
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

  // 全スタッフの２段階認証一括有効化
  const handleBulkEnableMfa = async () => {
    if (!window.confirm('事務所の全スタッフの２段階認証を一括で有効化しますか？\n各スタッフのQRコードとリカバリーコードが生成されます。')) {
      return;
    }

    setIsBulkMfaProcessing(true);
    setBulkMfaError(null);
    setBulkMfaSuccess(null);

    try {
      const response = await authApi.enableAllOfficeMfa();
      setBulkMfaSuccess(`${response.enabled_count}名のスタッフの２段階認証を有効化しました。`);
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
        '２段階認証の一括有効化に失敗しました。';
      setBulkMfaError(errorMessage);
    } finally {
      setIsBulkMfaProcessing(false);
    }
  };

  // 全スタッフの２段階認証一括無効化
  const handleBulkDisableMfa = async () => {
    if (!window.confirm('事務所の全スタッフの２段階認証を一括で無効化しますか？\nセキュリティが低下します。')) {
      return;
    }

    setIsBulkMfaProcessing(true);
    setBulkMfaError(null);
    setBulkMfaSuccess(null);

    try {
      const response = await authApi.disableAllOfficeMfa();
      setBulkMfaSuccess(`${response.disabled_count}名のスタッフの２段階認証を無効化しました。`);
      setBulkMfaResultData(response);

      // スタッフ一覧を再取得
      const staffs = await officeApi.getOfficeStaffs();
      setOfficeStaffs(staffs);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        '２段階認証の一括無効化に失敗しました。';
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
      await authApi.deleteStaff(targetStaff.id);
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
        return 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/50 dark:border-green-500';
      case CalendarConnectionStatus.NOT_CONNECTED:
        return 'text-slate-600 bg-slate-100 border-slate-300 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600';
      case CalendarConnectionStatus.ERROR:
        return 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/50 dark:border-red-500';
      case CalendarConnectionStatus.SYNCING:
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/50 dark:border-blue-500';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-300 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600';
    }
  };

  return (
    <div className="flex h-screen font-semibold bg-slate-100 text-slate-900 dark:bg-gray-900 dark:text-gray-200">
      {/* メニュー */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-300 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('office')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'office'
                  ? 'bg-white text-slate-950 border-b-2 border-blue-500 dark:bg-gray-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              事業所
            </button>
            <button
              onClick={() => setActiveTab('integration')}
              className={`px-6 py-3 font-semibold flex items-center gap-2 ${
                activeTab === 'integration'
                  ? 'bg-white text-slate-950 border-b-2 border-blue-500 dark:bg-gray-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white'
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
              className={`px-6 py-3 font-semibold ${
                activeTab === 'plan'
                  ? 'bg-white text-slate-950 border-b-2 border-blue-500 dark:bg-gray-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              有料会員
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* オフィス: 内容変更 */}
          {activeTab === 'office' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">事業所設定</h2>

              {mfaSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg dark:bg-green-950/40 dark:border-green-700">
                  <p className="text-green-700 text-base dark:text-green-300">{mfaSuccess}</p>
                </div>
              )}

              {mfaError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg dark:bg-red-950/40 dark:border-red-700">
                  <p className="text-red-700 text-base font-semibold dark:text-red-300">エラー</p>
                  <p className="text-red-700 text-base font-semibold mt-1 dark:text-red-300">{mfaError}</p>
                </div>
              )}

              {deleteStaffSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg dark:bg-green-950/40 dark:border-green-700">
                  <p className="text-green-700 text-base dark:text-green-300">{deleteStaffSuccess}</p>
                </div>
              )}

              {deleteStaffError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg dark:bg-red-950/40 dark:border-red-700">
                  <p className="text-red-700 text-base font-semibold dark:text-red-300">エラー</p>
                  <p className="text-red-700 text-base font-semibold mt-1 dark:text-red-300">{deleteStaffError}</p>
                </div>
              )}

              <OfficeInfoTab
                office={office}
                withdrawalSuccess={withdrawalSuccess}
                onEditOffice={handleOpenOfficeEditModal}
                onOpenWithdrawal={() => setShowWithdrawalModal(true)}
              />

              <StaffManagementTab
                officeStaffs={officeStaffs}
                isLoadingStaffs={isLoadingStaffs}
                loadStaffsError={loadStaffsError}
                staffMfaTogglingId={staffMfaTogglingId}
                staffDeletingId={staffDeletingId}
                isBulkMfaProcessing={isBulkMfaProcessing}
                bulkMfaError={bulkMfaError}
                bulkMfaSuccess={bulkMfaSuccess}
                showBulkMfaResultModal={showBulkMfaResultModal}
                onBulkEnableMfa={handleBulkEnableMfa}
                onBulkDisableMfa={handleBulkDisableMfa}
                onStaffMfaEnable={handleStaffMfaEnable}
                onStaffMfaDisable={handleStaffMfaDisable}
                onStaffDelete={handleStaffDelete}
                calculateRemainingDays={calculateRemainingDays}
                getRoleBadgeColor={getRoleBadgeColor}
                getRoleLabel={getRoleLabel}
              />
            </div>
          )}

          {/* オフィス: 連携 */}
          {activeTab === 'integration' && (
            <GoogleIntegrationTab
              calendarFile={calendarFile}
              calendarId={calendarId}
              existingCalendar={existingCalendar}
              isLoadingCalendar={isLoadingCalendar}
              loadCalendarError={loadCalendarError}
              uploadError={uploadError}
              uploadSuccess={uploadSuccess}
              deleteError={deleteError}
              deleteSuccess={deleteSuccess}
              isUploading={isUploading}
              showDeleteConfirm={showDeleteConfirm}
              isDeleting={isDeleting}
              onCalendarIdChange={setCalendarId}
              onFileChange={handleFileChange}
              onCalendarSubmit={handleCalendarSubmit}
              onCalendarDelete={handleCalendarDelete}
              onShowDeleteConfirmChange={setShowDeleteConfirm}
              getConnectionStatusLabel={getConnectionStatusLabel}
              getConnectionStatusColor={getConnectionStatusColor}
            />
          )}

          {/* オフィス: 有料会員 */}
          {activeTab === 'plan' && <BillingPlanTab />}
        </div>
      </div>

      {/* ２段階認証設定情報モーダル */}
      {showMfaSetupModal && mfaSetupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 font-medium border border-slate-300 shadow-sm dark:bg-gray-800 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">２段階認証設定情報</h3>
            <p className="text-slate-600 mb-6 dark:text-gray-400">
              以下の情報をスタッフに安全な方法で共有してください。この情報は一度しか表示されません。
            </p>

            {/* QRコード */}
            <div className="mb-6 p-4 bg-slate-100 border border-slate-300 rounded-lg dark:bg-gray-700 dark:border-gray-600">
              <h4 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">QRコード</h4>
              <p className="text-slate-600 text-base font-semibold dark:text-gray-400 mb-3">
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
            <div className="mb-6 p-4 bg-slate-100 border border-slate-300 rounded-lg dark:bg-gray-700 dark:border-gray-600">
              <h4 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">シークレットキー（手動入力用）</h4>
              <p className="text-slate-600 text-base font-semibold dark:text-gray-400 mb-3">
                QRコードをスキャンできない場合は、以下のキーを手動で入力してください。
              </p>
              <div className="bg-slate-50 border border-slate-300 p-3 rounded font-mono text-base text-slate-900 dark:bg-gray-900 dark:border-gray-600 dark:text-white break-all">
                {mfaSetupData.secret_key}
              </div>
            </div>

            {/* リカバリーコード */}
            <div className="mb-6 p-4 bg-slate-100 border border-slate-300 rounded-lg dark:bg-gray-700 dark:border-gray-600">
              <h4 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">リカバリーコード</h4>
              <p className="text-slate-600 text-base font-semibold dark:text-gray-400 mb-3">
                端末を紛失した場合に使用できるバックアップコードです。安全な場所に保管してください。
              </p>
              <div className="bg-slate-50 border border-slate-300 p-4 rounded dark:bg-gray-900 dark:border-gray-600">
                <div className="grid grid-cols-2 gap-2">
                  {mfaSetupData.recovery_codes.map((code, index) => (
                    <div key={index} className="font-mono text-base text-slate-900 dark:text-white">
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
        <OfficeEditModal
          officeName={officeName}
          officeType={officeType}
          officeAddress={officeAddress}
          officePhoneNumber={officePhoneNumber}
          officeEmail={officeEmail}
          isSavingOffice={isSavingOffice}
          saveOfficeError={saveOfficeError}
          saveOfficeSuccess={saveOfficeSuccess}
          onOfficeNameChange={setOfficeName}
          onOfficeTypeChange={setOfficeType}
          onOfficeAddressChange={setOfficeAddress}
          onOfficePhoneNumberChange={setOfficePhoneNumber}
          onOfficeEmailChange={setOfficeEmail}
          onClose={() => setShowOfficeEditModal(false)}
          onSave={handleSaveOfficeEdit}
        />
      )}

      {/* バルク２段階認証有効化結果モーダル */}
      {showBulkMfaResultModal && bulkMfaResultData?.staff_mfa_data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-xl dark:bg-gray-800 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-300 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">２段階認証一括有効化結果</h2>
              <p className="text-green-700 mt-2 dark:text-green-300">
                {bulkMfaResultData.enabled_count}名のスタッフの２段階認証を有効化しました
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-400 rounded-lg dark:bg-yellow-950/40 dark:border-yellow-600">
                <p className="text-yellow-800 text-base font-semibold dark:text-yellow-300">重要</p>
                <p className="text-yellow-800 text-base font-semibold mt-1 dark:text-yellow-300">
                  以下の情報を各スタッフに安全な方法で伝えてください。QRコードをスキャンしてTOTPアプリに登録し、リカバリーコードは安全な場所に保管してください。
                </p>
              </div>

              <div className="space-y-6 font-medium">
                {bulkMfaResultData.staff_mfa_data.map((staffData, index) => (
                  <div key={staffData.staff_id} className="bg-slate-100 border border-slate-300 p-4 rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {index + 1}. {staffData.staff_name}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* QRコード */}
                      <div>
                        <p className="text-slate-600 text-base font-semibold dark:text-gray-400 mb-2">QRコード</p>
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
                          <p className="text-slate-600 text-base font-semibold dark:text-gray-400 mb-2">シークレットキー</p>
                          <code className="block bg-slate-50 border border-slate-300 text-slate-900 p-2 rounded text-sm break-all dark:bg-gray-900 dark:border-gray-600 dark:text-green-300">
                            {staffData.secret_key}
                          </code>
                        </div>

                        <div>
                          <p className="text-slate-600 text-base font-semibold dark:text-gray-400 mb-2">リカバリーコード（10個）</p>
                          <div className="bg-slate-50 border border-slate-300 p-3 rounded max-h-40 overflow-y-auto dark:bg-gray-900 dark:border-gray-600">
                            <div className="grid grid-cols-2 gap-2">
                              {staffData.recovery_codes.map((code, codeIndex) => (
                                <code key={codeIndex} className="text-slate-900 text-sm dark:text-green-300">
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
            <div className="p-6 border-t border-slate-300 dark:border-gray-700 flex justify-end">
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

      {/* 退会モーダル */}
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onSuccess={() => {
          setShowWithdrawalModal(false);
          setWithdrawalSuccess('退会申請を送信しました。アプリ管理者による承認をお待ちください。');
        }}
        officeName={office?.name || ''}
      />
    </div>
  );
}
