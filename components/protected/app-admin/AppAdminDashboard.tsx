'use client';

import { useState } from 'react';
import { StaffResponse } from '@/types/staff';
import { http } from '@/lib/http';
import { MdAdminPanelSettings } from 'react-icons/md';
import { FaHistory, FaEnvelope, FaCheckCircle, FaBullhorn, FaBuilding, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import AuditLogTab from './tabs/AuditLogTab';
import InquiriesTab from './tabs/InquiriesTab';
import ApprovalRequestsTab from './tabs/ApprovalRequestsTab';
import AnnouncementsTab from './tabs/AnnouncementsTab';
import OfficesTab from './tabs/OfficesTab';

interface AppAdminDashboardProps {
  staff: StaffResponse;
}

type TabType = 'logs' | 'inquiries' | 'approvals' | 'announcements' | 'offices' | 'security';

export default function AppAdminDashboard({ staff }: AppAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('logs');
  const [isMfaEnabled, setIsMfaEnabled] = useState(staff.is_mfa_enabled);
  const [isDisableFormOpen, setIsDisableFormOpen] = useState(false);
  const [mfaPassword, setMfaPassword] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [isDisablingMfa, setIsDisablingMfa] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'logs', label: 'ログ', icon: <FaHistory className="w-4 h-4" /> },
    { id: 'inquiries', label: '問い合わせ', icon: <FaEnvelope className="w-4 h-4" /> },
    { id: 'approvals', label: '承認申請', icon: <FaCheckCircle className="w-4 h-4" /> },
    { id: 'announcements', label: 'お知らせ', icon: <FaBullhorn className="w-4 h-4" /> },
    { id: 'offices', label: '事務所', icon: <FaBuilding className="w-4 h-4" /> },
    { id: 'security', label: 'セキュリティ', icon: <FaShieldAlt className="w-4 h-4" /> },
  ];

  const handleDisableMfa = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMfaError('');
    setIsDisablingMfa(true);

    try {
      await http.post('/api/v1/auth/mfa/disable', { password: mfaPassword });
      setIsMfaEnabled(false);
      setIsDisableFormOpen(false);
      setMfaPassword('');
    } catch (error: unknown) {
      setMfaError(error instanceof Error ? error.message : '2段階認証の無効化に失敗しました。');
    } finally {
      setIsDisablingMfa(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-semibold dark:bg-gray-900 dark:text-gray-200">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm dark:bg-gray-800 dark:border-purple-500/30 dark:shadow-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MdAdminPanelSettings className="h-8 w-8 text-purple-500" />
            <div>
              <h1 className="text-3xl font-bold text-slate-950 dark:text-white">アプリ管理コンソール</h1>
              <p className="text-base font-semibold text-slate-600 dark:text-gray-300">ケイカくん管理者向けダッシュボード</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-base font-semibold text-slate-950 dark:text-white">{staff.full_name}</p>
              <p className="text-base font-semibold text-purple-400">アプリ管理者</p>
            </div>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white border-b border-slate-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-base font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500 dark:bg-gray-900 dark:text-purple-400'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* タブコンテンツ */}
      <main className="p-6">
        {activeTab === 'logs' && <AuditLogTab />}
        {activeTab === 'inquiries' && <InquiriesTab />}
        {activeTab === 'approvals' && <ApprovalRequestsTab />}
        {activeTab === 'announcements' && <AnnouncementsTab />}
        {activeTab === 'offices' && <OfficesTab />}
        {activeTab === 'security' && (
          <section className="max-w-2xl border border-slate-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">2段階認証</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
              ログイン時に認証アプリのコードを追加で確認します。
            </p>
            {isMfaEnabled ? (
              <div className="mt-4">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  2段階認証は有効です。
                </p>
                {isDisableFormOpen ? (
                  <form onSubmit={handleDisableMfa} className="mt-4 max-w-md space-y-3 border-t border-slate-200 pt-4 dark:border-gray-700">
                    <label htmlFor="mfa-disable-password" className="block text-sm font-semibold text-slate-800 dark:text-gray-100">
                      パスワード
                    </label>
                    <input
                      id="mfa-disable-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={mfaPassword}
                      onChange={(event) => setMfaPassword(event.target.value)}
                      className="w-full border border-slate-300 bg-white px-3 py-2 text-slate-950 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                    {mfaError && <p className="text-sm text-red-600 dark:text-red-300">{mfaError}</p>}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isDisablingMfa}
                        className="bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDisablingMfa ? '無効化中...' : '無効化する'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDisableFormOpen(false);
                          setMfaPassword('');
                          setMfaError('');
                        }}
                        disabled={isDisablingMfa}
                        className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        キャンセル
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDisableFormOpen(true)}
                    className="mt-4 border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
                  >
                    2段階認証を無効化する
                  </button>
                )}
              </div>
            ) : (
              <Link
                href="/auth/mfa-setup"
                className="mt-5 inline-flex items-center gap-2 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <FaShieldAlt className="h-4 w-4" />
                2段階認証を設定する
              </Link>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
