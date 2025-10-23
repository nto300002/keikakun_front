'use client';

import { useState } from 'react';
import { assessmentApi, type HospitalVisit, type HospitalVisitInput } from '@/lib/assessment';
import DateDrumPicker from '@/components/ui/DateDrumPicker';

interface HospitalVisitFormProps {
  recipientId: string;
  hospitalVisit?: HospitalVisit;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function HospitalVisitForm({
  recipientId,
  hospitalVisit,
  onSuccess,
  onCancel,
}: HospitalVisitFormProps) {
  const [formData, setFormData] = useState<HospitalVisitInput>({
    disease: hospitalVisit?.disease || '',
    frequency_of_hospital_visits: hospitalVisit?.frequency_of_hospital_visits || '',
    symptoms: hospitalVisit?.symptoms || '',
    medical_institution: hospitalVisit?.medical_institution || '',
    doctor: hospitalVisit?.doctor || '',
    tel: hospitalVisit?.tel || '',
    taking_medicine: hospitalVisit?.taking_medicine || false,
    date_started: hospitalVisit?.date_started || '',
    date_ended: hospitalVisit?.date_ended || '',
    special_remarks: hospitalVisit?.special_remarks || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (hospitalVisit) {
        await assessmentApi.hospitalVisits.update(hospitalVisit.id, formData);
      } else {
        await assessmentApi.hospitalVisits.create(recipientId, formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save hospital visit:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('通院歴の保存に失敗しました。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          病名 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.disease}
          onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="例: 高血圧症"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          症状 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.symptoms}
          onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="例: めまい、頭痛"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          医療機関名 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.medical_institution}
          onChange={(e) => setFormData({ ...formData, medical_institution: e.target.value })}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="例: 〇〇クリニック"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            主治医 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.doctor}
            onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
            className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
            placeholder="例: 山田太郎"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            電話番号 <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.tel}
            onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
            className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
            placeholder="03-1234-5678"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          通院頻度 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.frequency_of_hospital_visits}
          onChange={(e) => setFormData({ ...formData, frequency_of_hospital_visits: e.target.value })}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="例: 月1回"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            開始日
          </label>
          <DateDrumPicker
            value={formData.date_started || ''}
            onChange={(date) => setFormData({ ...formData, date_started: date })}
            minYear={1950}
            maxYear={new Date().getFullYear() + 1}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            終了日
          </label>
          <DateDrumPicker
            value={formData.date_ended || ''}
            onChange={(date) => setFormData({ ...formData, date_ended: date })}
            minYear={1950}
            maxYear={new Date().getFullYear() + 1}
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.taking_medicine}
            onChange={(e) => setFormData({ ...formData, taking_medicine: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-white">服薬あり</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          特記事項
        </label>
        <textarea
          value={formData.special_remarks}
          onChange={(e) => setFormData({ ...formData, special_remarks: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
          placeholder="その他特記事項があれば入力してください"
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
          {hospitalVisit ? '更新' : '追加'}
        </button>
      </div>
    </form>
  );
}
