'use client';

import { OfficeTypeValue } from '@/types/office';

interface OfficeEditModalProps {
  officeName: string;
  officeType: OfficeTypeValue;
  officeAddress: string;
  officePhoneNumber: string;
  officeEmail: string;
  isSavingOffice: boolean;
  saveOfficeError: string | null;
  saveOfficeSuccess: string | null;
  onOfficeNameChange: (value: string) => void;
  onOfficeTypeChange: (value: OfficeTypeValue) => void;
  onOfficeAddressChange: (value: string) => void;
  onOfficePhoneNumberChange: (value: string) => void;
  onOfficeEmailChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function OfficeEditModal({
  officeName,
  officeType,
  officeAddress,
  officePhoneNumber,
  officeEmail,
  isSavingOffice,
  saveOfficeError,
  saveOfficeSuccess,
  onOfficeNameChange,
  onOfficeTypeChange,
  onOfficeAddressChange,
  onOfficePhoneNumberChange,
  onOfficeEmailChange,
  onClose,
  onSave,
}: OfficeEditModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 font-medium border border-slate-300 shadow-sm dark:bg-gray-800 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">事業所情報を編集</h3>

        {saveOfficeError && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-400 text-base font-semibold">エラー</p>
            <p className="text-red-400 text-base font-semibold mt-1">{saveOfficeError}</p>
          </div>
        )}

        {saveOfficeSuccess && (
          <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
            <p className="text-green-400 text-base">{saveOfficeSuccess}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-slate-600 text-base font-semibold dark:text-gray-400 mb-2">
              事業所名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={officeName}
              onChange={(event) => onOfficeNameChange(event.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
              placeholder="事業所名を入力"
              required
              minLength={1}
              maxLength={255}
              disabled={isSavingOffice}
            />
          </div>

          <div>
            <label className="block text-slate-600 text-base font-semibold dark:text-gray-400 mb-2">事業所種別</label>
            <select
              value={officeType}
              onChange={(event) => onOfficeTypeChange(event.target.value as OfficeTypeValue)}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
              disabled={isSavingOffice}
            >
              <option value="transition_to_employment">移行支援</option>
              <option value="type_A_office">就労A型</option>
              <option value="type_B_office">就労B型</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 text-base font-semibold dark:text-gray-400 mb-2">住所</label>
            <input
              type="text"
              value={officeAddress}
              onChange={(event) => onOfficeAddressChange(event.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
              placeholder="例: 東京都渋谷区1-2-3"
              maxLength={500}
              disabled={isSavingOffice}
            />
          </div>

          <div>
            <label className="block text-slate-600 text-base font-semibold dark:text-gray-400 mb-2">電話番号</label>
            <input
              type="tel"
              value={officePhoneNumber}
              onChange={(event) => onOfficePhoneNumberChange(event.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
              placeholder="例: 03-1234-5678"
              pattern="\d{2,4}-\d{2,4}-\d{4}"
              disabled={isSavingOffice}
            />
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-gray-500">
              形式: 03-1234-5678（ハイフン区切り）
            </p>
          </div>

          <div>
            <label className="block text-slate-600 text-base font-semibold dark:text-gray-400 mb-2">メールアドレス</label>
            <input
              type="email"
              value={officeEmail}
              onChange={(event) => onOfficeEmailChange(event.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500"
              placeholder="例: info@example.com"
              disabled={isSavingOffice}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSavingOffice}
            className="bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            onClick={onSave}
            disabled={isSavingOffice}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSavingOffice ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                保存中...
              </>
            ) : (
              '保存'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
