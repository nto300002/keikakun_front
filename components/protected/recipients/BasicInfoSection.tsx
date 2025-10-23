'use client';

import { useState } from 'react';
import { PencilIcon, PlusIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import FamilyMemberList from './forms/FamilyMemberList';
import ServiceHistoryList from './forms/ServiceHistoryList';
import MedicalInfoForm from './forms/MedicalInfoForm';
import HospitalVisitList from './forms/HospitalVisitList';
import ExpandableText from '@/components/ui/ExpandableText';
import type { WelfareRecipient } from '@/lib/welfare-recipients';
import type { FamilyMember, ServiceHistory, MedicalInfo, HospitalVisit } from '@/lib/assessment';

interface BasicInfoSectionProps {
  recipient: WelfareRecipient;
  recipientId: string;
  familyMembers: FamilyMember[];
  serviceHistory: ServiceHistory[];
  medicalInfo?: MedicalInfo;
  hospitalVisits: HospitalVisit[];
  onRefresh: () => void;
}

export default function BasicInfoSection({
  recipient,
  recipientId,
  familyMembers,
  serviceHistory,
  medicalInfo,
  hospitalVisits,
  onRefresh,
}: BasicInfoSectionProps) {
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showHospitalModal, setShowHospitalModal] = useState(false);

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

  const getHouseholdLabel = (household: string) => {
    return household === 'same' ? '同じ' : '別';
  };

  const getMedicalInsuranceLabel = (insurance: string) => {
    const labels: Record<string, string> = {
      national_health_insurance: '国保',
      mutual_aid: '共済',
      social_insurance: '社保',
      livelihood_protection: '生活保護',
      other: 'その他',
    };
    return labels[insurance] || insurance;
  };

  const getAidingLabel = (aiding: string) => {
    const labels: Record<string, string> = {
      none: 'なし',
      subsidized: 'あり（一部補助）',
      full_exemption: '全額免除',
    };
    return labels[aiding] || aiding;
  };

  return (
    <div className="space-y-6">
      {/* 受給者基本情報 */}
      <div className="bg-[#1a2332] rounded-lg p-6 border border-[#2a3441]">
        <h3 className="text-lg font-semibold text-white mb-4">受給者基本情報</h3>
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

      {/* 連絡先情報 */}
      {recipient.detail && (
        <div className="bg-[#1a2332] rounded-lg p-6 border border-[#2a3441]">
          <h3 className="text-lg font-semibold text-white mb-4">連絡先</h3>
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

      {/* 緊急連絡先 */}
      {recipient.detail?.emergency_contacts && recipient.detail.emergency_contacts.length > 0 && (
        <div className="bg-[#1a2332] rounded-lg p-6 border border-[#2a3441]">
          <h3 className="text-lg font-semibold text-white mb-4">緊急連絡先</h3>
          <div className="space-y-4">
            {recipient.detail.emergency_contacts.map((contact) => (
              <div key={contact.id} className="p-4 bg-[#0f1419] rounded-lg">
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
                  <div className="text-gray-400 text-sm mt-2">
                    <span className="text-gray-400">備考: </span>
                    <ExpandableText text={contact.notes} maxLength={50} className="inline" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 障害・疾患情報 */}
      {recipient.disability_status && (
        <div className="bg-[#1a2332] rounded-lg p-6 border border-[#2a3441]">
          <h3 className="text-lg font-semibold text-white mb-4">障害・疾患情報</h3>
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
                <div className="text-white">
                  <ExpandableText
                    text={recipient.disability_status.specialRemarks || recipient.disability_status.special_remarks}
                    maxLength={50}
                  />
                </div>
              </div>
            )}

            {/* 障害詳細 */}
            {recipient.disability_status.details && recipient.disability_status.details.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-2">手帳・年金情報</p>
                <div className="space-y-2">
                  {recipient.disability_status.details.map((detail, index) => (
                    <div key={index} className="p-3 bg-[#0f1419] rounded-lg">
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

      {/* 家族構成 */}
      <div className="bg-[#1a2332] rounded-lg p-6 border border-[#2a3441]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">家族構成</h3>
          <button
            onClick={() => setShowFamilyModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a3441] hover:bg-[#3a4451] text-white rounded-lg transition-colors text-sm"
          >
            {familyMembers.length > 0 ? (
              <>
                <PencilIcon className="w-4 h-4" />
                編集
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                追加
              </>
            )}
          </button>
        </div>

        {familyMembers.length === 0 ? (
          <p className="text-gray-400 text-sm">データがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">氏名</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">続柄</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">世帯</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">健康状態</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">備考</th>
                </tr>
              </thead>
              <tbody>
                {familyMembers.map((member) => (
                  <tr key={member.id} className="border-b border-[#2a3441]/50">
                    <td className="py-3 px-3 text-white">{member.name}</td>
                    <td className="py-3 px-3 text-white">{member.relationship}</td>
                    <td className="py-3 px-3 text-white">{getHouseholdLabel(member.household)}</td>
                    <td className="py-3 px-3 text-white">{member.ones_health}</td>
                    <td className="py-3 px-3 text-gray-400">
                      <ExpandableText text={member.remarks} maxLength={50} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 福祉サービスの利用歴 */}
      <div className="bg-[#1a2332] rounded-lg p-6 border border-[#2a3441]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">福祉サービスの利用歴</h3>
          <button
            onClick={() => setShowServiceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a3441] hover:bg-[#3a4451] text-white rounded-lg transition-colors text-sm"
          >
            {serviceHistory.length > 0 ? (
              <>
                <PencilIcon className="w-4 h-4" />
                編集
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                追加
              </>
            )}
          </button>
        </div>

        {serviceHistory.length === 0 ? (
          <p className="text-gray-400 text-sm">データがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">事業所名</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">利用開始日</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">利用時間/月</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">サービス名</th>
                </tr>
              </thead>
              <tbody>
                {serviceHistory.map((service) => (
                  <tr key={service.id} className="border-b border-[#2a3441]/50">
                    <td className="py-3 px-3 text-white">{service.office_name}</td>
                    <td className="py-3 px-3 text-white">
                      {new Date(service.starting_day).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="py-3 px-3 text-white">{service.amount_used}</td>
                    <td className="py-3 px-3 text-white"><ExpandableText text={service.service_name} maxLength={50} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 医療の基本事項 */}
      <div className="bg-[#1a2332] rounded-lg p-6 border border-[#2a3441]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">医療の基本事項</h3>
          <button
            onClick={() => setShowMedicalModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a3441] hover:bg-[#3a4451] text-white rounded-lg transition-colors text-sm"
          >
            {medicalInfo ? (
              <>
                <PencilIcon className="w-4 h-4" />
                編集
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                追加
              </>
            )}
          </button>
        </div>

        {!medicalInfo ? (
          <p className="text-gray-400 text-sm">データがありません</p>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">医療保険</p>
              <p className="text-white">
                {getMedicalInsuranceLabel(medicalInfo.medical_care_insurance)}
                {medicalInfo.medical_care_insurance_other_text && (
                  <span className="text-gray-400 ml-2">({medicalInfo.medical_care_insurance_other_text})</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">公費負担</p>
              <p className="text-white">{getAidingLabel(medicalInfo.aiding)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">過去2年以内の入院歴</p>
              <p className="text-white">{medicalInfo.history_of_hospitalization_in_the_past_2_years ? 'あり' : 'なし'}</p>
            </div>
          </div>
        )}
      </div>

      {/* 通院歴 */}
      <div className="bg-[#1a2332] rounded-lg p-6 border border-[#2a3441]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">通院歴</h3>
          <button
            onClick={() => setShowHospitalModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a3441] hover:bg-[#3a4451] text-white rounded-lg transition-colors text-sm"
          >
            {hospitalVisits.length > 0 ? (
              <>
                <PencilIcon className="w-4 h-4" />
                編集
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                追加
              </>
            )}
          </button>
        </div>

        {hospitalVisits.length === 0 ? (
          <p className="text-gray-400 text-sm">データがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">病名</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">症状</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">医療機関名</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">主治医</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">電話番号</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">服薬状況</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">特記事項</th>
                </tr>
              </thead>
              <tbody>
                {hospitalVisits.map((visit) => (
                  <tr key={visit.id} className="border-b border-[#2a3441]/50">
                    <td className="py-3 px-3 text-white">{visit.disease}</td>
                    <td className="py-3 px-3 text-white">{visit.symptoms}</td>
                    <td className="py-3 px-3 text-white">{visit.medical_institution}</td>
                    <td className="py-3 px-3 text-white">{visit.doctor}</td>
                    <td className="py-3 px-3 text-white">{visit.tel}</td>
                    <td className="py-3 px-3 text-white">{visit.taking_medicine ? 'あり' : 'なし'}</td>
                    <td className="py-3 px-3 text-gray-400">
                      <ExpandableText text={visit.special_remarks} maxLength={50} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* モーダル */}
      <Modal isOpen={showFamilyModal} onClose={() => setShowFamilyModal(false)} title="家族構成の管理" size="xl">
        <FamilyMemberList
          recipientId={recipientId}
          familyMembers={familyMembers}
          onRefresh={() => {
            onRefresh();
            setShowFamilyModal(false);
          }}
        />
      </Modal>

      <Modal isOpen={showServiceModal} onClose={() => setShowServiceModal(false)} title="福祉サービス利用歴の管理" size="xl">
        <ServiceHistoryList
          recipientId={recipientId}
          serviceHistory={serviceHistory}
          onRefresh={() => {
            onRefresh();
            setShowServiceModal(false);
          }}
        />
      </Modal>

      <Modal isOpen={showMedicalModal} onClose={() => setShowMedicalModal(false)} title="医療基本情報の編集">
        <MedicalInfoForm
          recipientId={recipientId}
          medicalInfo={medicalInfo}
          onSuccess={() => {
            onRefresh();
            setShowMedicalModal(false);
          }}
          onCancel={() => setShowMedicalModal(false)}
        />
      </Modal>

      <Modal isOpen={showHospitalModal} onClose={() => setShowHospitalModal(false)} title="通院歴の管理" size="xl">
        <HospitalVisitList
          recipientId={recipientId}
          hospitalVisits={hospitalVisits}
          onRefresh={() => {
            onRefresh();
            setShowHospitalModal(false);
          }}
        />
      </Modal>
    </div>
  );
}
