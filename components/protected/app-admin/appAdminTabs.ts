export type AppAdminTabId = 'logs' | 'inquiries' | 'approvals' | 'announcements' | 'offices';

export type AppAdminPanelId = `${AppAdminTabId}-panel`;

export const APP_ADMIN_TABS: { id: AppAdminTabId; label: string; panelId: AppAdminPanelId }[] = [
  { id: 'logs', label: 'ログ', panelId: 'logs-panel' },
  { id: 'inquiries', label: '問い合わせ', panelId: 'inquiries-panel' },
  { id: 'approvals', label: '承認リクエスト', panelId: 'approvals-panel' },
  { id: 'announcements', label: 'お知らせ', panelId: 'announcements-panel' },
  { id: 'offices', label: '事務所', panelId: 'offices-panel' },
];

export function selectAppAdminTab(_currentTab: AppAdminTabId, nextTab: AppAdminTabId): AppAdminTabId {
  return nextTab;
}

export function getAppAdminPanelId(activeTab: AppAdminTabId): AppAdminPanelId {
  const tab = APP_ADMIN_TABS.find((item) => item.id === activeTab);
  if (!tab) return 'logs-panel';
  return tab.panelId;
}
