import { LIVELIHOOD_PROTECTION_OPTIONS } from './recipientFormOptions';
import type { RecipientFormSectionBaseProps } from './recipientFormSectionProps';

export default function DisabilitySection({
  formData,
  errors,
  handleDisabilityInfoChange,
}: Pick<RecipientFormSectionBaseProps, 'formData' | 'errors' | 'handleDisabilityInfoChange'>) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-4">障害・疾患情報</h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
          障害または疾患名 <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.disabilityInfo.disabilityOrDiseaseName}
          onChange={(e) => handleDisabilityInfoChange('disabilityOrDiseaseName', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
            errors.disabilityOrDiseaseName ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
          }`}
          placeholder="例：統合失調症、知的障害、身体障害など"
        />
        {errors.disabilityOrDiseaseName && (
          <p className="text-red-400 text-sm mt-1">{errors.disabilityOrDiseaseName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
          生活保護受給状況 <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.disabilityInfo.livelihoodProtection}
          onChange={(e) => handleDisabilityInfoChange('livelihoodProtection', e.target.value)}
          className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
            errors.livelihoodProtection ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
          }`}
        >
          <option value="">選択してください</option>
          {LIVELIHOOD_PROTECTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.livelihoodProtection && <p className="text-red-400 text-sm mt-1">{errors.livelihoodProtection}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">特記事項</label>
        <textarea
          value={formData.disabilityInfo.specialRemarks || ''}
          onChange={(e) => handleDisabilityInfoChange('specialRemarks', e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border border-slate-300 dark:border-[#2a3441] rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
          placeholder="手帳情報以外の重要な障害特性、配慮事項、医療的ケアの必要性等（2000文字以内）"
        />
        <div className="text-right text-xs text-slate-600 dark:text-gray-400 mt-1">
          {(formData.disabilityInfo.specialRemarks || '').length}/2000文字
        </div>
      </div>
    </div>
  );
}
