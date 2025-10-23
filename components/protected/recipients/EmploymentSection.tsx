'use client';

import { useState } from 'react';
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import ExpandableText from '@/components/ui/ExpandableText';
import { assessmentApi, type Employment, type EmploymentInput } from '@/lib/assessment';

interface EmploymentSectionProps {
  recipientId: string;
  employment?: Employment;
  onRefresh: () => void;
}

export default function EmploymentSection({
  recipientId,
  employment,
  onRefresh,
}: EmploymentSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EmploymentInput>({
    work_conditions: employment?.work_conditions || 'other',
    regular_or_part_time_job: employment?.regular_or_part_time_job || false,
    employment_support: employment?.employment_support || false,
    work_experience_in_the_past_year: employment?.work_experience_in_the_past_year || false,
    suspension_of_work: employment?.suspension_of_work || false,
    qualifications: employment?.qualifications || '',
    main_places_of_employment: employment?.main_places_of_employment || '',
    general_employment_request: employment?.general_employment_request || false,
    desired_job: employment?.desired_job || '',
    special_remarks: employment?.special_remarks || '',
    work_outside_the_facility: employment?.work_outside_the_facility || 'not_hope',
    special_note_about_working_outside_the_facility: employment?.special_note_about_working_outside_the_facility || '',
  });

  const handleOpenModal = () => {
    // モーダルを開く際に現在のデータで初期化
    if (employment) {
      setFormData({
        work_conditions: employment.work_conditions,
        regular_or_part_time_job: employment.regular_or_part_time_job,
        employment_support: employment.employment_support,
        work_experience_in_the_past_year: employment.work_experience_in_the_past_year,
        suspension_of_work: employment.suspension_of_work,
        qualifications: employment.qualifications || '',
        main_places_of_employment: employment.main_places_of_employment || '',
        general_employment_request: employment.general_employment_request,
        desired_job: employment.desired_job || '',
        special_remarks: employment.special_remarks || '',
        work_outside_the_facility: employment.work_outside_the_facility,
        special_note_about_working_outside_the_facility: employment.special_note_about_working_outside_the_facility || '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await assessmentApi.employment.createOrUpdate(recipientId, formData);
      setShowModal(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to save employment:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('就労関係情報の保存に失敗しました。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWorkConditionsLabel = (condition: string) => {
    const labels: Record<string, string> = {
      general_employment: '一般就労',
      part_time: 'パート、アルバイト',
      transition_support: '就労移行支援',
      continuous_support_a: '就労継続支援A',
      continuous_support_b: '就労継続支援B',
      main_employment: '本就労',
      other: 'その他',
    };
    return labels[condition] || condition;
  };

  const getWorkOutsideFacilityLabel = (status: string) => {
    const labels: Record<string, string> = {
      hope: '希望する',
      not_hope: '希望しない',
      undecided: '未定',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* 就労関係について */}
      <div className="bg-[#1a2332] rounded-lg p-6 border border-[#2a3441]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">就労関係について</h3>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a3441] hover:bg-[#3a4451] text-white rounded-lg transition-colors text-sm"
          >
            {employment ? (
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

        {!employment ? (
          <p className="text-gray-400 text-sm">データがありません</p>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">就労状況</p>
                <p className="text-white">{getWorkConditionsLabel(employment.work_conditions)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm mb-2">過去の就労経験</p>
                <div className="space-y-2 pl-4">
                  <div>
                    <span className="text-gray-400">一般就労やパート、アルバイトの経験: </span>
                    <span className="text-white">{employment.regular_or_part_time_job ? 'ある' : 'ない'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">就労移行、継続支援の経験: </span>
                    <span className="text-white">{employment.employment_support ? 'ある' : 'ない'}</span>
                  </div>
                  {employment.qualifications && (
                    <div>
                      <span className="text-gray-400">免許、資格、検定: </span>
                      <ExpandableText text={employment.qualifications} maxLength={50} className="inline text-white" />
                    </div>
                  )}
                  {employment.main_places_of_employment && (
                    <div>
                      <span className="text-gray-400">主な就労先と期間: </span>
                      <ExpandableText text={employment.main_places_of_employment} maxLength={50} className="inline text-white" />
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">一般就労希望: </span>
                    <span className="text-white">{employment.general_employment_request ? 'ある' : 'ない'}</span>
                  </div>
                  {employment.desired_job && (
                    <div>
                      <span className="text-gray-400">希望する仕事: </span>
                      <ExpandableText text={employment.desired_job} maxLength={50} className="inline text-white" />
                    </div>
                  )}
                  {employment.special_remarks && (
                    <div>
                      <span className="text-gray-400">特記事項: </span>
                      <ExpandableText text={employment.special_remarks} maxLength={50} className="inline text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 施設外就労 */}
      {employment && (
        <div className="bg-[#1a2332] rounded-lg p-6 border border-[#2a3441]">
          <h3 className="text-lg font-semibold text-white mb-4">施設外就労</h3>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">希望</p>
              <p className="text-white">{getWorkOutsideFacilityLabel(employment.work_outside_the_facility)}</p>
            </div>
            {employment.special_note_about_working_outside_the_facility && (
              <div>
                <p className="text-gray-400 text-sm">特記事項</p>
                <div className="text-white">
                  <ExpandableText
                    text={employment.special_note_about_working_outside_the_facility}
                    maxLength={50}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* モーダル */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="就労関係の編集" size="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{error}</pre>
            </div>
          )}
          {/* 就労状況 */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              就労状況 <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.work_conditions}
              onChange={(e) => setFormData({ ...formData, work_conditions: e.target.value as EmploymentInput['work_conditions'] })}
              className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="general_employment">一般就労</option>
              <option value="part_time">パート、アルバイト</option>
              <option value="transition_support">就労移行支援</option>
              <option value="continuous_support_a">就労継続支援A</option>
              <option value="continuous_support_b">就労継続支援B</option>
              <option value="main_employment">本就労</option>
              <option value="other">その他</option>
            </select>
          </div>

          {/* チェックボックス群 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              過去の就労経験
            </label>
            <div className="space-y-2 pl-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.regular_or_part_time_job}
                  onChange={(e) => setFormData({ ...formData, regular_or_part_time_job: e.target.checked })}
                  className="w-4 h-4 rounded border-[#2a3441] bg-[#0f1419] text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-400">一般就労やパート、アルバイトの経験がある</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.employment_support}
                  onChange={(e) => setFormData({ ...formData, employment_support: e.target.checked })}
                  className="w-4 h-4 rounded border-[#2a3441] bg-[#0f1419] text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-400">就労移行、継続支援の経験がある</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.work_experience_in_the_past_year}
                  onChange={(e) => setFormData({ ...formData, work_experience_in_the_past_year: e.target.checked })}
                  className="w-4 h-4 rounded border-[#2a3441] bg-[#0f1419] text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-400">過去1年以内に就労経験がある</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.suspension_of_work}
                  onChange={(e) => setFormData({ ...formData, suspension_of_work: e.target.checked })}
                  className="w-4 h-4 rounded border-[#2a3441] bg-[#0f1419] text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-400">現在休職中である</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.general_employment_request}
                  onChange={(e) => setFormData({ ...formData, general_employment_request: e.target.checked })}
                  className="w-4 h-4 rounded border-[#2a3441] bg-[#0f1419] text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-400">一般就労を希望する</span>
              </label>
            </div>
          </div>

          {/* 免許、資格、検定 */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              免許、資格、検定
            </label>
            <textarea
              value={formData.qualifications}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="保有している免許・資格・検定を入力"
            />
          </div>

          {/* 主な就労先と期間 */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              主な就労先と期間
            </label>
            <textarea
              value={formData.main_places_of_employment}
              onChange={(e) => setFormData({ ...formData, main_places_of_employment: e.target.value })}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="これまでの就労先と期間を入力"
            />
          </div>

          {/* 希望する仕事 */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              希望する仕事
            </label>
            <input
              type="text"
              value={formData.desired_job}
              onChange={(e) => setFormData({ ...formData, desired_job: e.target.value })}
              maxLength={255}
              className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="希望する職種を入力"
            />
          </div>

          {/* 特記事項 */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              特記事項
            </label>
            <textarea
              value={formData.special_remarks}
              onChange={(e) => setFormData({ ...formData, special_remarks: e.target.value })}
              rows={3}
              maxLength={1000}
              className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="その他特記事項を入力"
            />
          </div>

          {/* 施設外就労の希望 */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              施設外就労の希望 <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.work_outside_the_facility}
              onChange={(e) => setFormData({ ...formData, work_outside_the_facility: e.target.value as EmploymentInput['work_outside_the_facility'] })}
              className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="hope">希望する</option>
              <option value="not_hope">希望しない</option>
              <option value="undecided">未定</option>
            </select>
          </div>

          {/* 施設外就労の特記事項 */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              施設外就労の特記事項
            </label>
            <textarea
              value={formData.special_note_about_working_outside_the_facility}
              onChange={(e) => setFormData({ ...formData, special_note_about_working_outside_the_facility: e.target.value })}
              rows={3}
              maxLength={1000}
              className="w-full px-3 py-2 bg-[#0f1419] border border-[#2a3441] rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="施設外就労に関する特記事項を入力"
            />
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2a3441]">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-[#2a3441] hover:bg-[#3a4451] text-white rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
