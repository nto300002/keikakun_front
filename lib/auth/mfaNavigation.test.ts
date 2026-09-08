import assert from 'node:assert/strict';
import test from 'node:test';

import { getPostMfaRoute } from './mfaNavigation';

test('アプリ管理者はMFA完了後に管理コンソールへ遷移する', () => {
  assert.equal(
    getPostMfaRoute({ role: 'app_admin', hasOffice: false }),
    '/app-admin',
  );
});

test('事務所未所属の一般スタッフは事務所選択へ遷移する', () => {
  assert.equal(
    getPostMfaRoute({ role: 'employee', hasOffice: false }),
    '/auth/select-office',
  );
});

test('事務所所属スタッフとownerはダッシュボードへ遷移する', () => {
  assert.equal(
    getPostMfaRoute({ role: 'manager', hasOffice: true }),
    '/dashboard',
  );
  assert.equal(
    getPostMfaRoute({ role: 'owner', hasOffice: false }),
    '/dashboard',
  );
});
