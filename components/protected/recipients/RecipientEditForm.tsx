'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { welfareRecipientsApi, transformFormDataToBackend, type WelfareRecipient } from '@/lib/welfare-recipients';
import EmployeeActionRequestModal from '@/components/common/EmployeeActionRequestModal';
import { useStaffRole } from '@/hooks/useStaffRole';
import { ActionType, ResourceType } from '@/types/employeeActionRequest';
import BasicInfoSection from './forms/BasicInfoSection';
import ContactSection from './forms/ContactSection';
import DisabilityDetailsSection from './forms/DisabilityDetailsSection';
import DisabilitySection from './forms/DisabilitySection';
import EmergencyContactsSection from './forms/EmergencyContactsSection';
import { RECIPIENT_FORM_SECTIONS } from './forms/recipientFormDefaults';
import { mapWelfareRecipientToFormData } from './forms/recipientFormMapper';
import type { RecipientFormData } from './forms/recipientFormTypes';
import { useRecipientFormState } from './forms/useRecipientFormState';
import { validateRecipientFormSection } from './forms/recipientFormValidation';

const SENIOR_RECIPIENT_FORM_CLASS =
  'space-y-8 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-2xl [&_h3]:font-bold [&_h4]:text-xl [&_h4]:font-bold [&_p]:text-base [&_p]:font-semibold [&_label]:text-lg [&_label]:font-bold [&_input]:text-lg [&_input]:font-semibold [&_input]:px-4 [&_input]:py-3 [&_select]:text-lg [&_select]:font-semibold [&_select]:px-4 [&_select]:py-3 [&_textarea]:text-lg [&_textarea]:font-semibold [&_textarea]:px-4 [&_textarea]:py-3 [&_button]:text-lg [&_button]:font-bold';

interface RecipientEditFormProps {
  recipientId: string;
  initialData: WelfareRecipient;
  onCancel: () => void;
}

export default function RecipientEditForm({ recipientId, initialData, onCancel }: RecipientEditFormProps) {
  const router = useRouter();
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
  } = useRecipientFormState<RecipientFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Employee Action Request Modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<RecipientFormData | null>(null);

  const { isEmployee } = useStaffRole();

  const sections = RECIPIENT_FORM_SECTIONS;

  // Initialize form data with existing recipient data
  useEffect(() => {
    if (initialData) {
      setFormData(mapWelfareRecipientToFormData(initialData));
    }
  }, [initialData, setFormData]);

  // Progress calculation
  const getProgressPercentage = () => {
    return ((currentSection + 1) / sections.length) * 100;
  };

  // Form validation for each section
  const validateSection = (sectionId: number): boolean => {
    if (!formData) return false;
    const newErrors = validateRecipientFormSection(formData, sectionId, 'edit');
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
    if (!formData || !validateSection(currentSection)) {
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
      // Transform form data to backend format
      const registrationData = transformFormDataToBackend(data);

      // Update recipient via API
      await welfareRecipientsApi.update(recipientId, registrationData);

      // Redirect to dashboard with success message
      router.push('/dashboard?message=' + encodeURIComponent('利用者情報を更新しました'));
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message || '更新に失敗しました。もう一度お試しください。' });
      } else {
        setErrors({ submit: '更新に失敗しました。もう一度お試しください。' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSuccess = () => {
    // リクエスト送信成功時の処理
    router.push('/dashboard?message=' + encodeURIComponent('利用者情報更新リクエストを送信しました。Manager/Ownerの承認をお待ちください。'));
  };

  if (!formData) {
    return (
      <div className="bg-white dark:bg-[#0f1419cc] rounded-lg border border-slate-300 dark:border-[#2a3441] p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#10b981]"></div>
        <p className="mt-4 text-lg font-semibold text-slate-600 dark:text-gray-400">データを準備中...</p>
      </div>
    );
  }

  return (
    <div className={SENIOR_RECIPIENT_FORM_CLASS}>
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
            mode="edit"
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
            mode="edit"
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
              onClick={onCancel}
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
                更新完了
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
          actionType={ActionType.UPDATE}
          resourceType={ResourceType.WELFARE_RECIPIENT}
          resourceId={recipientId}
          requestData={{
            recipient_name: `${pendingFormData.basicInfo.lastName} ${pendingFormData.basicInfo.firstName}`,
            form_data: pendingFormData,
          }}
          actionDescription={`利用者「${pendingFormData.basicInfo.lastName} ${pendingFormData.basicInfo.firstName}」の情報を更新`}
        />
      )}
    </div>
  );
}
