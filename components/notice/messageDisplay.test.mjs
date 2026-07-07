import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getMessageDisplayMeta,
  getMessageSenderLabel,
  getNoticeTabLabel,
  getProfileFeedbackLabel,
} from './messageDisplay.ts';

function buildMessage(overrides = {}) {
  return {
    message_id: 'message-1',
    message_type: 'personal',
    priority: 'normal',
    title: '件名',
    content: '本文',
    sender_staff_id: 'staff-1',
    sender: {
      id: 'staff-1',
      username: 'sender',
      email: 'sender@example.com',
      first_name: '太郎',
      last_name: '送信',
    },
    is_read: false,
    read_at: null,
    is_archived: false,
    created_at: '2026-07-07T00:00:00Z',
    updated_at: '2026-07-07T00:00:00Z',
    ...overrides,
  };
}

test('announcement messages are displayed as notices, not other messages', () => {
  const meta = getMessageDisplayMeta('announcement', 'normal');

  assert.equal(meta.label, 'お知らせ');
  assert.equal(meta.tone, 'notice');
  assert.match(meta.badgeClassName, /purple|emerald|green/);
});

test('personal and fallback message styles are visually distinct', () => {
  const personal = getMessageDisplayMeta('personal', 'normal');
  const fallback = getMessageDisplayMeta('unknown', 'normal');

  assert.equal(personal.label, '個別');
  assert.equal(fallback.label, 'その他');
  assert.notEqual(personal.tone, fallback.tone);
  assert.notEqual(personal.badgeClassName, fallback.badgeClassName);
});

test('app admin announcements hide the sender identity', () => {
  const message = buildMessage({
    message_type: 'announcement',
    sender_staff_id: null,
    sender: {
      id: 'app-admin',
      username: 'app_admin',
      email: 'admin@example.com',
      first_name: '管理',
      last_name: '運営',
    },
  });

  assert.equal(getMessageSenderLabel(message), '送信者: 運営');
});

test('office personal messages keep the sender name', () => {
  const message = buildMessage();

  assert.equal(getMessageSenderLabel(message), '送信者: 送信 太郎');
});

test('feedback wording is unified as inquiries', () => {
  assert.equal(getNoticeTabLabel('feedback'), 'お問い合わせ');
  assert.equal(getProfileFeedbackLabel(), 'お問い合わせ');
});
