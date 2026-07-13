'use client';

import { useState } from 'react';
import { StaffResponse } from '@/types/staff';
import { MdAdminPanelSettings } from 'react-icons/md';
import { FaHistory, FaEnvelope, FaCheckCircle, FaBullhorn, FaBuilding } from 'react-icons/fa';
import AuditLogTab from './tabs/AuditLogTab';
import InquiriesTab from './tabs/InquiriesTab';
import ApprovalRequestsTab from './tabs/ApprovalRequestsTab';
import AnnouncementsTab from './tabs/AnnouncementsTab';
import OfficesTab from './tabs/OfficesTab';
import {
  APP_ADMIN_TABS,
  getAppAdminPanelId,
  selectAppAdminTab,
  type AppAdminTabId,
} from './appAdminTabs';

interface AppAdminDashboardProps {
  staff: StaffResponse;
}

export default function AppAdminDashboard({ staff }: AppAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AppAdminTabId>('logs');
  const activePanelId = getAppAdminPanelId(activeTab);

  const tabIcons: Record<AppAdminTabId, React.ReactNode> = {
    logs: <FaHistory className="w-4 h-4" />,
    inquiries: <FaEnvelope className="w-4 h-4" />,
    approvals: <FaCheckCircle className="w-4 h-4" />,
    announcements: <FaBullhorn className="w-4 h-4" />,
    offices: <FaBuilding className="w-4 h-4" />,
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
          {APP_ADMIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab((currentTab) => selectAppAdminTab(currentTab, tab.id))}
              className={`flex items-center gap-2 px-6 py-3 text-base font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500 dark:bg-gray-900 dark:text-purple-400'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50'
              }`}
            >
              {tabIcons[tab.id]}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* タブコンテンツ */}
      <main className="p-6">
        {activeTab === 'logs' && <div data-testid={activePanelId}><AuditLogTab /></div>}
        {activeTab === 'inquiries' && <div data-testid={activePanelId}><InquiriesTab /></div>}
        {activeTab === 'approvals' && <div data-testid={activePanelId}><ApprovalRequestsTab /></div>}
        {activeTab === 'announcements' && <div data-testid={activePanelId}><AnnouncementsTab /></div>}
        {activeTab === 'offices' && <div data-testid={activePanelId}><OfficesTab /></div>}
      </main>
    </div>
  );
}
