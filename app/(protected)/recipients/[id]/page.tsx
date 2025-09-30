'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { welfareRecipientsApi, type WelfareRecipient } from '@/lib/welfare-recipients';
import { authApi } from '@/lib/auth';
import { PencilIcon, TrashIcon, ArrowLeftIcon, PhoneIcon, MapPinIcon, ExclamationCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import type { StaffResponse } from '@/types/staff';
import Breadcrumb from '@/components/ui/Breadcrumb';

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

    fetchRecipientDetails();
    fetchCurrentUser();
  }, [resolvedParams.id]);

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

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return '男性';
      case 'female': return '女性';
      default: return 'その他';
    }
  };

  const getResidenceLabel = (residence: string) => {
    const labels: Record<string, string> = {
      'home_with_family': '家族と同居',
      'home_alone': '一人暮らし',
      'group_home': 'グループホーム',
      'institution': '施設入所',
      'hospital': '入院',
      'other': 'その他',
    };
    return labels[residence] || residence;
  };

  const getTransportationLabel = (transportation: string) => {
    const labels: Record<string, string> = {
      'walk': '徒歩',
      'bicycle': '自転車',
      'motorbike': '原付・バイク',
      'car_self': '自家用車',
      'car_transport': '送迎車など',
      'public_transport': '公共交通機関',
      'welfare_transport': '福祉輸送',
      'other': 'その他',
    };
    return labels[transportation] || transportation;
  };

  const getLivelihoodProtectionLabel = (protection: string) => {
    const labels: Record<string, string> = {
      'not_receiving': '受給していない',
      'receiving_with_allowance': '受給（手当あり）',
      'receiving_without_allowance': '受給（手当なし）',
      'applying': '申請中',
      'planning': '申請予定',
    };
    return labels[protection] || protection;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'physical_handbook': '身体障害者手帳',
      'intellectual_handbook': '療育手帳',
      'mental_health_handbook': '精神障害者保健福祉手帳',
      'disability_basic_pension': '障害基礎年金',
      'other_disability_pension': 'その他の障害年金',
      'public_assistance': '生活保護',
    };
    return labels[category] || category;
  };

  const getApplicationStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'acquired': '取得済み',
      'applying': '申請中',
      'planning': '申請予定',
      'not_applicable': '該当なし',
    };
    return labels[status] || status;
  };

  const getPhysicalDisabilityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'visual': '視覚障害',
      'hearing': '聴覚障害',
      'limb': '肢体不自由',
      'internal': '内部障害',
      'other': 'その他',
    };
    return labels[type] || type;
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
            <p className="mt-4 text-gray-400">読み込み中...</p>
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
                className="p-2 text-gray-400 hover:text-white hover:bg-[#2a3441] rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {recipient.last_name} {recipient.first_name}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {recipient.last_name_furigana} {recipient.first_name_furigana}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {/* Debug info */}
              <div className="text-xs text-gray-500 mr-2">
                <div>User: {currentUser ? 'Loaded' : 'Loading...'}</div>
                <div>Role: {currentUser?.role || 'N/A'}</div>
                <div>CanEdit: {canEditOrDelete().toString()}</div>
                <div>IsEmployee: {isEmployee().toString()}</div>
              </div>

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
                    className="flex items-center gap-2 px-4 py-2 bg-[#2a3441]/50 text-gray-400 rounded-lg cursor-default"
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

        {/* Basic Information */}
        <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">基本情報</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">生年月日</p>
              <p className="text-white">{formatDate(recipient.birth_day)} （{calculateAge(recipient.birth_day)}歳）</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">性別</p>
              <p className="text-white">{getGenderLabel(recipient.gender)}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {recipient.detail && (
          <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">連絡先</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">住所</p>
                  <p className="text-white">{recipient.detail.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <PhoneIcon className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">電話番号</p>
                  <p className="text-white">{recipient.detail.tel}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">居住形態</p>
                  <p className="text-white">{getResidenceLabel((recipient.detail.formOfResidence || recipient.detail.form_of_residence) as string)}</p>
                  {(recipient.detail.formOfResidenceOtherText || recipient.detail.form_of_residence_other_text) && (
                    <p className="text-gray-400 text-sm mt-1">{recipient.detail.formOfResidenceOtherText || recipient.detail.form_of_residence_other_text}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-400 text-sm">交通手段</p>
                  <p className="text-white">{getTransportationLabel((recipient.detail.meansOfTransportation || recipient.detail.means_of_transportation) as string)}</p>
                  {(recipient.detail.meansOfTransportationOtherText || recipient.detail.means_of_transportation_other_text) && (
                    <p className="text-gray-400 text-sm mt-1">{recipient.detail.meansOfTransportationOtherText || recipient.detail.means_of_transportation_other_text}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        {recipient.detail?.emergency_contacts && recipient.detail.emergency_contacts.length > 0 && (
          <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">緊急連絡先</h2>
            <div className="space-y-4">
              {recipient.detail.emergency_contacts.map((contact) => (
                <div key={contact.id} className="p-4 bg-[#1a2332] rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-medium">
                        {contact.lastName || contact.last_name} {contact.firstName || contact.first_name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {contact.lastNameFurigana || contact.last_name_furigana} {contact.firstNameFurigana || contact.first_name_furigana}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-[#10b981]/20 text-[#10b981] text-xs rounded">
                      優先度 {contact.priority}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">関係: </span>
                      <span className="text-white">{contact.relationship}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">電話: </span>
                      <span className="text-white">{contact.tel}</span>
                    </div>
                    {contact.address && (
                      <div className="md:col-span-2">
                        <span className="text-gray-400">住所: </span>
                        <span className="text-white">{contact.address}</span>
                      </div>
                    )}
                  </div>
                  {contact.notes && (
                    <p className="text-gray-400 text-sm mt-2">備考: {contact.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disability Information */}
        {recipient.disability_status && (
          <div className="bg-[#0f1419cc] rounded-lg border border-[#2a3441] p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">障害・疾患情報</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">障害または疾患名</p>
                <p className="text-white">{recipient.disability_status.disabilityOrDiseaseName || recipient.disability_status.disability_or_disease_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">生活保護受給状況</p>
                <p className="text-white">{getLivelihoodProtectionLabel((recipient.disability_status.livelihoodProtection || recipient.disability_status.livelihood_protection) as string)}</p>
              </div>
              {(recipient.disability_status.specialRemarks || recipient.disability_status.special_remarks) && (
                <div>
                  <p className="text-gray-400 text-sm">特記事項</p>
                  <p className="text-white whitespace-pre-wrap">{recipient.disability_status.specialRemarks || recipient.disability_status.special_remarks}</p>
                </div>
              )}

              {/* Disability Details */}
              {recipient.disability_status.details && recipient.disability_status.details.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">手帳・年金情報</p>
                  <div className="space-y-2">
                    {recipient.disability_status.details.map((detail, index) => (
                      <div key={index} className="p-3 bg-[#1a2332] rounded-lg">
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">カテゴリ: </span>
                            <span className="text-white">{getCategoryLabel(detail.category)}</span>
                          </div>
                          {(detail.gradeOrLevel || detail.grade_or_level) && (
                            <div>
                              <span className="text-gray-400">等級・レベル: </span>
                              <span className="text-white">{detail.gradeOrLevel || detail.grade_or_level}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-400">申請状況: </span>
                            <span className="text-white">{getApplicationStatusLabel((detail.applicationStatus || detail.application_status) as string)}</span>
                          </div>
                          {(detail.physicalDisabilityType || detail.physical_disability_type) && (
                            <div>
                              <span className="text-gray-400">身体障害種別: </span>
                              <span className="text-white">{getPhysicalDisabilityTypeLabel((detail.physicalDisabilityType || detail.physical_disability_type) as string)}</span>
                            </div>
                          )}
                          {(detail.physicalDisabilityTypeOtherText || detail.physical_disability_type_other_text) && (
                            <div className="md:col-span-2">
                              <span className="text-gray-400">その他詳細: </span>
                              <span className="text-white">{detail.physicalDisabilityTypeOtherText || detail.physical_disability_type_other_text}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1419] border border-[#2a3441] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-2">削除確認</h3>
            <p className="text-gray-400 mb-6">
              本当にこの利用者を削除してもよろしいですか？この操作は元に戻せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
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