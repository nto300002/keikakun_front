'use client';

import { useState } from 'react';
import { assessmentApi, type MedicalInfo, type MedicalInfoInput } from '@/lib/assessment';
import EmployeeActionRequestModal from '@/components/common/EmployeeActionRequestModal';
import { useStaffRole } from '@/hooks/useStaffRole';
import { ActionType, ResourceType } from '@/types/employeeActionRequest';

interface MedicalInfoFormProps {
  recipientId: string;
  medicalInfo?: MedicalInfo;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MedicalInfoForm({
  recipientId,
  medicalInfo,
  onSuccess,
  onCancel,
}: MedicalInfoFormProps) {
  const [formData, setFormData] = useState<MedicalInfoInput>({
    medical_care_insurance: medicalInfo?.medical_care_insurance || 'national_health_insurance',
    medical_care_insurance_other_text: medicalInfo?.medical_care_insurance_other_text || '',
    aiding: medicalInfo?.aiding || 'none',
    history_of_hospitalization_in_the_past_2_years: medicalInfo?.history_of_hospitalization_in_the_past_2_years || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Employee Action Request Modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const { isEmployee } = useStaffRole();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Employeeの場合はリクエスト申請モーダルを表示
    if (isEmployee) {
      setIsRequestModalOpen(true);
      return;
    }

    // Manager/Ownerの場合は直接実行
    await executeSubmit();
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await assessmentApi.medicalInfo.createOrUpdate(recipientId, formData);
      onSuccess();
    } catch (err) {
      console.error('Failed to save medical info:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('医療基本情報の保存に失敗しました。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestSuccess = () => {
    // リクエスト送信成功時の処理
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          医療保険の種類 <span className="text-red-400">*</span>
        </label>
        <select
          required
          value={formData.medical_care_insurance}
          onChange={(e) => setFormData({ ...formData, medical_care_insurance: e.target.value as MedicalInfoInput['medical_care_insurance'] })}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
        >
          <option value="national_health_insurance">国保</option>
          <option value="mutual_aid">共済</option>
          <option value="social_insurance">社保</option>
          <option value="livelihood_protection">生活保護</option>
          <option value="other">その他</option>
        </select>
      </div>

      {formData.medical_care_insurance === 'other' && (
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            その他の詳細 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.medical_care_insurance_other_text}
            onChange={(e) => setFormData({ ...formData, medical_care_insurance_other_text: e.target.value })}
            className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
            placeholder="その他の医療保険の種類を入力してください"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          公費負担 <span className="text-red-400">*</span>
        </label>
        <select
          required
          value={formData.aiding}
          onChange={(e) => setFormData({ ...formData, aiding: e.target.value as 'none' | 'subsidized' | 'full_exemption' })}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
        >
          <option value="none">なし</option>
          <option value="subsidized">あり（一部補助）</option>
          <option value="full_exemption">全額免除</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.history_of_hospitalization_in_the_past_2_years}
            onChange={(e) => setFormData({ ...formData, history_of_hospitalization_in_the_past_2_years: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-white">過去2年以内に入院歴がある</span>
        </label>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#10b981] hover:bg-[#0ea571] disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {isSubmitting && (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          )}
          {medicalInfo ? '更新' : '追加'}
        </button>
      </div>

      {/* Employee Action Request Modal */}
      <EmployeeActionRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={handleRequestSuccess}
        actionType={medicalInfo ? ActionType.UPDATE : ActionType.CREATE}
        resourceType={ResourceType.WELFARE_RECIPIENT}
        resourceId={recipientId}
        requestData={{
          medical_info: formData,
        }}
        actionDescription={`医療基本情報を${medicalInfo ? '更新' : '登録'}`}
      />
    </form>
  );
}
