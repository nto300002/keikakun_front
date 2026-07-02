'use client';

import { CalendarConnectionStatus, OfficeCalendarAccount } from '@/types/calendar';

interface GoogleIntegrationTabProps {
  calendarFile: File | null;
  calendarId: string;
  existingCalendar: OfficeCalendarAccount | null;
  isLoadingCalendar: boolean;
  loadCalendarError: string | null;
  uploadError: string | null;
  uploadSuccess: string | null;
  deleteError: string | null;
  deleteSuccess: string | null;
  isUploading: boolean;
  showDeleteConfirm: boolean;
  isDeleting: boolean;
  onCalendarIdChange: (calendarId: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCalendarSubmit: () => void;
  onCalendarDelete: () => void;
  onShowDeleteConfirmChange: (show: boolean) => void;
  getConnectionStatusLabel: (status: CalendarConnectionStatus) => string;
  getConnectionStatusColor: (status: CalendarConnectionStatus) => string;
}

export default function GoogleIntegrationTab({
  calendarFile,
  calendarId,
  existingCalendar,
  isLoadingCalendar,
  loadCalendarError,
  uploadError,
  uploadSuccess,
  deleteError,
  deleteSuccess,
  isUploading,
  showDeleteConfirm,
  isDeleting,
  onCalendarIdChange,
  onFileChange,
  onCalendarSubmit,
  onCalendarDelete,
  onShowDeleteConfirmChange,
  getConnectionStatusLabel,
  getConnectionStatusColor,
}: GoogleIntegrationTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">連携</h2>

      <div className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Google カレンダー</h3>
        <p className="text-slate-600 mb-4 dark:text-gray-400">
          Google Calendarへの通知はGoogle Consoleから設定します 詳しくは下記を参照してください
        </p>

        <div className="mb-4">
          <a
            href="https://www.youtube.com/watch?v=xAXWnT_kP2g"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Google Calendar設定方法
          </a>
        </div>

        {isLoadingCalendar && (
          <div className="mb-4 p-4 bg-slate-100 border border-slate-300 rounded-lg flex dark:bg-gray-700 dark:border-gray-600 items-center">
            <SpinnerIcon className="animate-spin h-5 w-5 text-blue-400 mr-3" />
            <p className="text-slate-600 text-base font-semibold dark:text-gray-400">設定を読み込み中...</p>
          </div>
        )}

        {loadCalendarError && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-400 text-base font-semibold">設定の読み込みエラー</p>
            <p className="text-red-400 text-base font-semibold mt-1">{loadCalendarError}</p>
          </div>
        )}

        {existingCalendar && !isLoadingCalendar && (
          <div className="mb-6 p-4 bg-slate-100 border border-slate-300 rounded-lg dark:bg-gray-700 dark:border-gray-600">
            <h4 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              現在の設定
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-slate-600 text-base font-semibold dark:text-gray-400">接続ステータス</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-lg text-base font-semibold border ${getConnectionStatusColor(existingCalendar.connection_status)}`}>
                  {getConnectionStatusLabel(existingCalendar.connection_status)}
                </span>
              </div>
              {existingCalendar.google_calendar_id && (
                <div>
                  <p className="text-slate-600 text-base font-semibold dark:text-gray-400">カレンダー ID</p>
                  <p className="text-slate-900 font-mono text-base font-semibold dark:text-white mt-1 break-all">{existingCalendar.google_calendar_id}</p>
                </div>
              )}
              {existingCalendar.service_account_email && (
                <div>
                  <p className="text-slate-600 text-base font-semibold dark:text-gray-400">サービスアカウント</p>
                  <p className="text-slate-900 font-mono text-base font-semibold dark:text-white mt-1 break-all">{existingCalendar.service_account_email}</p>
                </div>
              )}
              {existingCalendar.calendar_name && (
                <div>
                  <p className="text-slate-600 text-base font-semibold dark:text-gray-400">カレンダー名</p>
                  <p className="text-slate-900 text-base font-semibold dark:text-white mt-1">{existingCalendar.calendar_name}</p>
                </div>
              )}
              {existingCalendar.last_sync_at && (
                <div>
                  <p className="text-slate-600 text-base font-semibold dark:text-gray-400">最終同期日時</p>
                  <p className="text-slate-900 text-base font-semibold dark:text-white mt-1">{new Date(existingCalendar.last_sync_at).toLocaleString('ja-JP')}</p>
                </div>
              )}
              {existingCalendar.last_error_message && (
                <div>
                  <p className="text-red-400 text-base font-semibold">最後のエラー</p>
                  <p className="text-red-300 text-base font-semibold mt-1">{existingCalendar.last_error_message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-400 text-base font-semibold">アップロードエラー</p>
            <p className="text-red-400 text-base font-semibold mt-1">{uploadError}</p>
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
            <p className="text-green-400 text-base">{uploadSuccess}</p>
          </div>
        )}

        {deleteError && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-400 text-base font-semibold">削除エラー</p>
            <p className="text-red-400 text-base font-semibold mt-1">{deleteError}</p>
          </div>
        )}

        {deleteSuccess && (
          <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
            <p className="text-green-400 text-base">{deleteSuccess}</p>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-xl font-semibold mb-3">
            {existingCalendar ? '設定を更新' : '新規設定'}
          </h4>

          <div>
            <label className="block text-slate-600 text-base font-semibold dark:text-gray-400 mb-2">
              カレンダー ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={calendarId}
              onChange={(event) => onCalendarIdChange(event.target.value)}
              placeholder="example@group.calendar.google.com"
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 placeholder-slate-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
            />
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-gray-500">
              Googleカレンダーの設定から取得できます
            </p>
          </div>

          <div>
            <label className="block text-slate-600 text-base font-semibold dark:text-gray-400 mb-2">
              サービスアカウント JSON ファイル <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              accept=".json"
              onChange={onFileChange}
              className="w-full text-slate-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {calendarFile && (
              <p className="mt-2 text-base font-semibold text-green-400">
                選択済み: {calendarFile.name}
              </p>
            )}
            {existingCalendar && !calendarFile && (
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-gray-500">
                既存の認証情報が設定されています。変更する場合のみファイルを選択してください。
              </p>
            )}
          </div>

          <button
            onClick={onCalendarSubmit}
            disabled={!calendarFile || !calendarId || isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
          >
            {isUploading ? (
              <>
                <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                アップロード中...
              </>
            ) : existingCalendar ? (
              '設定を更新'
            ) : (
              'アップロード'
            )}
          </button>
        </div>

        {existingCalendar && (
          <div className="mt-8 pt-6 border-t border-slate-300 dark:border-gray-700">
            <h4 className="text-xl font-semibold mb-3 text-red-400">カレンダー連携解除</h4>
            <p className="text-slate-600 text-base font-semibold dark:text-slate-600 mb-4 dark:text-gray-400">
              カレンダー連携を解除すると、今後のイベント同期が停止されます。この操作は元に戻せません。
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => onShowDeleteConfirmChange(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
              >
                連携解除
              </button>
            ) : (
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
                <p className="text-red-400 font-semibold mb-3">
                  本当にカレンダー連携を解除しますか？
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onCalendarDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                  >
                    {isDeleting ? (
                      <>
                        <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        解除中...
                      </>
                    ) : (
                      '解除を実行'
                    )}
                  </button>
                  <button
                    onClick={() => onShowDeleteConfirmChange(false)}
                    disabled={isDeleting}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white px-4 py-2 rounded-lg disabled:cursor-not-allowed"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
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
