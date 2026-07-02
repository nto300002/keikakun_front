import {
  APPLICATION_STATUS_OPTIONS,
  DISABILITY_CATEGORY_OPTIONS,
  GRADE_LEVEL_OPTIONS,
  PHYSICAL_DISABILITY_TYPE_OPTIONS,
} from './recipientFormOptions';
import type {
  RecipientFormMode,
  RecipientFormSectionBaseProps,
} from './recipientFormSectionProps';

interface DisabilityDetailsSectionProps
  extends Pick<RecipientFormSectionBaseProps, 'formData' | 'handleDisabilityDetailChange'> {
  mode: RecipientFormMode;
  addDisabilityDetail: () => void;
  removeDisabilityDetail: (index: number) => void;
}

export default function DisabilityDetailsSection({
  formData,
  mode,
  addDisabilityDetail,
  removeDisabilityDetail,
  handleDisabilityDetailChange,
}: DisabilityDetailsSectionProps) {
  const isRegistration = mode === 'registration';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">手帳・年金詳細情報</h3>
        <button
          onClick={addDisabilityDetail}
          className="bg-[#10b981] hover:bg-[#0f9f6e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + 手帳・年金情報を追加
        </button>
      </div>

      {formData.disabilityDetails.map((detail, index) => (
        <div key={index} className="border border-slate-300 dark:border-[#2a3441] rounded-lg p-6 relative">
          {formData.disabilityDetails.length > 1 && (
            <button
              onClick={() => removeDisabilityDetail(index)}
              className="absolute top-4 right-4 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded text-sm transition-colors"
            >
              削除
            </button>
          )}

          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4">手帳・年金情報 {index + 1}</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                カテゴリ {isRegistration && <span className="text-red-400">*</span>}
              </label>
              <select
                value={detail.category}
                onChange={(e) => handleDisabilityDetailChange(index, 'category', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border border-slate-300 dark:border-[#2a3441] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              >
                <option value="">選択してください</option>
                {DISABILITY_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">等級・レベル</label>
              <select
                value={detail.gradeOrLevel || ''}
                onChange={(e) => handleDisabilityDetailChange(index, 'gradeOrLevel', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border border-slate-300 dark:border-[#2a3441] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              >
                <option value="">選択してください</option>
                {detail.category &&
                  GRADE_LEVEL_OPTIONS[detail.category as keyof typeof GRADE_LEVEL_OPTIONS]?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                申請状況 {isRegistration && <span className="text-red-400">*</span>}
              </label>
              <select
                value={detail.applicationStatus}
                onChange={(e) => handleDisabilityDetailChange(index, 'applicationStatus', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border border-slate-300 dark:border-[#2a3441] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              >
                <option value="">選択してください</option>
                {APPLICATION_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {detail.category === 'physical_handbook' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    身体障害種別
                  </label>
                  <select
                    value={detail.physicalDisabilityType || ''}
                    onChange={(e) => handleDisabilityDetailChange(index, 'physicalDisabilityType', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border border-slate-300 dark:border-[#2a3441] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                  >
                    <option value="">選択してください</option>
                    {PHYSICAL_DISABILITY_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {detail.physicalDisabilityType === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">その他詳細</label>
                    <input
                      type="text"
                      value={detail.physicalDisabilityTypeOtherText || ''}
                      onChange={(e) =>
                        handleDisabilityDetailChange(index, 'physicalDisabilityTypeOtherText', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border border-slate-300 dark:border-[#2a3441] rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                      placeholder="詳細を入力してください"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
