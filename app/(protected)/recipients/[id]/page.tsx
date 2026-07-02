'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { welfareRecipientsApi, type WelfareRecipient } from '@/lib/welfare-recipients';
import { assessmentApi, type AssessmentData } from '@/lib/assessment';
import { authApi } from '@/lib/auth';
import { PencilIcon, TrashIcon, ArrowLeftIcon, ExclamationCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { StaffResponse } from '@/types/staff';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Tabs from '@/components/ui/Tabs';
import BasicInfoSection from '@/components/protected/recipients/BasicInfoSection';
import EmploymentSection from '@/components/protected/recipients/EmploymentSection';

// UI設計意図: 利用者詳細は確認作業が中心のため、氏名・ふりがな・操作ボタンを大きくし、読み間違いと押し間違いを減らす。
// 変更概要: 見出し/本文/ボタンをtext-base以上にし、編集・削除などの操作領域は44px以上を確保した。
export default function RecipientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [recipient, setRecipient] = useState<WelfareRecipient | null>(null);
  const [currentUser, setCurrentUser] = useState<StaffResponse | null>(null);
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(true);

  const isLoading = isLoadingRecipient || isLoadingUser;

  useEffect(() => {
    const fetchRecipientDetails = async () => {
      setIsLoadingRecipient(true);
      setError(null);
      try {
        const data = await welfareRecipientsApi.get(resolvedParams.id);
        setRecipient(data);
      } catch {
        console.error('Operation failed');
        setError('利用者情報の取得に失敗しました。');
      } finally {
        setIsLoadingRecipient(false);
      }
    };

    const fetchCurrentUser = async () => {
      setIsLoadingUser(true);
      try {
        const userData = await authApi.getCurrentUser();
        setCurrentUser(userData);
      } catch {
        console.error('Operation failed');
      } finally {
        setIsLoadingUser(false);
      }
    };

    const fetchAssessmentData = async () => {
      setIsLoadingAssessment(true);
      try {
        const data = await assessmentApi.getAll(resolvedParams.id);
        setAssessmentData(data);
      } catch {
        console.error('Operation failed');
        // アセスメントデータがない場合は空のデータを設定
        setAssessmentData({
          family_members: [],
          service_history: [],
          hospital_visits: [],
        });
      } finally {
        setIsLoadingAssessment(false);
      }
    };

    fetchRecipientDetails();
    fetchCurrentUser();
    fetchAssessmentData();
  }, [resolvedParams.id]);

  const handleRefreshAssessment = async () => {
    try {
      const data = await assessmentApi.getAll(resolvedParams.id);
      setAssessmentData(data);
    } catch {
      console.error('Operation failed');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await welfareRecipientsApi.delete(resolvedParams.id);
      router.push('/dashboard?message=' + encodeURIComponent('利用者を削除しました。'));
    } catch {
      console.error('Operation failed');
      setError('利用者の削除に失敗しました。');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };


  const canEditOrDelete = () => {
    if (!currentUser) {
      return false;
    }
    const canEdit = ['manager', 'owner'].includes(currentUser.role);
    return canEdit;
  };

  const isEmployee = () => {
    if (!currentUser) {
      return false;
    }
    const employeeCheck = currentUser.role === 'employee';
    return employeeCheck;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 lg:p-8 dark:bg-gradient-to-b dark:from-[#0f1419] dark:to-[#1a2332]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-300 p-8 text-center shadow-sm dark:bg-[#0f1419cc] dark:border-[#2a3441]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10b981]"></div>
            <p className="mt-4 text-base font-semibold text-slate-700 dark:text-gray-100">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipient) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 lg:p-8 dark:bg-gradient-to-b dark:from-[#0f1419] dark:to-[#1a2332]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-300 p-8 text-center shadow-sm dark:bg-[#0f1419cc] dark:border-[#2a3441]">
            <ExclamationCircleIcon className="w-12 h-12 mx-auto text-red-400 mb-4" />
            <p className="text-base font-semibold text-red-400">{error || 'エラーが発生しました。'}</p>
            <Link
              href="/recipients"
              className="inline-block mt-4 min-h-[44px] px-4 py-2 bg-slate-600 hover:bg-slate-700 text-base font-semibold text-white rounded-lg transition-colors dark:bg-[#2a3441] dark:hover:bg-[#3a4451]"
            >
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-8 dark:bg-gradient-to-b dark:from-[#0f1419] dark:to-[#1a2332]">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: '利用者一覧', href: '/recipients' },
          { label: recipient ? `${recipient.last_name} ${recipient.first_name}` : '利用者詳細', current: true }
        ]} />
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-300 p-6 mb-6 shadow-sm dark:bg-[#0f1419cc] dark:border-[#2a3441]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Link
                href="/recipients"
                className="p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-200 rounded-lg transition-colors dark:text-gray-100 dark:hover:text-white dark:hover:bg-[#2a3441]"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
                  {recipient.last_name} {recipient.first_name}
                </h1>
                <p className="text-slate-600 text-base font-semibold mt-1 dark:text-gray-100">
                  {recipient.last_name_furigana} {recipient.first_name_furigana}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">

              {!isLoadingUser && currentUser && canEditOrDelete() && (
                <>
                  <Link
                    href={`/recipients/${resolvedParams.id}/edit`}
                    className="flex min-h-[44px] items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-base font-semibold text-white rounded-lg transition-colors dark:bg-[#2a3441] dark:hover:bg-[#3a4451]"
                  >
                    <PencilIcon className="w-4 h-4" />
                    編集
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex min-h-[44px] items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-base font-semibold text-red-400 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    削除
                  </button>
                </>
              )}

              {!isLoadingUser && currentUser && isEmployee() && (
                <>
                  <button
                    className="flex min-h-[44px] items-center gap-2 px-4 py-2 bg-slate-200 text-base font-semibold text-slate-500 rounded-lg cursor-default dark:bg-[#2a3441]/50 dark:text-gray-100"
                    disabled
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    編集申請
                  </button>
                  <button
                    className="flex min-h-[44px] items-center gap-2 px-4 py-2 bg-red-600/10 text-base font-semibold text-red-600/50 rounded-lg cursor-default"
                    disabled
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    削除申請
                  </button>
                </>
              )}

              {isLoadingUser && (
                <div className="text-base font-semibold text-gray-500">
                  ユーザー情報読み込み中...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* アセスメント情報タブ */}
        {!isLoadingAssessment && assessmentData && (
          <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-sm dark:bg-[#0f1419cc] dark:border-[#2a3441]">
            <h2 className="text-2xl font-semibold text-slate-950 mb-6 dark:text-white">アセスメント情報</h2>
            <Tabs
              tabs={[
                {
                  id: 'basic',
                  label: '基本情報',
                  content: (
                    <BasicInfoSection
                      recipient={recipient}
                      recipientId={resolvedParams.id}
                      familyMembers={assessmentData.family_members}
                      serviceHistory={assessmentData.service_history}
                      medicalInfo={assessmentData.medical_info}
                      hospitalVisits={assessmentData.hospital_visits}
                      onRefresh={handleRefreshAssessment}
                    />
                  ),
                },
                {
                  id: 'employment',
                  label: '就労関係',
                  content: (
                    <EmploymentSection
                      recipientId={resolvedParams.id}
                      employment={assessmentData.employment}
                      onRefresh={handleRefreshAssessment}
                    />
                  ),
                }
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded-lg p-6 max-w-md w-full shadow-xl dark:bg-[#0f1419] dark:border-[#2a3441]">
            <h3 className="text-xl font-semibold text-slate-950 mb-2 dark:text-white">削除確認</h3>
            <p className="text-base font-semibold text-slate-700 mb-6 dark:text-gray-100">
              本当にこの利用者を削除してもよろしいですか？この操作は元に戻せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="min-h-[44px] px-4 py-2 text-base font-semibold text-slate-600 hover:text-slate-950 transition-colors dark:text-gray-100 dark:hover:text-white"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="min-h-[44px] px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-base font-semibold text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isDeleting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                )}
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
