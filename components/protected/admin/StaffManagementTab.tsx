'use client';

import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { MdCancel, MdCheckCircle, MdDelete } from 'react-icons/md';
import { StaffResponse } from '@/types/staff';

interface StaffManagementTabProps {
  officeStaffs: StaffResponse[];
  isLoadingStaffs: boolean;
  loadStaffsError: string | null;
  staffMfaTogglingId: string | null;
  staffDeletingId: string | null;
  isBulkMfaProcessing: boolean;
  bulkMfaError: string | null;
  bulkMfaSuccess: string | null;
  showBulkMfaResultModal: boolean;
  onBulkEnableMfa: () => void;
  onBulkDisableMfa: () => void;
  onStaffMfaEnable: (staff: StaffResponse) => void;
  onStaffMfaDisable: (staff: StaffResponse) => void;
  onStaffDelete: (staff: StaffResponse) => void;
  calculateRemainingDays: (deletedAt: string | null) => number;
  getRoleBadgeColor: (role: string) => string;
  getRoleLabel: (role: string) => string;
}

export default function StaffManagementTab({
  officeStaffs,
  isLoadingStaffs,
  loadStaffsError,
  staffMfaTogglingId,
  staffDeletingId,
  isBulkMfaProcessing,
  bulkMfaError,
  bulkMfaSuccess,
  showBulkMfaResultModal,
  onBulkEnableMfa,
  onBulkDisableMfa,
  onStaffMfaEnable,
  onStaffMfaDisable,
  onStaffDelete,
  calculateRemainingDays,
  getRoleBadgeColor,
  getRoleLabel,
}: StaffManagementTabProps) {
  return (
    <div className="bg-white p-6 rounded-lg mb-6 border border-slate-300 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold">事務所スタッフ管理</h3>
          <span className="text-slate-600 text-base font-semibold dark:text-gray-400">
            {officeStaffs.length}名
          </span>

          <div className="group relative">
            <button className="text-blue-400 hover:text-blue-300 text-base font-semibold flex items-center gap-1 transition-colors">
              <AiOutlineQuestionCircle className="h-5 w-5" />
              <span className="underline">QRコードを紛失した場合</span>
            </button>
            <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-slate-300 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="flex items-start gap-2">
                <AiOutlineQuestionCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mb-2">QRコード紛失時の対処法</p>
                  <ol className="text-base text-slate-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
                    <li>対象スタッフの２段階認証を一度無効化する</li>
                    <li>再度２段階認証を有効化する</li>
                    <li>新しいQRコードとシークレットキーが発行される</li>
                    <li>スタッフに新しいQRコードを共有する</li>
                  </ol>
                  <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-3">
                    ⚠️ 無効化すると、既存のTOTPアプリの設定は使用できなくなります。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBulkEnableMfa}
            disabled={isBulkMfaProcessing || isLoadingStaffs}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-base font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isBulkMfaProcessing ? (
              <>
                <SpinnerIcon />
                処理中...
              </>
            ) : (
              <>
                <MdCheckCircle className="w-5 h-5" />
                全員２段階認証有効化
              </>
            )}
          </button>
          <button
            onClick={onBulkDisableMfa}
            disabled={isBulkMfaProcessing || isLoadingStaffs}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-base font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isBulkMfaProcessing ? (
              <>
                <SpinnerIcon />
                処理中...
              </>
            ) : (
              <>
                <MdCancel className="w-5 h-5" />
                全員２段階認証無効化
              </>
            )}
          </button>
        </div>
      </div>

      {bulkMfaError && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-400 text-base font-semibold">エラー</p>
          <p className="text-red-400 text-base font-semibold mt-1">{bulkMfaError}</p>
        </div>
      )}

      {bulkMfaSuccess && !showBulkMfaResultModal && (
        <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
          <p className="text-green-400 text-base font-semibold">成功</p>
          <p className="text-green-400 text-base font-semibold mt-1">{bulkMfaSuccess}</p>
        </div>
      )}

      {isLoadingStaffs && (
        <div className="p-4 bg-slate-100 border border-slate-300 rounded-lg flex dark:bg-gray-700 dark:border-gray-600 items-center">
          <SpinnerIcon className="h-5 w-5 text-blue-400 mr-3" />
          <p className="text-slate-600 text-base font-semibold dark:text-gray-400">スタッフ一覧を読み込み中...</p>
        </div>
      )}

      {loadStaffsError && !isLoadingStaffs && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-400 text-base font-semibold">読み込みエラー</p>
          <p className="text-red-400 text-base font-semibold mt-1">{loadStaffsError}</p>
        </div>
      )}

      {!isLoadingStaffs && !loadStaffsError && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-300 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-slate-600 dark:text-gray-400 font-semibold">氏名</th>
                <th className="text-left py-3 px-4 text-slate-600 dark:text-gray-400 font-semibold">メールアドレス</th>
                <th className="text-left py-3 px-4 text-slate-600 dark:text-gray-400 font-semibold">役割</th>
                <th className="text-left py-3 px-4 text-slate-600 dark:text-gray-400 font-semibold">
                  <div className="flex items-center gap-2">
                    ２段階認証状態/変更
                    <div className="relative group/help">
                      <button
                        type="button"
                        className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-gray-700/50 dark:hover:bg-gray-600/70 dark:text-gray-300 flex items-center justify-center text-sm font-bold transition-colors"
                        title="２段階認証について"
                      >
                        ?
                      </button>
                      <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-slate-300 dark:bg-gray-900 dark:border-gray-700 rounded-lg p-4 shadow-xl opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all duration-200 z-50">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-base font-semibold text-slate-900 dark:text-white mb-2">２段階認証とは</p>
                            <p className="text-base text-slate-700 dark:text-gray-300 leading-relaxed mb-3">
                              ２段階認証は、パスワードに加えて、スマートフォンアプリで生成される6桁の認証コードを使用する認証方式です。
                            </p>
                            <ul className="text-base text-slate-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                              <li>セキュリティが大幅に向上します</li>
                              <li>Google Authenticatorなどのアプリが必要です</li>
                              <li>ログイン時に追加の認証コード入力が必要になります</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-slate-600 dark:text-gray-400 font-semibold">スタッフ削除</th>
              </tr>
            </thead>
            <tbody>
              {officeStaffs.map((staff) => {
                const isDeleted = staff.is_deleted;
                const remainingDays = isDeleted ? calculateRemainingDays(staff.deleted_at) : 0;

                return (
                  <tr key={staff.id} className={`border-b border-slate-300 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-700/50 ${isDeleted ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={isDeleted ? 'text-slate-500 dark:text-gray-500 line-through' : 'text-slate-900 dark:text-white'}>
                          {staff.full_name}
                        </span>
                        {isDeleted && (
                          <span className="px-2 py-1 rounded-lg text-sm font-semibold bg-red-900/50 text-red-400 border border-red-500">
                            削除済み - 残り{remainingDays}日で完全削除
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-gray-300">{staff.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex min-w-20 justify-center rounded border px-3 py-1 text-base font-semibold ${getRoleBadgeColor(staff.role)}`}
                      >
                        {getRoleLabel(staff.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 group">
                        <span
                          className={`inline-flex min-w-20 justify-center rounded border px-3 py-1 text-base font-semibold items-center gap-1 ${
                            staff.is_mfa_enabled
                              ? 'border-green-500 text-green-700 dark:text-green-300'
                              : 'border-slate-400 text-slate-600 dark:border-gray-500 dark:text-gray-300'
                          }`}
                        >
                          {staff.is_mfa_enabled ? (
                            <>
                              <MdCheckCircle className="w-4 h-4" />
                              有効
                            </>
                          ) : (
                            <>
                              <MdCancel className="w-4 h-4" />
                              無効
                            </>
                          )}
                        </span>
                        {staff.is_mfa_enabled ? (
                          <button
                            onClick={() => onStaffMfaDisable(staff)}
                            disabled={staffMfaTogglingId === staff.id || isDeleted}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-base font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {staffMfaTogglingId === staff.id ? (
                              <>
                                <SpinnerIcon />
                                処理中...
                              </>
                            ) : (
                              '無効化'
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => onStaffMfaEnable(staff)}
                            disabled={staffMfaTogglingId === staff.id || isDeleted}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-base font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {staffMfaTogglingId === staff.id ? (
                              <>
                                <SpinnerIcon />
                                処理中...
                              </>
                            ) : (
                              '有効化'
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isDeleted ? (
                        <span className="text-slate-500 dark:text-gray-500 text-base">削除済み</span>
                      ) : (
                        <button
                          onClick={() => onStaffDelete(staff)}
                          disabled={staffDeletingId === staff.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-base font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {staffDeletingId === staff.id ? (
                            <>
                              <SpinnerIcon />
                              削除中...
                            </>
                          ) : (
                            <>
                              <MdDelete className="w-4 h-4" />
                              削除
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SpinnerIcon({ className = 'animate-spin h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
