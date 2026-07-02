import { RELATIONSHIP_OPTIONS } from './recipientFormOptions';
import type {
  RecipientFormMode,
  RecipientFormSectionBaseProps,
} from './recipientFormSectionProps';

interface EmergencyContactsSectionProps
  extends Pick<RecipientFormSectionBaseProps, 'formData' | 'errors' | 'handleEmergencyContactChange'> {
  mode: RecipientFormMode;
  addEmergencyContact: () => void;
  removeEmergencyContact: (index: number) => void;
}

export default function EmergencyContactsSection({
  formData,
  errors,
  mode,
  addEmergencyContact,
  removeEmergencyContact,
  handleEmergencyContactChange,
}: EmergencyContactsSectionProps) {
  const isRegistration = mode === 'registration';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">緊急連絡先情報</h3>
        <button
          onClick={addEmergencyContact}
          disabled={formData.emergencyContacts.length >= 3}
          className="bg-[#10b981] hover:bg-[#0f9f6e] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + 連絡先を追加
        </button>
      </div>

      {formData.emergencyContacts.map((contact, index) => (
        <div key={index} className="border border-slate-300 dark:border-[#2a3441] rounded-lg p-6 relative">
          {formData.emergencyContacts.length > 1 && (
            <button
              onClick={() => removeEmergencyContact(index)}
              className="absolute top-4 right-4 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded text-sm transition-colors"
            >
              削除
            </button>
          )}

          <h4 className="text-md font-medium text-slate-900 dark:text-white mb-4">緊急連絡先 {index + 1}</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                姓 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={contact.lastName}
                onChange={(e) => handleEmergencyContactChange(index, 'lastName', e.target.value)}
                className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                  errors[`emergencyContact${index}LastName`] ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
                }`}
                placeholder="田中"
              />
              {errors[`emergencyContact${index}LastName`] && (
                <p className="text-red-400 text-sm mt-1">{errors[`emergencyContact${index}LastName`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={contact.firstName}
                onChange={(e) => handleEmergencyContactChange(index, 'firstName', e.target.value)}
                className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                  errors[`emergencyContact${index}FirstName`] ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
                }`}
                placeholder="花子"
              />
              {errors[`emergencyContact${index}FirstName`] && (
                <p className="text-red-400 text-sm mt-1">{errors[`emergencyContact${index}FirstName`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                姓（ふりがな） {isRegistration && <span className="text-red-400">*</span>}
              </label>
              <input
                type="text"
                value={contact.lastNameFurigana}
                onChange={(e) => handleEmergencyContactChange(index, 'lastNameFurigana', e.target.value)}
                className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                  isRegistration && errors[`emergencyContact${index}LastNameFurigana`]
                    ? 'border-red-500'
                    : 'border-slate-300 dark:border-[#2a3441]'
                }`}
                placeholder="たなか"
              />
              {isRegistration && errors[`emergencyContact${index}LastNameFurigana`] && (
                <p className="text-red-400 text-sm mt-1">{errors[`emergencyContact${index}LastNameFurigana`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                名（ふりがな） {isRegistration && <span className="text-red-400">*</span>}
              </label>
              <input
                type="text"
                value={contact.firstNameFurigana}
                onChange={(e) => handleEmergencyContactChange(index, 'firstNameFurigana', e.target.value)}
                className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                  isRegistration && errors[`emergencyContact${index}FirstNameFurigana`]
                    ? 'border-red-500'
                    : 'border-slate-300 dark:border-[#2a3441]'
                }`}
                placeholder="はなこ"
              />
              {isRegistration && errors[`emergencyContact${index}FirstNameFurigana`] && (
                <p className="text-red-400 text-sm mt-1">{errors[`emergencyContact${index}FirstNameFurigana`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">続柄・関係性</label>
              <select
                value={contact.relationship}
                onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border border-slate-300 dark:border-[#2a3441] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              >
                <option value="">選択してください</option>
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                電話番号 <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={contact.tel}
                onChange={(e) => handleEmergencyContactChange(index, 'tel', e.target.value)}
                className={`w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] ${
                  errors[`emergencyContact${index}Tel`] ? 'border-red-500' : 'border-slate-300 dark:border-[#2a3441]'
                }`}
                placeholder="例：090-1234-5678"
              />
              {errors[`emergencyContact${index}Tel`] && (
                <p className="text-red-400 text-sm mt-1">{errors[`emergencyContact${index}Tel`]}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">住所</label>
            <input
              type="text"
              value={contact.address || ''}
              onChange={(e) => handleEmergencyContactChange(index, 'address', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border border-slate-300 dark:border-[#2a3441] rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              placeholder="住所（任意）"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">備考</label>
            <textarea
              value={contact.notes || ''}
              onChange={(e) => handleEmergencyContactChange(index, 'notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-[#1a1f2e] border border-slate-300 dark:border-[#2a3441] rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              placeholder="備考（任意）"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
