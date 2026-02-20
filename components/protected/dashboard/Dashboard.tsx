'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BiSort, BiFilterAlt, BiUserPlus, BiFile } from 'react-icons/bi';
import { FaClipboardList, FaFileAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import { dashboardApi, DashboardParams } from '@/lib/dashboard';
import { welfareRecipientsApi } from '@/lib/welfare-recipients';
import { DashboardData } from '@/types/dashboard';
import { authApi } from '@/lib/auth';
import { StaffResponse } from '@/types/staff';
import { billingApi } from '@/lib/api/billing';
import { BillingStatusResponse } from '@/types/billing';
import { BillingStatus } from '@/types/enums';
import MfaPrompt from '@/components/auth/MfaPrompt';
import { SmartDropdown } from '@/components/ui/smart-dropdown';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { TableLoadingOverlay } from '@/components/ui/table-loading-overlay';
import EmployeeActionRequestModal from '@/components/common/EmployeeActionRequestModal';
import { useStaffRole } from '@/hooks/useStaffRole';
import { ActionType, ResourceType } from '@/types/employeeActionRequest';
import { toast } from '@/lib/toast-debug';
import { ActiveFilters } from './ActiveFilters';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [staff, setStaff] = useState<StaffResponse | null>(null);
  const [billingStatus, setBillingStatus] = useState<BillingStatusResponse | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState('next_renewal_deadline');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(isLoading);
  const messageShownRef = useRef(false); // メッセージ表示済みフラグ
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    isOverdue: boolean;
    isUpcoming: boolean;
    hasAssessmentDue: boolean;
    status: string | null;
  }>({
    isOverdue: false,
    isUpcoming: false,
    hasAssessmentDue: false,
    status: null,
  });

  // Employee Action Request Modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [pendingDeleteRequest, setPendingDeleteRequest] = useState<{
    recipientId: string;
    recipientName: string;
  } | null>(null);

  const { isEmployee } = useStaffRole();

  // 編集可能かどうかの判定: MFA有効 かつ 課金ステータスがactive/free/early_payment
  const canEdit = useMemo(() => {
    if (!staff || !billingStatus) return false;

    const isActiveBilling =
      billingStatus.billing_status === BillingStatus.FREE ||
      billingStatus.billing_status === BillingStatus.ACTIVE ||
      billingStatus.billing_status === BillingStatus.EARLY_PAYMENT;

    return staff.is_mfa_enabled && isActiveBilling;
  }, [staff, billingStatus]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userData, data, billing] = await Promise.all([
          authApi.getCurrentUser(),
          dashboardApi.getDashboardData(),
          billingApi.getBillingStatus()
        ]);
        setStaff(userData);
        setDashboardData(data);
        setBillingStatus(billing);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // クエリパラメータのfilterを読み取ってフィルターを設定
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'deadline_alert') {
      // 期限が近い利用者のみを表示するフィルター
      setActiveFilters({
        isOverdue: false,
        isUpcoming: true,
        hasAssessmentDue: false,
        status: null,
      });
    }
  }, [searchParams]);

  // クエリパラメータからメッセージを読み取ってtoastを表示
  useEffect(() => {
    const message = searchParams.get('message');
    const hotbarMessage = searchParams.get('hotbar_message');
    const hotbarType = searchParams.get('hotbar_type') || 'success';

    // メッセージが無い場合は何もしない
    if (!message && !hotbarMessage) {
      return;
    }

    // 既にメッセージを表示済みの場合はスキップ（重複防止）
    if (messageShownRef.current) {
      return;
    }

    // 表示済みフラグを先に立てる（重複防止のため）
    messageShownRef.current = true;

    if (message) {
      toast.success(decodeURIComponent(message));
    }

    if (hotbarMessage) {
      const decodedMessage = decodeURIComponent(hotbarMessage);
      if (hotbarType === 'error') {
        toast.error(decodedMessage);
      } else {
        toast.success(decodedMessage);
      }
    }

    // クエリパラメータをクリア（履歴を汚さないため）
    const url = new URL(window.location.href);
    url.searchParams.delete('message');
    url.searchParams.delete('hotbar_message');
    url.searchParams.delete('hotbar_type');
    window.history.replaceState({}, '', url.toString());
  }, [searchParams]);




  const handleNextRenewalSortClick = () => {
    const newSortOrder = sortBy === 'next_renewal_deadline' && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy('next_renewal_deadline');
    setSortOrder(newSortOrder);
    applyFilters({
      sortBy: 'next_renewal_deadline',
      sortOrder: newSortOrder,
      is_overdue: activeFilters.isOverdue,
      is_upcoming: activeFilters.isUpcoming,
      has_assessment_due: activeFilters.hasAssessmentDue,
      status: activeFilters.status || undefined,
    });
  };

  const handleNameSortClick = () => {
    const newSortOrder = sortBy === 'name_phonetic' && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy('name_phonetic');
    setSortOrder(newSortOrder);
    applyFilters({
      sortBy: 'name_phonetic',
      sortOrder: newSortOrder,
      is_overdue: activeFilters.isOverdue,
      is_upcoming: activeFilters.isUpcoming,
      has_assessment_due: activeFilters.hasAssessmentDue,
      status: activeFilters.status || undefined,
    });
  };

  const handleSearch = useCallback(async (term: string) => {
    setSearchTerm(term);
    // デバウンス処理に委譲するため、ここでは即座にAPIは呼ばない
  }, []);

  const applyFilters = useCallback(async (params: Partial<DashboardParams> = {}) => {
    if (isLoadingRef.current) return;
    try {
      setIsLoading(true);
      const filterParams: DashboardParams = {
        searchTerm: searchTerm,
        sortBy: params.sortBy ?? sortBy,
        sortOrder: (params.sortOrder as 'asc'|'desc') ?? sortOrder,
        ...params,
      };

      console.log('Applying filters with params:', filterParams);
      const newDashboardData = await dashboardApi.getDashboardData(filterParams);
      console.log('API Response:', newDashboardData);

      // recipients を必ず配列にする（API の不整合や null を防ぐ）
      if (newDashboardData) {
        if (!Array.isArray(newDashboardData.recipients)) {
          console.warn('dashboardApi returned recipients not array:', newDashboardData.recipients);
          // 安全のため空配列で初期化
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          newDashboardData.recipients = Array.isArray(newDashboardData.recipients) ? newDashboardData.recipients : [];
        }
      }
      setDashboardData(newDashboardData);
    } catch (error) {
      console.error('Failed to apply filters:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, sortOrder, sortBy, activeFilters]);

  // フィルタ切替ハンドラ（applyFilters を先に宣言していることが前提）
  const handleFilterToggle = useCallback((filterType: 'isOverdue' | 'isUpcoming' | 'hasAssessmentDue', value: boolean) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev, [filterType]: value };
      // 非同期呼び出しだが UI 側の状態更新は即時に行う -> エラー無視で発火
      void applyFilters({
        is_overdue: newFilters.isOverdue,
        is_upcoming: newFilters.isUpcoming,
        has_assessment_due: newFilters.hasAssessmentDue,
        status: newFilters.status || undefined,
      });
      return newFilters;
    });
  }, [applyFilters]);

  const handleStatusFilter = useCallback((status: string | null) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev, status };
      void applyFilters({
        is_overdue: newFilters.isOverdue,
        is_upcoming: newFilters.isUpcoming,
        has_assessment_due: newFilters.hasAssessmentDue,
        status: status || undefined,
      });
      return newFilters;
    });
  }, [applyFilters]);

  // フィルターを個別に解除
  const handleFilterRemove = useCallback((filterKey: string) => {
    if (filterKey === 'search') {
      setSearchTerm('');
      setDebouncedSearchTerm('');
    } else {
      setActiveFilters((prev) => {
        const newFilters = { ...prev };
        if (filterKey === 'status') {
          newFilters.status = null;
        } else {
          // isOverdue, isUpcoming, hasAssessmentDue
          (newFilters as Record<string, unknown>)[filterKey] = false;
        }
        void applyFilters({
          is_overdue: newFilters.isOverdue,
          is_upcoming: newFilters.isUpcoming,
          has_assessment_due: newFilters.hasAssessmentDue,
          status: newFilters.status || undefined,
        });
        return newFilters;
      });
    }
  }, [applyFilters]);

  // すべてのフィルターをクリア
  const handleClearAllFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setActiveFilters({
      isOverdue: false,
      isUpcoming: false,
      hasAssessmentDue: false,
      status: null,
    });
    void applyFilters({
      is_overdue: false,
      is_upcoming: false,
      has_assessment_due: false,
      status: undefined,
    });
  }, [applyFilters]);

  const handleResetDisplay = useCallback(async () => {
    if (isLoadingRef.current) return;
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSortBy('name_phonetic');
    setSortOrder('asc');
    setActiveFilters({
      isOverdue: false,
      isUpcoming: false,
      hasAssessmentDue: false,
      status: null,
    });

    try {
      setIsLoading(true);
      const resetData = await dashboardApi.getDashboardData();
      if (resetData) {
        if (!Array.isArray(resetData.recipients)) {
          resetData.recipients = Array.isArray(resetData.recipients) ? resetData.recipients : [];
        }
      }
      setDashboardData(resetData);
    } catch (error) {
      console.error('Failed to reset display:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteRecipient = useCallback(async (recipientId: string, recipientName: string) => {
    // Employeeの場合はリクエスト申請モーダルを表示
    if (isEmployee) {
      setPendingDeleteRequest({ recipientId, recipientName });
      setIsRequestModalOpen(true);
      return;
    }

    // Manager/Ownerの場合は従来通り削除確認
    if (window.confirm(`${recipientName}を本当に削除しますか？この操作は元に戻せません。`)) {
      try {
        setIsLoading(true);

        // APIを呼び出してバックエンドのデータを削除
        await welfareRecipientsApi.delete(recipientId);

        // フロントエンドの状態を直接更新してUIから即座に削除
        setDashboardData(prevData => {
          if (!prevData) return null;
          const updatedRecipients = prevData.recipients.filter(
            recipient => recipient.id !== recipientId
          );
          return { ...prevData, recipients: updatedRecipients };
        });

        // 削除成功をtoastで通知
        toast.success(`${recipientName}を削除しました`);

      } catch (error) {
        console.error('Failed to delete recipient:', error);
        // toastでエラー通知
        toast.error('利用者の削除に失敗しました。ページをリロードして再度お試しください。');
      } finally {
        setIsLoading(false);
      }
    }
  }, [isEmployee]);

  const handleRequestSuccess = () => {
    // リクエスト送信成功時の処理
    toast.success('削除リクエストを送信しました。マネージャー/オーナーの承認をお待ちください。');
    setPendingDeleteRequest(null);
  };

  const getStepBadgeStyle = (step: string | null) => {
    const baseStyle = 'inline-block px-2 py-1 rounded text-xs font-medium';
    let colorStyle = 'bg-gray-600 text-white';

    switch (step) {
      case 'assessment':
        colorStyle = 'bg-sky-600 text-white';
        break;
      case 'draft_plan':
        colorStyle = 'bg-blue-600 text-white';
        break;
      case 'staff_meeting':
        colorStyle = 'bg-indigo-600 text-white';
        break;
      case 'final_plan_signed':
        colorStyle = 'bg-red-600 text-white';
        break;
      case 'monitoring':
        colorStyle = 'bg-orange-600 text-white';
        break;
    }
    return `${baseStyle} ${colorStyle}`;
  };

  const getStepText = (step: string | null) => {
    switch (step) {
      case 'assessment': return 'アセスメント';
      case 'draft_plan': return '個別原案';
      case 'staff_meeting': return '担当者会議';
      case 'monitoring': return 'モニタリング';
      case 'final_plan_signed': return '個別本署名済';
      default: return '支援計画未登録';
    }
  };

  const getDaysRemaining = (deadline: string | null) => {
    if (!deadline) return 0;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysRemainingColor = (days: number) => {
    if (days < 0) return 'text-red-500 bg-red-500/20 font-bold';
    if (days < 7) return 'text-red-500';
    if (days <= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getMonth() + 1}/${today.getDate()}`;
  };

  // recipients をメモ化して毎レンダーで参照が変わらないようにする
  const serviceRecipients = useMemo(
    () => (Array.isArray(dashboardData?.recipients) ? dashboardData.recipients : []),
    [dashboardData]
  );
  
  // 検索デバウンス（300ms）
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // デバウンスされた検索実行
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return;
    if (debouncedSearchTerm) {
      applyFilters({ searchTerm: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, applyFilters, searchTerm]);

  // カウント計算のメモ化
  const { expiredCount, nearDeadlineCount, assessmentDueCount } = useMemo(() => {
    return serviceRecipients.reduce(
    (counts, sr) => {
      // 期限切れ処理
      const renewalDays = getDaysRemaining(sr.next_renewal_deadline);
      const monitoringDays = getDaysRemaining(sr.monitoring_due_date);

      const isRenewalExpired = sr.next_renewal_deadline && renewalDays < 0;
      const isMonitoringExpired =
        sr.latest_step === 'monitoring' && sr.monitoring_due_date && monitoringDays < 0;

      if (isRenewalExpired || isMonitoringExpired) {
        counts.expiredCount++;
      } else {
        // 期限間近処理
        const isRenewalNear =
          sr.next_renewal_deadline && renewalDays >= 0 && renewalDays <= 30;
        const isMonitoringNear =
          sr.latest_step === 'monitoring' &&
          sr.monitoring_due_date &&
          monitoringDays >= 0 &&
          monitoringDays <= 30;
        if (isRenewalNear || isMonitoringNear) {
          counts.nearDeadlineCount++;
        }
      }

      // アセスメント開始期限集計（is_latest_statusがアセスメントの利用者）
      if (sr.latest_step === 'assessment') {
        counts.assessmentDueCount++;
      }

      return counts;
    },
    { expiredCount: 0, nearDeadlineCount: 0, assessmentDueCount: 0 }
  );
  }, [serviceRecipients]);

  if (!dashboardData || !staff) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] text-white animate-in fade-in-0 slide-in-from-bottom-5 duration-300">
      {/* モニタリング期限設定ボタン:いらない */}
      <main className="pt-20 pb-8 px-4 md:px-6 max-w-[1400px] mr-auto">
        {!staff.is_mfa_enabled && (
          <div className="mb-6">
            <MfaPrompt />
          </div>
        )}
        {billingStatus && billingStatus.billing_status === BillingStatus.PAST_DUE && (
          <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              無料お試し期間が過ぎているため利用できません
            </p>
            <p className="text-red-300 text-sm mt-2">
              新規作成・編集・削除などの操作はご利用いただけません。オーナーの方は管理者設定のプラン登録ページから課金登録を行ってください。
            </p>
          </div>
        )}
        <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white">利用者ダッシュボード</h1>
                <div className="text-gray-300 text-md">
                  {getCurrentDate()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-4 mb-6 animate-in slide-in-from-top-4 duration-400 delay-150">
              <div className="bg-gradient-to-br from-[#3d1f1f] to-[#2a1515] rounded-lg p-4 border border-[#2a3441] transform hover:scale-105 transition-transform duration-200 lg:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 bg-[#ff9800]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[#ff9800] text-sm">⚠️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium" title="次回更新期限が過ぎた利用者">計画期限切れ</p>
                    <p className="text-xl font-bold text-white">{expiredCount}<span className="text-sm font-normal ml-1">件</span></p>
                  </div>
                  <BiFilterAlt
                    className={`cursor-pointer flex-shrink-0 ${activeFilters.isOverdue ? 'text-[#ffab40]' : 'text-[#ff9800] hover:text-[#ffab40]'}`}
                    size={20}
                    onClick={() => handleFilterToggle('isOverdue', !activeFilters.isOverdue)}
                    title={activeFilters.isOverdue ? "フィルター解除" : "計画期限切れでフィルター"}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#3d3d1f] to-[#2a2a15] rounded-lg p-4 border border-[#2a3441] transform hover:scale-105 transition-transform duration-200 lg:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 bg-[#ffd700]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[#ffd700] text-sm">📋</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium" title="次回更新期限まで30日以内の利用者">計画期限間近（30日以内）</p>
                    <p className="text-xl font-bold text-white">{nearDeadlineCount}<span className="text-sm font-normal ml-1">件</span></p>
                  </div>
                  <BiFilterAlt
                    className={`cursor-pointer flex-shrink-0 ${activeFilters.isUpcoming ? 'text-[#ffed4e]' : 'text-[#ffd700] hover:text-[#ffed4e]'}`}
                    size={20}
                    onClick={() => handleFilterToggle('isUpcoming', !activeFilters.isUpcoming)}
                    title={activeFilters.isUpcoming ? "フィルター解除" : "計画期限間近でフィルター"}
                  />
                </div>
              </div>

              {/* アセスメント開始期限フィルター */}
              <div className="bg-gradient-to-br from-[#1f2f3d] to-[#15202a] rounded-lg p-4 border border-[#2a3441] transform hover:scale-105 transition-transform duration-200 lg:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 bg-[#00bcd4]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[#00bcd4] text-sm">📝</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium" title="is_latest_statusがアセスメントの利用者">アセスメント未完了</p>
                    <p className="text-xl font-bold text-white">{assessmentDueCount}<span className="text-sm font-normal ml-1">件</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1f2f3d] to-[#15202a] rounded-lg p-4 border border-[#2a3441] transform hover:scale-105 transition-transform duration-200 lg:col-span-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium">総利用者数</p>
                    <p className="text-xl font-bold text-white">{dashboardData.current_user_count}<span className="text-sm font-normal ml-1">名</span></p>
                    {/* フィルタリング時は検索結果数も表示 */}
                    {dashboardData.filtered_count !== undefined && dashboardData.filtered_count !== dashboardData.current_user_count && (
                      <p className="text-sm text-[#00bcd4] mt-1">
                        検索結果: <span className="font-semibold">{dashboardData.filtered_count}名</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* {canEdit && (
                      <button
                        type="button"
                        data-testid="add-recipient-stats-button"
                        aria-label="新規利用者を追加"
                        onClick={() => router.push('/recipients/new')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            router.push('/recipients/new');
                          }
                        }}
                        className="bg-[#10b981] hover:bg-[#0f9f6e] text-white px-2 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 hidden md:flex items-center gap-1"
                      >
                        <BiUserPlus className="h-3.5 w-3.5" />
                        <span className="lg:hidden">追加</span>
                      </button>
                    )} */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="検索"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="bg-[#0f1419] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 w-48 focus:outline-none focus:border-[#00bcd4]"
                      />
                      <span className="absolute right-3 top-2.5 text-[#00bcd4] text-sm">🔍</span>
                    </div>
                  </div>
                </div>
                {canEdit && (
                  <div className="md:hidden mt-4">
                    <button
                      type="button"
                      data-testid="add-recipient-stats-button"
                      aria-label="新規利用者を追加"
                      onClick={() => router.push('/recipients/new')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          router.push('/recipients/new');
                        }
                      }}
                      className="bg-[#10b981] hover:bg-[#0f9f6e] font-bold text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 w-full flex items-center justify-center gap-2"
                    >
                      <BiUserPlus className="h-4 w-4" />
                      <span>利用者追加</span>
                    </button>
                  </div>
                )}
              </div>



            </div>

            {/* 選択中のフィルター条件を表示 */}
            <ActiveFilters
              activeFilters={activeFilters}
              searchTerm={searchTerm}
              onFilterRemove={handleFilterRemove}
              onClearAll={handleClearAllFilters}
            />

            <TableLoadingOverlay isLoading={isLoading}>
              <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] shadow-xl animate-in slide-in-from-bottom-4 duration-400 delay-300">
                <div className="px-6 py-4 border-b border-[#2a3441]">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">利用者一覧</h2>
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <button
                          type="button"
                          data-testid="add-recipient-table-button"
                          aria-label="新規利用者を追加"
                          title="利用者追加"
                          onClick={() => router.push('/recipients/new')}
                          className="bg-[#10b981] hover:bg-[#0f9f6e] text-white p-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                          <BiUserPlus className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        type="button"
                        data-testid="pdf-list-button"
                        aria-label="PDF一覧を表示"
                        title="PDF一覧"
                        onClick={() => router.push('/pdf-list')}
                        className="bg-[#6366f1] hover:bg-[#4f46e5] text-white p-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center"
                      >
                        <BiFile className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleResetDisplay}
                        aria-label="表示リセット"
                        title="表示リセット"
                        className="bg-gray-500 hover:bg-[#4b5563] text-white p-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center"
                      >
                        <MdRefresh className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0f1419cc]">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-[15%]">
                          <div className="flex items-center gap-2">
                            次回更新日
                            <BiSort
                              className="text-gray-100 hover:text-gray-300 cursor-pointer"
                              size={16}
                              onClick={handleNextRenewalSortClick}
                            />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-1/4">
                          <div className="flex items-center gap-2">
                            氏名
                            <BiSort
                              className="text-gray-100 hover:text-gray-300 cursor-pointer"
                              size={16}
                              onClick={handleNameSortClick}
                            />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-1/4">
                          <SmartDropdown
                            trigger={
                              <div className="flex items-center gap-2 cursor-pointer">
                                計画の進捗
                                <BiFilterAlt
                                  className="text-gray-100 hover:text-gray-300 cursor-pointer"
                                  size={16}
                                />
                              </div>
                            }
                          >
                            <DropdownMenuItem onClick={() => handleStatusFilter('assessment')}>
                              <span className={getStepBadgeStyle('assessment')}>アセスメント</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusFilter('draft_plan')}>
                              <span className={getStepBadgeStyle('draft_plan')}>個別原案</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusFilter('staff_meeting')}>
                              <span className={getStepBadgeStyle('staff_meeting')}>担当者会議</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusFilter('monitoring')}>
                              <span className={getStepBadgeStyle('monitoring')}>モニタリング</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusFilter('final_plan_signed')}>
                              <span className={getStepBadgeStyle('final_plan_signed')}>個別本署名済</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusFilter(null)}>
                              <span className="text-gray-400">フィルターをクリア</span>
                            </DropdownMenuItem>
                          </SmartDropdown>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-[15%]">
                          アセスメント開始期限
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-300 w-1/5">
                          詳細なアクション
                        </th>
                      </tr>
                    </thead>
                    <tbody className="min-h-[400px]">
                      {serviceRecipients.map((recipient, index) => (
                        <tr 
                          key={recipient.id} 
                          className={`border-b border-[#2a3441] hover:bg-[#2a3f5f40] transition-colors duration-150 ${
                            index % 2 === 1 ? 'bg-[#1a1f2e20]' : 'bg-transparent'
                          }`}
                        >
                          <td className="px-4 py-4">
                            <div className="text-white text-sm">
                              {recipient.next_renewal_deadline ? new Date(recipient.next_renewal_deadline).toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '/') : '-'}
                            </div>
                            <div className={`text-xs mt-1 ${getDaysRemainingColor(getDaysRemaining(recipient.next_renewal_deadline))}`}>
                              {recipient.latest_step && recipient.next_renewal_deadline ? (
                                getDaysRemaining(recipient.next_renewal_deadline) < 0
                                  ? `期限切れ ${Math.abs(getDaysRemaining(recipient.next_renewal_deadline))}日`
                                  : `残り${getDaysRemaining(recipient.next_renewal_deadline)}日`
                              ) : '-'}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {canEdit ? (
                              <Link href={`/recipients/${recipient.id}`} className="block">
                                <div className="cursor-pointer hover:underline">
                                  <div className="text-white font-bold text-base">
                                    {recipient.full_name}
                                  </div>
                                  <div className="text-gray-200 text-xs mt-1">{recipient.furigana}</div>
                                </div>
                              </Link>
                            ) : (
                              <div>
                                <div className="text-white font-bold text-base">
                                  {recipient.last_name}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-col items-start gap-1">
                              <div className="text-gray-300 text-sm">第{recipient.current_cycle_number}回</div>
                              <div className="text-xs text-gray-300">next</div>
                              <span className={getStepBadgeStyle(recipient.latest_step)}>
                                {getStepText(recipient.latest_step)}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {recipient.next_plan_start_days_remaining !== null && recipient.next_plan_start_days_remaining !== undefined ? (
                              <div className={`text-sm ${
                                recipient.next_plan_start_days_remaining < 0
                                  ? 'text-red-400'
                                  : recipient.next_plan_start_days_remaining <= 3
                                    ? 'text-orange-400'
                                    : 'text-gray-300'
                              }`}>
                                {recipient.next_plan_start_days_remaining < 0
                                  ? `期限切れ ${Math.abs(recipient.next_plan_start_days_remaining)}日`
                                  : `残り${recipient.next_plan_start_days_remaining}日`
                                }
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm">-</div>
                            )}
                          </td>
                          
                          <td className="px-4 py-4 text-right">
                            {canEdit ? (
                              <div className="flex justify-end items-center gap-3">
                                {/* アセスメント */}
                                <Link href={`/recipients/${recipient.id}`}>
                                  <div className="relative group">
                                    <button
                                      type="button"
                                      aria-label="アセスメント"
                                      className="p-2 text-gray-400 hover:bg-gray-700 rounded-md transition-colors"
                                    >
                                      <FaClipboardList className="w-5 h-5" />
                                    </button>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                      アセスメント
                                    </div>
                                  </div>
                                </Link>

                                {/* 個別支援計画 */}
                                <Link href={`/support_plan/${recipient.id}`}>
                                  <div className="relative group">
                                    <button
                                      type="button"
                                      aria-label="個別支援計画"
                                      className="p-2 text-gray-400 hover:bg-gray-700 rounded-md transition-colors"
                                    >
                                      <FaFileAlt className="w-5 h-5" />
                                    </button>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                      個別支援計画
                                    </div>
                                  </div>
                                </Link>

                                {/* 編集 */}
                                <Link href={`/recipients/${recipient.id}/edit`}>
                                  <div className="relative group">
                                    <button
                                      type="button"
                                      data-testid={`edit-recipient-${recipient.id}`}
                                      aria-label={`${recipient.full_name}の情報を編集`}
                                      className="p-2 text-green-400 hover:text-green-600 rounded-md transition-colors"
                                    >
                                      <FaEdit className="w-5 h-5" />
                                    </button>
                                  </div>
                                </Link>

                                {/* 削除 */}
                                <div className="relative group">
                                  <button
                                    type="button"
                                    data-testid={`delete-recipient-${recipient.id}`}
                                    aria-label={`${recipient.full_name}を削除`}
                                    onClick={() => handleDeleteRecipient(recipient.id, recipient.full_name)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleDeleteRecipient(recipient.id, recipient.full_name);
                                      }
                                    }}
                                    className="p-2 text-red-600 hover:text-red-800 rounded-md transition-colors"
                                  >
                                    <FaTrash className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm">-</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden">
                  {serviceRecipients.map((recipient) => (
                    <div 
                      key={recipient.id} 
                      className={`border-b border-[#2a3441] p-4 hover:bg-[#2a3f5f40] transition-colors duration-150`}
                    >
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-300 text-xs mb-1">次回更新日</div>
                            <div className="text-white">
                              {recipient.next_renewal_deadline ? new Date(recipient.next_renewal_deadline).toLocaleDateString('ja-JP', {month: '2-digit', day: '2-digit'}) : '-'}
                            </div>
                            <div className={`text-xs ${getDaysRemainingColor(getDaysRemaining(recipient.next_renewal_deadline))}`}>
                              {recipient.latest_step && recipient.next_renewal_deadline ? (
                                getDaysRemaining(recipient.next_renewal_deadline) < 0
                                  ? `期限切れ ${Math.abs(getDaysRemaining(recipient.next_renewal_deadline))}日`
                                  : `残り${getDaysRemaining(recipient.next_renewal_deadline)}日`
                              ) : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-300 text-xs mb-1">アセスメント開始期限</div>
                            {recipient.next_plan_start_days_remaining !== null && recipient.next_plan_start_days_remaining !== undefined ? (
                              <div className={`text-sm ${
                                recipient.next_plan_start_days_remaining < 0
                                  ? 'text-red-400'
                                  : recipient.next_plan_start_days_remaining <= 3
                                    ? 'text-orange-400'
                                    : 'text-white'
                              }`}>
                                {recipient.next_plan_start_days_remaining < 0
                                  ? `期限切れ ${Math.abs(recipient.next_plan_start_days_remaining)}日`
                                  : `残り${recipient.next_plan_start_days_remaining}日`
                                }
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm">-</div>
                            )}
                          </div>
                        </div>

                        {canEdit ? (
                          <Link href={`/recipients/${recipient.id}`}>
                            <div>
                              <div className="text-white font-bold text-base">
                                {recipient.full_name}
                              </div>
                              <div className="text-gray-200 text-xs">{recipient.furigana}</div>
                            </div>
                          </Link>
                        ) : (
                          <div>
                            <div className="text-white font-bold text-base">
                              {recipient.last_name}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">第{recipient.current_cycle_number}回</span>
                          <div className="text-right">
                            <div className="text-xs text-gray-3000">next</div>
                            <span className={getStepBadgeStyle(recipient.latest_step)}>
                              {getStepText(recipient.latest_step)}
                            </span>
                          </div>
                        </div>

                        {canEdit ? (
                          <div className="flex justify-center items-center gap-3">
                            {/* アセスメント */}
                            <button
                              type="button"
                              title="アセスメント"
                              aria-label="アセスメント"
                              onClick={() => router.push(`/recipients/${recipient.id}`)}
                              className="p-3 text-gray-400 hover:bg-gray-700 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                              <FaClipboardList className="w-6 h-6" />
                            </button>

                            {/* 個別支援計画 */}
                            <button
                              type="button"
                              title="個別支援計画"
                              aria-label="個別支援計画"
                              onClick={() => router.push(`/support_plan/${recipient.id}`)}
                              className="p-3 text-gray-400 hover:bg-gray-700 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                              <FaFileAlt className="w-6 h-6" />
                            </button>

                            {/* 編集 */}
                            <button
                              type="button"
                              data-testid={`edit-recipient-mobile-${recipient.id}`}
                              title="編集"
                              aria-label={`${recipient.full_name}の情報を編集`}
                              onClick={() => router.push(`/recipients/${recipient.id}/edit`)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  router.push(`/recipients/${recipient.id}/edit`);
                                }
                              }}
                              className="p-3 text-gray-600 hover:text-gray-800 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                              <FaEdit className="w-6 h-6" />
                            </button>

                            {/* 削除 */}
                            <button
                              type="button"
                              data-testid={`delete-recipient-mobile-${recipient.id}`}
                              title="削除"
                              aria-label={`${recipient.full_name}を削除`}
                              onClick={() => handleDeleteRecipient(recipient.id, recipient.full_name)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleDeleteRecipient(recipient.id, recipient.full_name);
                                }
                              }}
                              className="p-3 text-red-600 hover:text-red-800 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                              <FaTrash className="w-6 h-6" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 text-sm py-4">-</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TableLoadingOverlay>
          </>
      </main>

      {/* Employee Action Request Modal */}
      {pendingDeleteRequest && (
        <EmployeeActionRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false);
            setPendingDeleteRequest(null);
          }}
          onSuccess={handleRequestSuccess}
          actionType={ActionType.DELETE}
          resourceType={ResourceType.WELFARE_RECIPIENT}
          resourceId={pendingDeleteRequest.recipientId}
          requestData={{
            recipient_name: pendingDeleteRequest.recipientName,
          }}
          actionDescription={`利用者「${pendingDeleteRequest.recipientName}」を削除`}
        />
      )}
    </div>
  );
}