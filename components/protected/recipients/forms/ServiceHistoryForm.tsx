'use client';

import { useState } from 'react';
import { assessmentApi, type ServiceHistory, type ServiceHistoryInput } from '@/lib/assessment';
import DateDrumPicker from '@/components/ui/DateDrumPicker';

interface ServiceHistoryFormProps {
  recipientId: string;
  serviceHistory?: ServiceHistory;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ServiceHistoryForm({
  recipientId,
  serviceHistory,
  onSuccess,
  onCancel,
}: ServiceHistoryFormProps) {
  const [formData, setFormData] = useState<ServiceHistoryInput>({
    office_name: serviceHistory?.office_name || '',
    starting_day: serviceHistory?.starting_day || '',
    amount_used: serviceHistory?.amount_used || '',
    service_name: serviceHistory?.service_name || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (serviceHistory) {
        await assessmentApi.serviceHistory.update(serviceHistory.id, formData);
      } else {
        await assessmentApi.serviceHistory.create(recipientId, formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save service history:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('サービス利用歴の保存に失敗しました。');
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
        <label className="block text-sm font-medium text-gray-400 mb-2">
          事業所名 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.office_name}
          onChange={(e) => setFormData({ ...formData, office_name: e.target.value })}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="例: 〇〇事業所"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          サービス名 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.service_name}
          onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="例: 就労継続支援B型"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          利用開始日 <span className="text-red-400">*</span>
        </label>
        <DateDrumPicker
          value={formData.starting_day}
          onChange={(date) => setFormData({ ...formData, starting_day: date })}
          minYear={2000}
          maxYear={new Date().getFullYear() + 1}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          利用時間/月 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.amount_used}
          onChange={(e) => setFormData({ ...formData, amount_used: e.target.value })}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="例: 60時間"
        />
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
          {serviceHistory ? '更新' : '追加'}
        </button>
      </div>
    </form>
  );
}
