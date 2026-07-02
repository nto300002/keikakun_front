'use client';

import { MdEdit, MdExitToApp } from 'react-icons/md';
import { OfficeResponse } from '@/types/office';

interface OfficeInfoTabProps {
  office: OfficeResponse | null;
  withdrawalSuccess: string | null;
  onEditOffice: () => void;
  onOpenWithdrawal: () => void;
}

export default function OfficeInfoTab({
  office,
  withdrawalSuccess,
  onEditOffice,
  onOpenWithdrawal,
}: OfficeInfoTabProps) {
  return (
    <>
      <div className="bg-white p-6 rounded-lg mb-6 border border-slate-300 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">事業所情報</h3>
          <button
            onClick={onEditOffice}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <MdEdit className="w-5 h-5" />
            編集
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-slate-600 text-base font-semibold dark:text-gray-400">事業所名</p>
            <p className="text-slate-900 font-semibold dark:text-white">{office?.name || '未設定'}</p>
          </div>
          <div>
            <p className="text-slate-600 text-base font-semibold dark:text-gray-400">事業所種別</p>
            <p className="text-slate-900 font-semibold dark:text-white">
              {office?.office_type === 'transition_to_employment' && '移行支援'}
              {office?.office_type === 'type_A_office' && '就労A型'}
              {office?.office_type === 'type_B_office' && '就労B型'}
              {!office?.office_type && '未設定'}
            </p>
          </div>
          <div>
            <p className="text-slate-600 text-base font-semibold dark:text-gray-400">住所</p>
            <p className="text-slate-900 font-semibold dark:text-white">{office?.address || '未設定'}</p>
          </div>
          <div>
            <p className="text-slate-600 text-base font-semibold dark:text-gray-400">電話番号</p>
            <p className="text-slate-900 font-semibold dark:text-white">{office?.phone_number || '未設定'}</p>
          </div>
          <div>
            <p className="text-slate-600 text-base font-semibold dark:text-gray-400">メールアドレス</p>
            <p className="text-slate-900 font-semibold dark:text-white">{office?.email || '未設定'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg mt-6 border border-red-300 shadow-sm dark:bg-gray-800 dark:border-red-700/60">
        <div className="flex items-center gap-3 mb-4">
          <MdExitToApp className="w-6 h-6 text-red-600 dark:text-red-300" />
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-300">退会</h3>
        </div>

        {withdrawalSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg dark:bg-green-950/40 dark:border-green-700">
            <p className="text-green-700 text-base dark:text-green-300">{withdrawalSuccess}</p>
          </div>
        )}

        <p className="text-slate-600 mb-4 dark:text-gray-400 text-base">
          事務所を退会すると、事務所データと全スタッフのアカウントが削除されます。
          退会申請後、アプリ管理者による承認が必要です。
        </p>
        <button
          onClick={onOpenWithdrawal}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <MdExitToApp className="w-5 h-5" />
          退会を申請する
        </button>
      </div>
    </>
  );
}
