'use client';

import { useState } from 'react';
import { assessmentApi, type FamilyMember, type FamilyMemberInput } from '@/lib/assessment';

interface FamilyMemberFormProps {
  recipientId: string;
  familyMember?: FamilyMember;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FamilyMemberForm({
  recipientId,
  familyMember,
  onSuccess,
  onCancel,
}: FamilyMemberFormProps) {
  const [formData, setFormData] = useState<FamilyMemberInput>({
    name: familyMember?.name || '',
    relationship: familyMember?.relationship || '',
    household: familyMember?.household || 'same',
    ones_health: familyMember?.ones_health || '',
    remarks: familyMember?.remarks || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (familyMember) {
        await assessmentApi.familyMembers.update(familyMember.id, formData);
      } else {
        await assessmentApi.familyMembers.create(recipientId, formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save family member:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('家族情報の保存に失敗しました。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-100 mb-2">
          氏名 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-100 mb-2">
          続柄 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.relationship}
          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="例: 父、母、兄弟"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-100 mb-2">
          世帯 <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="household"
              value="same"
              checked={formData.household === 'same'}
              onChange={(e) => setFormData({ ...formData, household: e.target.value as 'same' | 'separate' })}
              className="mr-2"
            />
            <span className="text-white">同じ</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="household"
              value="separate"
              checked={formData.household === 'separate'}
              onChange={(e) => setFormData({ ...formData, household: e.target.value as 'same' | 'separate' })}
              className="mr-2"
            />
            <span className="text-white">別</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-100 mb-2">
          健康状態 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.ones_health}
          onChange={(e) => setFormData({ ...formData, ones_health: e.target.value })}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="例: 良好、持病あり"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-100 mb-2">
          備考
        </label>
        <textarea
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-100 hover:text-white transition-colors"
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
          {familyMember ? '更新' : '追加'}
        </button>
      </div>
    </form>
  );
}
