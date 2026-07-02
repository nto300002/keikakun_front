import {
  FORM_OF_RESIDENCE_OPTIONS,
  MEANS_OF_TRANSPORTATION_OPTIONS,
} from './recipientFormOptions';
import type { RecipientFormSectionBaseProps } from './recipientFormSectionProps';

export default function ContactSection({
  formData,
  errors,
  handleContactAddressChange,
}: Pick<RecipientFormSectionBaseProps, 'formData' | 'errors' | 'handleContactAddressChange'>) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-4">連絡先・住所情報</h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
          住所 <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.contactAddress.address}
          onChange={(e) => handleContactAddressChange('address', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
            errors.address ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
          }`}
          placeholder="例：東京都新宿区西新宿1-1-1"
        />
        {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
          居住形態 <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.contactAddress.formOfResidence}
          onChange={(e) => handleContactAddressChange('formOfResidence', e.target.value)}
          className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
            errors.formOfResidence ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
          }`}
        >
          <option value="">選択してください</option>
          {FORM_OF_RESIDENCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.formOfResidence && <p className="text-red-400 text-sm mt-1">{errors.formOfResidence}</p>}
      </div>

      {formData.contactAddress.formOfResidence === 'other' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">その他詳細</label>
          <input
            type="text"
            value={formData.contactAddress.formOfResidenceOtherText || ''}
            onChange={(e) => handleContactAddressChange('formOfResidenceOtherText', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border border-slate-300 dark:border-[#2a3441] rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            placeholder="詳細を入力してください"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
          交通手段 <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.contactAddress.meansOfTransportation}
          onChange={(e) => handleContactAddressChange('meansOfTransportation', e.target.value)}
          className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
            errors.meansOfTransportation ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
          }`}
        >
          <option value="">選択してください</option>
          {MEANS_OF_TRANSPORTATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.meansOfTransportation && <p className="text-red-400 text-sm mt-1">{errors.meansOfTransportation}</p>}
      </div>

      {formData.contactAddress.meansOfTransportation === 'other' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">その他詳細</label>
          <input
            type="text"
            value={formData.contactAddress.meansOfTransportationOtherText || ''}
            onChange={(e) => handleContactAddressChange('meansOfTransportationOtherText', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border border-slate-300 dark:border-[#2a3441] rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            placeholder="詳細を入力してください"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
          電話番号 <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          value={formData.contactAddress.tel}
          onChange={(e) => handleContactAddressChange('tel', e.target.value)}
          className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
            errors.tel ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
          }`}
          placeholder="例：090-1234-5678"
        />
        {errors.tel && <p className="text-red-400 text-sm mt-1">{errors.tel}</p>}
      </div>
    </div>
  );
}
