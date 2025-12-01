'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StaffResponse } from '@/types/staff';
import { authApi } from '@/lib/auth';
import { MdAdminPanelSettings, MdLogout } from 'react-icons/md';
import { FaHistory, FaEnvelope, FaCheckCircle, FaBullhorn, FaBuilding } from 'react-icons/fa';
import AuditLogTab from './tabs/AuditLogTab';
import InquiriesTab from './tabs/InquiriesTab';
import ApprovalRequestsTab from './tabs/ApprovalRequestsTab';
import AnnouncementsTab from './tabs/AnnouncementsTab';
import OfficesTab from './tabs/OfficesTab';

interface AppAdminDashboardProps {
  staff: StaffResponse;
}

type TabType = 'logs' | 'inquiries' | 'approvals' | 'announcements' | 'offices';

export default function AppAdminDashboard({ staff }: AppAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('logs');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
      router.push('/auth/app-admin/login');
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'logs', label: 'ログ', icon: <FaHistory className="w-4 h-4" /> },
    { id: 'inquiries', label: '問い合わせ', icon: <FaEnvelope className="w-4 h-4" /> },
    { id: 'approvals', label: '承認リクエスト', icon: <FaCheckCircle className="w-4 h-4" /> },
    { id: 'announcements', label: 'お知らせ', icon: <FaBullhorn className="w-4 h-4" /> },
    { id: 'offices', label: '事務所', icon: <FaBuilding className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* ヘッダー */}
      <header className="bg-gray-800 border-b border-purple-500/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MdAdminPanelSettings className="h-8 w-8 text-purple-500" />
            <div>
              <h1 className="text-xl font-bold text-white">アプリ管理コンソール</h1>
              <p className="text-sm text-gray-400">ケイカくん管理者向けダッシュボード</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white">{staff.full_name}</p>
              <p className="text-xs text-purple-400">アプリ管理者</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <MdLogout className="w-5 h-5" />
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
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
      </main>
    </div>
  );
}
