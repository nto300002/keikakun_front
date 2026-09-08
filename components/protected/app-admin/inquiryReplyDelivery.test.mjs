import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getInquiryReplyDeliveryMessage,
  getInquiryReplyDeliveryMode,
} from './inquiryReplyDelivery.ts';

test('inquiry reply delivery copy distinguishes app inquiries from external email inquiries', () => {
  const appAndEmail = getInquiryReplyDeliveryMode('sender@example.com', 'staff-1');
  const emailOnly = getInquiryReplyDeliveryMode('guest@example.com', null);
  const appOnly = getInquiryReplyDeliveryMode(null, 'staff-1');

  assert.equal(appAndEmail, 'app_and_email');
  assert.equal(emailOnly, 'email_only');
  assert.equal(appOnly, 'app_only');
  assert.equal(getInquiryReplyDeliveryMessage(appAndEmail), '返信はアプリ内通知とメールの両方で送信されます。');
  assert.equal(getInquiryReplyDeliveryMessage(emailOnly), '返信はメールで送信されます。');
  assert.equal(getInquiryReplyDeliveryMessage(appOnly), '送信者のメールアドレスが未設定のため、アプリ内通知のみ送信されます。');
});
