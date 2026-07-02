'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeActionRequestModal from '@/components/common/EmployeeActionRequestModal';
import { useStaffRole } from '@/hooks/useStaffRole';
import { ActionType, ResourceType } from '@/types/employeeActionRequest';
import BasicInfoSection from './forms/BasicInfoSection';
import ContactSection from './forms/ContactSection';
import DisabilityDetailsSection from './forms/DisabilityDetailsSection';
import DisabilitySection from './forms/DisabilitySection';
import EmergencyContactsSection from './forms/EmergencyContactsSection';
import {
  createEmptyDisabilityDetail,
  INITIAL_RECIPIENT_FORM_DATA,
  RECIPIENT_FORM_SECTIONS,
} from './forms/recipientFormDefaults';
import type { RecipientFormData } from './forms/recipientFormTypes';
import { useRecipientFormState } from './forms/useRecipientFormState';
import { validateRecipientFormSection } from './forms/recipientFormValidation';

// エラーフィールドの日本語マッピング
const ERROR_FIELD_MAPPING: Record<string, string> = {
  // 利用者情報
  'firstNameFurigana': '利用者 名（ふりがな）',
  'lastNameFurigana': '利用者 姓（ふりがな）',
  'firstName': '利用者 名',
  'lastName': '利用者 姓',
  // 緊急連絡先情報
  'emergency_contacts.0.firstNameFurigana': '緊急連絡先 名（ふりがな）',
  'emergency_contacts.0.lastNameFurigana': '緊急連絡先 姓（ふりがな）',
  'emergency_contacts.1.firstNameFurigana': '緊急連絡先 名（ふりがな）',
  'emergency_contacts.1.lastNameFurigana': '緊急連絡先 姓（ふりがな）',
  'emergency_contacts.2.firstNameFurigana': '緊急連絡先 名（ふりがな）',
  'emergency_contacts.2.lastNameFurigana': '緊急連絡先 姓（ふりがな）',
  // その他共通フィールド
  'relationship': '続柄',
  'birthDay': '生年月日',
  'gender': '性別',
  'address': '住所',
  'tel': '電話番号',
  'disabilityOrDiseaseName': '障害または疾患名',
  'livelihoodProtection': '生活保護受給状況',
  'formOfResidence': '居住形態',
  'meansOfTransportation': '交通手段',
  'category': 'カテゴリ',
  'applicationStatus': '申請状況',
  'gradeOrLevel': '等級・レベル',
};

// エラーメッセージを日本語に変換する関数
function translateErrorMessage(error: string): string {
  let translatedError = error;
  for (const [key, value] of Object.entries(ERROR_FIELD_MAPPING)) {
    translatedError = translatedError.replace(new RegExp(key, 'g'), value);
  }
  return translatedError;
}

const SENIOR_RECIPIENT_FORM_CLASS =
  'space-y-8 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-2xl [&_h3]:font-bold [&_h4]:text-xl [&_h4]:font-bold [&_p]:text-base [&_p]:font-semibold [&_label]:text-lg [&_label]:font-bold [&_input]:text-lg [&_input]:font-semibold [&_input]:px-4 [&_input]:py-3 [&_select]:text-lg [&_select]:font-semibold [&_select]:px-4 [&_select]:py-3 [&_textarea]:text-lg [&_textarea]:font-semibold [&_textarea]:px-4 [&_textarea]:py-3 [&_button]:text-lg [&_button]:font-bold';

export default function UserRegistrationForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const {
    formData,
    setFormData,
    addEmergencyContact,
    removeEmergencyContact,
    addDisabilityDetail,
    removeDisabilityDetail,
    handleBasicInfoChange,
    handleContactAddressChange,
    handleEmergencyContactChange,
    handleDisabilityInfoChange,
    handleDisabilityDetailChange,
  } = useRecipientFormState(INITIAL_RECIPIENT_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Employee Action Request Modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<RecipientFormData | null>(null);

  const { isEmployee } = useStaffRole();

  const sections = RECIPIENT_FORM_SECTIONS;

  // Progress calculation
  const getProgressPercentage = () => {
    return ((currentSection + 1) / sections.length) * 100;
  };

  useEffect(() => {
    if (currentSection !== 4 || formData.disabilityDetails.length > 0) return;

    setFormData(prev => ({
      ...prev,
      disabilityDetails: [createEmptyDisabilityDetail()],
    }));
  }, [currentSection, formData.disabilityDetails.length, setFormData]);

  // Form validation for each section
  const validateSection = (sectionId: number): boolean => {
    const newErrors = validateRecipientFormSection(formData, sectionId, 'registration');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle navigation
  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateSection(currentSection)) {
      return;
    }

    // Employeeの場合はリクエスト申請モーダルを表示
    if (isEmployee) {
      setPendingFormData(formData);
      setIsRequestModalOpen(true);
      return;
    }

    // Manager/Ownerの場合は直接実行
    await executeSubmit(formData);
  };

  const executeSubmit = async (data: RecipientFormData) => {
    setIsLoading(true);
    try {
      // Import the API client and transformer
      const { welfareRecipientsApi, transformFormDataToBackend } = await import('@/lib/welfare-recipients');

      // Transform form data to backend format
      const registrationData = transformFormDataToBackend(data);

      // Submit to API
      const response = await welfareRecipientsApi.create(registrationData);

      if (response.success) {
        // Redirect to dashboard on success
        router.push('/dashboard?message=' + encodeURIComponent(response.message));
      } else {
        setErrors({ submit: '登録に失敗しました。もう一度お試しください。' });
      }
    } catch (error) {
      if (error instanceof Error) {
        const translatedMessage = translateErrorMessage(error.message);
        setErrors({ submit: translatedMessage || '登録に失敗しました。もう一度お試しください。' });
      } else {
        setErrors({ submit: '登録に失敗しました。もう一度お試しください。' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSuccess = () => {
    // リクエスト送信成功時の処理
    router.push('/dashboard?message=' + encodeURIComponent('利用者登録リクエストを送信しました。Manager/Ownerの承認をお待ちください。'));
  };

  return (
    <div className={SENIOR_RECIPIENT_FORM_CLASS}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-2">利用者新規登録</h1>
        <p className="text-slate-600 dark:text-gray-400">新しい利用者の情報を登録します</p>
      </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`flex items-center ${index < sections.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-base font-bold ${
                  index <= currentSection
                    ? 'bg-[#10b981] border-[#10b981] text-white'
                    : 'border-gray-600 text-slate-600 dark:text-gray-400'
                }`}>
                  {index + 1}
                </div>
                {index < sections.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    index < currentSection ? 'bg-[#10b981]' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{sections[currentSection].title}</h2>
            <p className="text-slate-600 dark:text-gray-400 text-sm">{sections[currentSection].description}</p>
          </div>
          <div className="mt-4 bg-gray-700 rounded-full h-2">
            <div
              className="bg-[#10b981] h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-[#0f1419cc] rounded-lg border border-slate-300 dark:border-[#2a3441] p-8">
          {currentSection === 0 && (
            <BasicInfoSection
              formData={formData}
              errors={errors}
              handleBasicInfoChange={handleBasicInfoChange}
            />
          )}

          {currentSection === 1 && (
            <ContactSection
              formData={formData}
              errors={errors}
              handleContactAddressChange={handleContactAddressChange}
            />
          )}

          {currentSection === 2 && (
            <EmergencyContactsSection
              mode="registration"
              formData={formData}
              errors={errors}
              addEmergencyContact={addEmergencyContact}
              removeEmergencyContact={removeEmergencyContact}
              handleEmergencyContactChange={handleEmergencyContactChange}
            />
          )}

          {currentSection === 3 && (
            <DisabilitySection
              formData={formData}
              errors={errors}
              handleDisabilityInfoChange={handleDisabilityInfoChange}
            />
          )}

          {currentSection === 4 && (
            <DisabilityDetailsSection
              mode="registration"
              formData={formData}
              addDisabilityDetail={addDisabilityDetail}
              removeDisabilityDetail={removeDisabilityDetail}
              handleDisabilityDetailChange={handleDisabilityDetailChange}
            />
          )}

          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-300 dark:border-[#2a3441]">
            <button
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="px-6 py-2 text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white disabled:cursor-not-allowed transition-colors"
            >
              前へ
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 border border-slate-300 dark:border-[#2a3441] text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white hover:border-gray-500 rounded-lg transition-colors"
              >
                キャンセル
              </button>

              {currentSection < sections.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-[#10b981] hover:bg-[#0f9f6e] text-white rounded-lg font-medium transition-colors"
                >
                  次へ
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2 bg-[#10b981] hover:bg-[#0f9f6e] disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  )}
                  登録完了
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Employee Action Request Modal */}
      {pendingFormData && (
        <EmployeeActionRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false);
            setPendingFormData(null);
          }}
          onSuccess={handleRequestSuccess}
          actionType={ActionType.CREATE}
          resourceType={ResourceType.WELFARE_RECIPIENT}
          requestData={{
            // バックエンドが期待する形式（トップレベルにfull_name, first_name, last_nameを含める）
            full_name: `${pendingFormData.basicInfo.lastName} ${pendingFormData.basicInfo.firstName}`,
            first_name: pendingFormData.basicInfo.firstName,
            last_name: pendingFormData.basicInfo.lastName,
            // 後方互換性のため、form_dataも含める
            form_data: pendingFormData,
          }}
          actionDescription={`利用者「${pendingFormData.basicInfo.lastName} ${pendingFormData.basicInfo.firstName}」を登録`}
        />
      )}
    </div>
  );
}
