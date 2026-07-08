import assert from 'node:assert/strict';
import test from 'node:test';

import { APP_ADMIN_TABS, getAppAdminPanelId, selectAppAdminTab } from './appAdminTabs.ts';

test('app-admin dashboard exposes the main regression tabs', () => {
  assert.deepEqual(
    APP_ADMIN_TABS.map((tab) => tab.id),
    ['logs', 'inquiries', 'approvals', 'announcements', 'offices']
  );
  assert.deepEqual(
    APP_ADMIN_TABS.map((tab) => tab.label),
    ['ログ', '問い合わせ', '承認リクエスト', 'お知らせ', '事務所']
  );
});

test('app-admin tab click model switches to the matching panel', () => {
  let activeTab = 'logs';

  for (const tab of APP_ADMIN_TABS) {
    activeTab = selectAppAdminTab(activeTab, tab.id);
    assert.equal(activeTab, tab.id);
    assert.equal(getAppAdminPanelId(activeTab), `${tab.id}-panel`);
  }
});
