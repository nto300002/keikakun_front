import DateDrumPicker from '../../../ui/DateDrumPicker';

import { GENDER_OPTIONS } from './recipientFormOptions';
import type { RecipientFormSectionBaseProps } from './recipientFormSectionProps';

export default function BasicInfoSection({
  formData,
  errors,
  handleBasicInfoChange,
}: Pick<RecipientFormSectionBaseProps, 'formData' | 'errors' | 'handleBasicInfoChange'>) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-4">基本情報</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            姓 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.basicInfo.lastName}
            onChange={(e) => handleBasicInfoChange('lastName', e.target.value)}
            className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
              errors.lastName ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
            }`}
            placeholder="山田"
          />
          {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            名 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.basicInfo.firstName}
            onChange={(e) => handleBasicInfoChange('firstName', e.target.value)}
            className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
              errors.firstName ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
            }`}
            placeholder="太郎"
          />
          {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            姓（ふりがな） <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.basicInfo.lastNameFurigana}
            onChange={(e) => handleBasicInfoChange('lastNameFurigana', e.target.value)}
            className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
              errors.lastNameFurigana ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
            }`}
            placeholder="やまだ"
          />
          {errors.lastNameFurigana && <p className="text-red-400 text-sm mt-1">{errors.lastNameFurigana}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            名（ふりがな） <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.basicInfo.firstNameFurigana}
            onChange={(e) => handleBasicInfoChange('firstNameFurigana', e.target.value)}
            className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
              errors.firstNameFurigana ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
            }`}
            placeholder="たろう"
          />
          {errors.firstNameFurigana && <p className="text-red-400 text-sm mt-1">{errors.firstNameFurigana}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            生年月日 <span className="text-red-400">*</span>
          </label>
          <DateDrumPicker
            value={formData.basicInfo.birthDay}
            onChange={(date) => handleBasicInfoChange('birthDay', date)}
            error={!!errors.birthDay}
            minYear={1900}
            maxYear={new Date().getFullYear()}
          />
          {errors.birthDay && <p className="text-red-400 text-sm mt-1">{errors.birthDay}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            性別 <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.basicInfo.gender}
            onChange={(e) => handleBasicInfoChange('gender', e.target.value)}
            className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
              errors.gender ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
            }`}
          >
            <option value="">選択してください</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
        </div>
      </div>
    </div>
  );
}
