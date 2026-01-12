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
      } catch (err) {
        console.error('Failed to fetch recipient details:', err);
        setError('利用者情報の取得に失敗しました。');
      } finally {
        setIsLoadingRecipient(false);
      }
    };

    const fetchCurrentUser = async () => {
      setIsLoadingUser(true);
      try {
        const userData = await authApi.getCurrentUser();
        console.log('Current user data:', userData);
        console.log('User role:', userData.role);
        setCurrentUser(userData);
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      } finally {
        setIsLoadingUser(false);
      }
    };

    const fetchAssessmentData = async () => {
      setIsLoadingAssessment(true);
      try {
        const data = await assessmentApi.getAll(resolvedParams.id);
        setAssessmentData(data);
      } catch (err) {
        console.error('Failed to fetch assessment data:', err);
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
    } catch (err) {
      console.error('Failed to refresh assessment data:', err);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await welfareRecipientsApi.delete(resolvedParams.id);
      router.push('/dashboard?message=' + encodeURIComponent('利用者を削除しました。'));
    } catch (err) {
      console.error('Failed to delete recipient:', err);
      setError('利用者の削除に失敗しました。');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };


  const canEditOrDelete = () => {
    if (!currentUser) {
      console.log('canEditOrDelete: no currentUser');
      return false;
    }
    const canEdit = ['manager', 'owner'].includes(currentUser.role);
    console.log(`canEditOrDelete: role=${currentUser.role}, canEdit=${canEdit}`);
    return canEdit;
  };

  const isEmployee = () => {
    if (!currentUser) {
      console.log('isEmployee: no currentUser');
      return false;
    }
    const employeeCheck = currentUser.role === 'employee';
    console.log(`isEmployee: role=${currentUser.role}, isEmployee=${employeeCheck}`);
    return employeeCheck;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f1419] to-[#1a2332] p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10b981]"></div>
            <p className="mt-4 text-gray-100">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f1419] to-[#1a2332] p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-8 text-center">
            <ExclamationCircleIcon className="w-12 h-12 mx-auto text-red-400 mb-4" />
            <p className="text-red-400">{error || 'エラーが発生しました。'}</p>
            <Link
              href="/recipients"
              className="inline-block mt-4 px-4 py-2 bg-[#2a3441] hover:bg-[#3a4451] text-white rounded-lg transition-colors"
            >
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1419] to-[#1a2332] p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: '利用者一覧', href: '/recipients' },
          { label: recipient ? `${recipient.last_name} ${recipient.first_name}` : '利用者詳細', current: true }
        ]} />
        {/* Header */}
        <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Link
                href="/recipients"
                className="p-2 text-gray-100 hover:text-white hover:bg-[#2a3441] rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {recipient.last_name} {recipient.first_name}
                </h1>
                <p className="text-gray-100 text-sm mt-1">
                  {recipient.last_name_furigana} {recipient.first_name_furigana}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">

              {!isLoadingUser && currentUser && canEditOrDelete() && (
                <>
                  <Link
                    href={`/recipients/${resolvedParams.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2a3441] hover:bg-[#3a4451] text-white rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    編集
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    削除
                  </button>
                </>
              )}

              {!isLoadingUser && currentUser && isEmployee() && (
                <>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-[#2a3441]/50 text-gray-100 rounded-lg cursor-default"
                    disabled
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    編集申請
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-600/50 rounded-lg cursor-default"
                    disabled
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    削除申請
                  </button>
                </>
              )}

              {isLoadingUser && (
                <div className="text-xs text-gray-500">
                  ユーザー情報読み込み中...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* アセスメント情報タブ */}
        {!isLoadingAssessment && assessmentData && (
          <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-6">
            <h2 className="text-lg font-semibold text-white mb-6">アセスメント情報</h2>
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
          <div className="bg-[#0f1419] border border-[#2a3441] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-2">削除確認</h3>
            <p className="text-gray-100 mb-6">
              本当にこの利用者を削除してもよろしいですか？この操作は元に戻せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-100 hover:text-white transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white rounded-lg transition-colors flex items-center gap-2"
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