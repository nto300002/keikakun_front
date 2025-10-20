'use client';

import { useState, useEffect } from 'react';
import { calendarApi } from '@/lib/calendar';
import { OfficeCalendarAccount, CalendarConnectionStatus } from '@/types/calendar';
import { authApi } from '@/lib/auth';

interface CalendarLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarAccount: OfficeCalendarAccount | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Googleカレンダー連携モーダル
 */
function CalendarLinkModal({
  isOpen,
  onClose,
  calendarAccount,
  isLoading,
  error,
}: CalendarLinkModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1f2e] border border-[#2a3441] rounded-xl w-full max-w-lg animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b border-[#2a3441]">
          <div>
            <h3 className="text-lg font-semibold text-white">Googleカレンダー連携</h3>
            <p className="text-sm text-[#9ca3af] mt-1">サービスアカウントを使ってカレンダーと同期します。</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
            </div>
          ) : error ? (
            <div className="bg-[#ef4444]/10 border border-[#ef4444] rounded-lg p-4">
              <p className="text-[#ef4444] text-sm">エラー: {error}</p>
            </div>
          ) : calendarAccount ? (
            <div className="space-y-4">
              {/* ステータス */}
              <div className="bg-[#0f1419] border border-[#2a3441] rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {calendarAccount.connection_status === CalendarConnectionStatus.CONNECTED
                      ? '✓'
                      : calendarAccount.connection_status === CalendarConnectionStatus.ERROR
                      ? '⚠️'
                      : '⏳'}
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium">
                      ステータス: {' '}
                      {calendarAccount.connection_status === CalendarConnectionStatus.CONNECTED
                        ? '接続済み'
                        : calendarAccount.connection_status === CalendarConnectionStatus.ERROR
                        ? 'エラー'
                        : calendarAccount.connection_status === CalendarConnectionStatus.SYNCING
                        ? '同期中'
                        : '未接続'}
                    </p>
                    {calendarAccount.last_sync_at && (
                      <p className="text-xs text-[#9ca3af] mt-1">
                        最終同期: {new Date(calendarAccount.last_sync_at).toLocaleString('ja-JP')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* カレンダー情報 */}
              <div className="bg-[#0f1419] border border-[#2a3441] rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#9ca3af] mb-1">カレンダー名</p>
                    <p className="text-white text-sm font-medium">
                      {calendarAccount.calendar_name || '未設定'}
                    </p>
                  </div>

                  {calendarAccount.service_account_email && (
                    <div>
                      <p className="text-xs text-[#9ca3af] mb-1">サービスアカウント</p>
                      <p className="text-white text-sm font-mono break-all">
                        {calendarAccount.service_account_email}
                      </p>
                    </div>
                  )}

                  {calendarAccount.calendar_url && (
                    <div>
                      <p className="text-xs text-[#9ca3af] mb-1">カレンダーURL</p>
                      <a
                        href={calendarAccount.calendar_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00bcd4] hover:underline text-sm break-all flex items-center gap-2"
                      >
                        <span>カレンダーを開く</span>
                        <span className="text-xs">↗</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* エラー詳細 */}
              {calendarAccount.last_error_message && (
                <div className="bg-[#ef4444]/10 border border-[#ef4444] rounded-lg p-4">
                  <p className="text-xs text-[#9ca3af] mb-1">エラー詳細</p>
                  <p className="text-[#ef4444] text-sm">{calendarAccount.last_error_message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b] rounded-lg p-4">
              <p className="text-[#f59e0b] text-sm">
                カレンダーが設定されていません。管理者画面で連携を行ってください。
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#2a3441]">
          <button
            onClick={onClose}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}


export default function CalendarLinkButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calendarAccount, setCalendarAccount] = useState<OfficeCalendarAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [officeId, setOfficeId] = useState<string | null>(null);

  // ユーザーの office ID を取得
  useEffect(() => {
    const fetchOfficeId = async () => {
      try {
        const user = await authApi.getCurrentUser();
        const id = user.office?.id ?? null;
        if (id) {
          setOfficeId(id);
        }
      } catch (err) {
        console.error('Failed to fetch user office:', err);
      }
    };

    fetchOfficeId();
  }, []);

  // モーダルを開いたときにオフィスのカレンダー情報を取得
  useEffect(() => {
    if (isModalOpen && officeId) {
      const fetchCalendarInfo = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const account = await calendarApi.getOfficeCalendar(officeId);
          setCalendarAccount(account);
        } catch (err) {
          console.error('Failed to fetch calendar info:', err);
          setError('カレンダー情報の取得に失敗しました。しばらくしてから再度お試しください。');
          setCalendarAccount(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCalendarInfo();
    }
  }, [isModalOpen, officeId]);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-r from-[#4285f4] to-[#34a853] hover:from-[#3367d6] hover:to-[#2d8a44] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 w-full md:w-auto justify-center md:justify-start"
      >
        <span className="text-xl">📅</span>
        <span className="hidden sm:inline">Googleカレンダー連携</span>
        <span className="sm:hidden">カレンダー</span>
      </button>

      <CalendarLinkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        calendarAccount={calendarAccount}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
