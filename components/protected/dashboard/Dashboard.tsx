'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

// UI設計意図: 30〜60代の福祉職員向けに、主要情報はtext-base以上、操作はアイコン依存を避けた文字ボタンで表示する。
// 変更概要: 期限・氏名・操作ボタンを拡大し、期限超過/絞り込み/並び替えを文字で判断できるようにした。
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

  const getSortButtonLabel = (targetSortBy: string) => {
    if (sortBy !== targetSortBy) return '昇順';
    return sortOrder === 'asc' ? '降順' : '昇順';
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
  }, [searchTerm, sortOrder, sortBy]);

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
    const baseStyle = 'inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold';
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
      // 期限超過処理
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
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 animate-in fade-in-0 slide-in-from-bottom-5 duration-300 dark:bg-gradient-to-br dark:from-[#1a1f2e] dark:to-[#0f1419] dark:text-white">
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
            <p className="text-red-300 text-base mt-2">
              新規作成・編集・削除などの操作はご利用いただけません。オーナーの方は管理者設定のプラン登録ページから課金登録を行ってください。
            </p>
          </div>
        )}
        <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-950 dark:text-white">利用者ダッシュボード</h1>
                <div className="text-slate-600 text-md dark:text-gray-300">
                  {getCurrentDate()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-4 mb-6 animate-in slide-in-from-top-4 duration-400 delay-150">
              <div className="rounded-lg p-4 border border-orange-300 bg-orange-50 shadow-sm transition-colors duration-200 lg:col-span-2 dark:border-[#2a3441] dark:bg-gradient-to-br dark:from-[#3d1f1f] dark:to-[#2a1515]">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 bg-[#ff9800]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[#ff9800] text-base">⚠️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-950 text-base font-semibold dark:text-white" title="次回更新期限が過ぎた利用者">計画期限超過</p>
                    <p className="text-2xl md:text-3xl font-bold text-slate-950 dark:text-white">{expiredCount}<span className="text-base font-normal ml-1">件</span></p>
                  </div>
                  <button
                    type="button"
                    className={`min-h-[40px] rounded-md border px-3 py-1.5 text-base font-semibold transition-colors ${
                      activeFilters.isOverdue
                        ? 'border-orange-600 bg-orange-100 text-orange-900 dark:border-[#ffab40] dark:bg-[#ff9800]/20 dark:text-[#ffab40]'
                        : 'border-orange-400 text-orange-800 hover:bg-orange-100 dark:border-[#ff9800]/50 dark:text-[#ff9800] dark:hover:bg-[#ff9800]/10'
                    }`}
                    onClick={() => handleFilterToggle('isOverdue', !activeFilters.isOverdue)}
                    title={activeFilters.isOverdue ? "フィルター解除" : "計画期限超過でフィルター"}
                    aria-pressed={activeFilters.isOverdue}
                  >
                    {activeFilters.isOverdue ? '解除' : '絞り込み'}
                  </button>
                </div>
              </div>

              <div className="rounded-lg p-4 border border-yellow-300 bg-yellow-50 shadow-sm transition-colors duration-200 lg:col-span-2 dark:border-[#2a3441] dark:bg-gradient-to-br dark:from-[#3d3d1f] dark:to-[#2a2a15]">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 bg-[#ffd700]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[#ffd700] text-base">📋</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-950 text-base font-semibold dark:text-white" title="次回更新期限まで30日以内の利用者">計画期限間近（30日以内）</p>
                    <p className="text-2xl md:text-3xl font-bold text-slate-950 dark:text-white">{nearDeadlineCount}<span className="text-base font-normal ml-1">件</span></p>
                  </div>
                  <button
                    type="button"
                    className={`min-h-[40px] rounded-md border px-3 py-1.5 text-base font-semibold transition-colors ${
                      activeFilters.isUpcoming
                        ? 'border-yellow-600 bg-yellow-100 text-yellow-900 dark:border-[#ffed4e] dark:bg-[#ffd700]/20 dark:text-[#ffed4e]'
                        : 'border-yellow-500 text-yellow-800 hover:bg-yellow-100 dark:border-[#ffd700]/50 dark:text-[#ffd700] dark:hover:bg-[#ffd700]/10'
                    }`}
                    onClick={() => handleFilterToggle('isUpcoming', !activeFilters.isUpcoming)}
                    title={activeFilters.isUpcoming ? "フィルター解除" : "計画期限間近でフィルター"}
                    aria-pressed={activeFilters.isUpcoming}
                  >
                    {activeFilters.isUpcoming ? '解除' : '絞り込み'}
                  </button>
                </div>
              </div>

              {/* アセスメント開始期限フィルター */}
              <div className="rounded-lg p-4 border border-cyan-300 bg-cyan-50 shadow-sm transition-colors duration-200 lg:col-span-2 dark:border-[#2a3441] dark:bg-gradient-to-br dark:from-[#1f2f3d] dark:to-[#15202a]">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 bg-[#00bcd4]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[#00bcd4] text-base">📝</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-950 text-base font-semibold dark:text-white" title="is_latest_statusがアセスメントの利用者">アセスメント未完了</p>
                    <p className="text-2xl md:text-3xl font-bold text-slate-950 dark:text-white">{assessmentDueCount}<span className="text-base font-normal ml-1">件</span></p>
                  </div>
                  <button
                    type="button"
                    className={`min-h-[40px] rounded-md border px-3 py-1.5 text-base font-semibold transition-colors ${
                      activeFilters.hasAssessmentDue
                        ? 'border-cyan-600 bg-cyan-100 text-cyan-900 dark:border-[#4dd0e1] dark:bg-[#00bcd4]/20 dark:text-[#4dd0e1]'
                        : 'border-cyan-500 text-cyan-800 hover:bg-cyan-100 dark:border-[#00bcd4]/50 dark:text-[#00bcd4] dark:hover:bg-[#00bcd4]/10'
                    }`}
                    onClick={() => handleFilterToggle('hasAssessmentDue', !activeFilters.hasAssessmentDue)}
                    title={activeFilters.hasAssessmentDue ? "フィルター解除" : "アセスメント未完了でフィルター"}
                    aria-pressed={activeFilters.hasAssessmentDue}
                  >
                    {activeFilters.hasAssessmentDue ? '解除' : '絞り込み'}
                  </button>
                </div>
              </div>

              <div className="rounded-lg p-4 border border-slate-300 bg-white shadow-sm transition-colors duration-200 lg:col-span-3 dark:border-[#2a3441] dark:bg-gradient-to-br dark:from-[#1f2f3d] dark:to-[#15202a]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-950 text-base font-semibold dark:text-white">総利用者数</p>
                    <p className="text-2xl md:text-3xl font-bold text-slate-950 dark:text-white">{dashboardData.current_user_count}<span className="text-base font-normal ml-1">名</span></p>
                    {/* フィルタリング時は検索結果数も表示 */}
                    {dashboardData.filtered_count !== undefined && dashboardData.filtered_count !== dashboardData.current_user_count && (
                      <p className="text-base text-cyan-700 mt-1 dark:text-[#00bcd4]">
                        検索結果: <span className="font-semibold">{dashboardData.filtered_count}名</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="氏名・ふりがなで検索"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="bg-white border border-slate-400 rounded-lg px-4 pr-10 py-2 text-base text-slate-900 placeholder-slate-500 w-full md:w-72 min-h-[44px] focus:outline-none focus:border-cyan-600 dark:bg-[#0f1419] dark:border-[#2a3441] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#00bcd4]"
                      />
                      <span className="absolute right-3 top-2.5 text-cyan-700 text-base dark:text-[#00bcd4]">🔍</span>
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
                      className="bg-[#10b981] hover:bg-[#0f9f6e] text-white px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200 w-full min-h-[44px] flex items-center justify-center gap-2"
                    >
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
              <div className="bg-white rounded-lg border border-slate-300 shadow-xl animate-in slide-in-from-bottom-4 duration-400 delay-300 dark:bg-[#0f1419cc] dark:border-[#2a3441]">
                <div className="px-6 py-4 border-b border-slate-300 dark:border-[#2a3441]">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-950 dark:text-white">利用者一覧</h2>
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <button
                          type="button"
                          data-testid="add-recipient-table-button"
                          aria-label="新規利用者を追加"
                          title="利用者追加"
                          onClick={() => router.push('/recipients/new')}
                          className="bg-[#10b981] hover:bg-[#0f9f6e] text-white min-h-[44px] px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200 flex items-center justify-center"
                        >
                          利用者追加
                        </button>
                      )}
                      <button
                        type="button"
                        data-testid="pdf-list-button"
                        aria-label="PDF一覧を表示"
                        title="PDF一覧"
                        onClick={() => router.push('/pdf-list')}
                        className="bg-[#6366f1] hover:bg-[#4f46e5] text-white min-h-[44px] px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200 flex items-center justify-center"
                      >
                        PDF一覧
                      </button>
                      <button
                        onClick={handleResetDisplay}
                        aria-label="表示リセット"
                        title="表示リセット"
                        className="bg-slate-600 hover:bg-slate-700 text-white min-h-[44px] px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200 flex items-center justify-center dark:bg-gray-500 dark:hover:bg-[#4b5563]"
                      >
                        表示リセット
                      </button>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-[#0f1419cc]">
                      <tr>
                        <th className="px-4 py-3 text-left text-base font-semibold text-slate-700 w-[15%] dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            次回更新日
                            <button
                              type="button"
                              aria-label={`次回更新日を${getSortButtonLabel('next_renewal_deadline')}で並び替え`}
                              className="rounded border border-slate-400 px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:border-gray-500 dark:text-gray-100 dark:hover:bg-gray-700"
                              onClick={handleNextRenewalSortClick}
                            >
                              {getSortButtonLabel('next_renewal_deadline')}
                            </button>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-base font-semibold text-slate-700 w-1/4 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            氏名
                            <button
                              type="button"
                              aria-label={`氏名を${getSortButtonLabel('name_phonetic')}で並び替え`}
                              className="rounded border border-slate-400 px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:border-gray-500 dark:text-gray-100 dark:hover:bg-gray-700"
                              onClick={handleNameSortClick}
                            >
                              {getSortButtonLabel('name_phonetic')}
                            </button>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-base font-semibold text-slate-700 w-1/4 dark:text-gray-300">
                          <SmartDropdown
                            trigger={
                              <button
                                type="button"
                                className="flex items-center gap-2 rounded border border-slate-400 px-2 py-1 text-base font-semibold text-slate-700 hover:bg-slate-200 dark:border-gray-500 dark:text-gray-100 dark:hover:bg-gray-700"
                              >
                                計画の進捗で絞り込み
                              </button>
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
                              <span className="text-slate-600 dark:text-gray-400">フィルターをクリア</span>
                            </DropdownMenuItem>
                          </SmartDropdown>
                        </th>
                        <th className="px-4 py-3 text-left text-base font-semibold text-slate-700 w-[15%] dark:text-gray-300">
                          アセスメント開始期限
                        </th>
                        <th className="px-4 py-3 text-left text-base font-semibold text-slate-700 w-[22%] min-w-[260px] dark:text-gray-300">
                          利用者情報の変更
                        </th>
                      </tr>
                    </thead>
                    <tbody className="min-h-[400px]">
                      {serviceRecipients.map((recipient, index) => (
                        <tr 
                          key={recipient.id} 
                          className={`border-b border-slate-200 hover:bg-slate-100 transition-colors duration-150 dark:border-[#2a3441] dark:hover:bg-[#2a3f5f40] ${
                            index % 2 === 1 ? 'bg-slate-50 dark:bg-[#1a1f2e20]' : 'bg-transparent'
                          }`}
                        >
                          <td className="px-4 py-4">
                            <div className="text-slate-900 text-base font-medium dark:text-white">
                              {recipient.next_renewal_deadline ? new Date(recipient.next_renewal_deadline).toLocaleDateString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '/') : '-'}
                            </div>
                            <div className={`text-base font-semibold mt-1 ${getDaysRemainingColor(getDaysRemaining(recipient.next_renewal_deadline))}`}>
                              {recipient.latest_step && recipient.next_renewal_deadline ? (
                                getDaysRemaining(recipient.next_renewal_deadline) < 0
                                  ? `期限超過 ${Math.abs(getDaysRemaining(recipient.next_renewal_deadline))}日`
                                  : `残り${getDaysRemaining(recipient.next_renewal_deadline)}日`
                              ) : '-'}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {canEdit ? (
                              <Link href={`/recipients/${recipient.id}`} className="block">
                                <div className="cursor-pointer hover:underline">
                                  <div className="text-slate-950 text-lg md:text-xl font-bold dark:text-white">
                                    {recipient.full_name}
                                  </div>
                                  <div className="text-slate-600 text-sm mt-1 dark:text-gray-300">{recipient.furigana}</div>
                                </div>
                              </Link>
                            ) : (
                              <div>
                                <div className="text-slate-950 text-lg md:text-xl font-bold dark:text-white">
                                  {recipient.last_name}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-col items-start gap-1">
                              <div className="text-slate-700 text-base font-medium dark:text-gray-300">第{recipient.current_cycle_number}回</div>
                              <span className={getStepBadgeStyle(recipient.latest_step)}>
                                {getStepText(recipient.latest_step)}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {recipient.next_plan_start_days_remaining !== null && recipient.next_plan_start_days_remaining !== undefined ? (
                              <div className={`text-base font-semibold ${
                                recipient.next_plan_start_days_remaining < 0
                                  ? 'text-red-400'
                                  : recipient.next_plan_start_days_remaining <= 3
                                    ? 'text-orange-400'
                                    : 'text-slate-700 dark:text-gray-300'
                              }`}>
                                {recipient.next_plan_start_days_remaining < 0
                                  ? `期限超過 ${Math.abs(recipient.next_plan_start_days_remaining)}日`
                                  : `残り${recipient.next_plan_start_days_remaining}日`
                                }
                              </div>
                            ) : (
                              <div className="text-gray-500 text-base">-</div>
                            )}
                          </td>
                          
                          <td className="px-4 py-4 text-left min-w-[260px]">
                            {canEdit ? (
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-2">
                                  {/* アセスメント */}
                                  <Link
                                    href={`/recipients/${recipient.id}`}
                                    className="min-h-[44px] rounded-md border border-slate-400 px-3 py-2 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-100 inline-flex items-center justify-center text-center whitespace-nowrap dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                                  >
                                    アセスメント
                                  </Link>

                                  {/* 個別支援計画 */}
                                  <Link
                                    href={`/support_plan/${recipient.id}`}
                                    className="min-h-[44px] rounded-md border border-slate-400 px-3 py-2 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-100 inline-flex items-center justify-center text-center whitespace-nowrap dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                                  >
                                    支援計画
                                  </Link>
                                </div>

                                <div className="flex flex-col gap-2">
                                  {/* 編集 */}
                                  <Link
                                    href={`/recipients/${recipient.id}/edit`}
                                    data-testid={`edit-recipient-${recipient.id}`}
                                    aria-label={`${recipient.full_name}の情報を編集`}
                                    className="min-h-[44px] rounded-md border border-green-600/70 px-3 py-2 text-base font-semibold text-green-700 transition-colors hover:bg-green-50 inline-flex items-center justify-center text-center whitespace-nowrap dark:border-green-500/70 dark:text-green-300 dark:hover:bg-green-900/30"
                                  >
                                    編集
                                  </Link>

                                  {/* 削除 */}
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
                                    className="min-h-[44px] rounded-md border border-red-600/70 px-3 py-2 text-base font-semibold text-red-700 transition-colors hover:bg-red-50 whitespace-nowrap dark:border-red-500/70 dark:text-red-300 dark:hover:bg-red-900/30"
                                  >
                                    削除
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-base">-</div>
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
                      className="border-b border-slate-200 p-4 hover:bg-slate-100 transition-colors duration-150 dark:border-[#2a3441] dark:hover:bg-[#2a3f5f40]"
                    >
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-base">
                          <div>
                            <div className="text-slate-700 text-base font-semibold mb-1 dark:text-gray-300">次回更新日</div>
                            <div className="text-slate-900 text-base font-medium dark:text-white">
                              {recipient.next_renewal_deadline ? new Date(recipient.next_renewal_deadline).toLocaleDateString('ja-JP', {month: '2-digit', day: '2-digit'}) : '-'}
                            </div>
                            <div className={`text-base font-semibold ${getDaysRemainingColor(getDaysRemaining(recipient.next_renewal_deadline))}`}>
                              {recipient.latest_step && recipient.next_renewal_deadline ? (
                                getDaysRemaining(recipient.next_renewal_deadline) < 0
                                  ? `期限超過 ${Math.abs(getDaysRemaining(recipient.next_renewal_deadline))}日`
                                  : `残り${getDaysRemaining(recipient.next_renewal_deadline)}日`
                              ) : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-700 text-base font-semibold mb-1 dark:text-gray-300">アセスメント開始期限</div>
                            {recipient.next_plan_start_days_remaining !== null && recipient.next_plan_start_days_remaining !== undefined ? (
                              <div className={`text-base font-semibold ${
                                recipient.next_plan_start_days_remaining < 0
                                  ? 'text-red-400'
                                  : recipient.next_plan_start_days_remaining <= 3
                                    ? 'text-orange-400'
                                    : 'text-slate-900 dark:text-white'
                              }`}>
                                {recipient.next_plan_start_days_remaining < 0
                                  ? `期限超過 ${Math.abs(recipient.next_plan_start_days_remaining)}日`
                                  : `残り${recipient.next_plan_start_days_remaining}日`
                                }
                              </div>
                            ) : (
                              <div className="text-gray-500 text-base">-</div>
                            )}
                          </div>
                        </div>

                        {canEdit ? (
                          <Link href={`/recipients/${recipient.id}`}>
                            <div>
                              <div className="text-slate-950 text-lg font-bold dark:text-white">
                                {recipient.full_name}
                              </div>
                              <div className="text-slate-600 text-sm dark:text-gray-300">{recipient.furigana}</div>
                            </div>
                          </Link>
                        ) : (
                          <div>
                            <div className="text-slate-950 text-lg font-bold dark:text-white">
                              {recipient.last_name}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 text-base font-medium dark:text-gray-300">第{recipient.current_cycle_number}回</span>
                          <div className="text-right">
                            <span className={getStepBadgeStyle(recipient.latest_step)}>
                              {getStepText(recipient.latest_step)}
                            </span>
                          </div>
                        </div>

                        {canEdit ? (
                          <div className="grid grid-cols-2 gap-2">
                            {/* アセスメント */}
                            <button
                              type="button"
                              title="アセスメント"
                              aria-label="アセスメント"
                              onClick={() => router.push(`/recipients/${recipient.id}`)}
                              className="px-3 py-2 text-slate-800 hover:bg-slate-100 rounded-md border border-slate-400 transition-colors min-h-[44px] flex items-center justify-center text-base font-semibold dark:text-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
                            >
                              アセスメント
                            </button>

                            {/* 個別支援計画 */}
                            <button
                              type="button"
                              title="個別支援計画"
                              aria-label="個別支援計画"
                              onClick={() => router.push(`/support_plan/${recipient.id}`)}
                              className="px-3 py-2 text-slate-800 hover:bg-slate-100 rounded-md border border-slate-400 transition-colors min-h-[44px] flex items-center justify-center text-base font-semibold dark:text-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
                            >
                              支援計画
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
                              className="px-3 py-2 text-green-700 hover:bg-green-50 rounded-md border border-green-600/70 transition-colors min-h-[44px] flex items-center justify-center text-base font-semibold dark:text-green-300 dark:hover:bg-green-900/30 dark:border-green-500/70"
                            >
                              編集
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
                              className="px-3 py-2 text-red-700 hover:bg-red-50 rounded-md border border-red-600/70 transition-colors min-h-[44px] flex items-center justify-center text-base font-semibold dark:text-red-300 dark:hover:bg-red-900/30 dark:border-red-500/70"
                            >
                              削除
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 text-base py-4">-</div>
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
