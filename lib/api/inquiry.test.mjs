import assert from 'node:assert/strict';
import test from 'node:test';

import { buildInquiryReplyEndpoint, buildInquiryReplyPayload } from './inquiryReply.ts';

test('inquiry reply client helpers use the canonical endpoint and payload shape', () => {
  const payload = buildInquiryReplyPayload({
    body: '返信本文',
    send_email: true,
  });

  assert.equal(buildInquiryReplyEndpoint('inquiry-1'), '/api/v1/admin/inquiries/inquiry-1/reply');
  assert.deepEqual(payload, {
    body: '返信本文',
    send_email: true,
  });
  assert.equal(payload.content, undefined);
});
