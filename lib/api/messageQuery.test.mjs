import assert from 'node:assert/strict';
import test from 'node:test';

import { buildMessageInboxEndpoint } from './messageQuery.ts';

test('buildMessageInboxEndpoint supports repeated message_types filters', () => {
  assert.equal(
    buildMessageInboxEndpoint({
      message_types: ['announcement', 'inquiry_reply'],
      skip: 20,
      limit: 20,
    }),
    '/api/v1/messages/inbox?message_types=announcement&message_types=inquiry_reply&skip=20&limit=20'
  );
});
