import assert from 'node:assert/strict';
import test from 'node:test';
import type { InquiryFullResponse } from '../../../../types/inquiry';
import { getReplyInquiryInfo } from './newInquiriesTab.helpers';

function buildInquiry(overrides: Partial<InquiryFullResponse> = {}): InquiryFullResponse {
  return {
    id: 'inquiry-1',
    message: {
      id: 'message-1',
      title: '実際の問い合わせ件名',
      content: '問い合わせ本文',
      created_at: '2026-07-02T00:00:00Z',
    },
    inquiry_detail: {
      id: 'detail-1',
      sender_name: '問い合わせ 太郎',
      sender_email: 'sender@example.com',
      ip_address: null,
      user_agent: null,
      status: 'new',
      priority: 'normal',
      assigned_staff_id: null,
      admin_notes: null,
      delivery_log: null,
      created_at: '2026-07-02T00:00:00Z',
      updated_at: '2026-07-02T00:00:00Z',
    },
    assigned_staff: null,
    reply_history: null,
    ...overrides,
  };
}

test('getReplyInquiryInfo passes actual inquiry title and sender email to reply modal', () => {
  assert.deepEqual(getReplyInquiryInfo(buildInquiry()), {
    inquiryId: 'inquiry-1',
    inquiryTitle: '実際の問い合わせ件名',
    senderEmail: 'sender@example.com',
  });
});

test('getReplyInquiryInfo keeps senderEmail null when inquiry has no email', () => {
  const inquiry = buildInquiry({
    inquiry_detail: {
      ...buildInquiry().inquiry_detail,
      sender_email: null,
    },
  });

  assert.deepEqual(getReplyInquiryInfo(inquiry), {
    inquiryId: 'inquiry-1',
    inquiryTitle: '実際の問い合わせ件名',
    senderEmail: null,
  });
});
