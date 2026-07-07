import assert from 'node:assert/strict';
import test from 'node:test';
import { buildInquiryListEndpoint } from './inquiryQuery.ts';

test('buildInquiryListEndpoint includes all supported admin inquiry filters', () => {
  assert.equal(
    buildInquiryListEndpoint({
      status: 'new',
      assigned: 'staff-1',
      priority: 'high',
      search: '請求',
      skip: 20,
      limit: 20,
      sort: 'updated_at',
      order: 'desc',
      include_test_data: true,
    }),
    '/api/v1/admin/inquiries?status=new&assigned=staff-1&priority=high&search=%E8%AB%8B%E6%B1%82&skip=20&limit=20&sort=updated_at&order=desc&include_test_data=true'
  );
});

test('buildInquiryListEndpoint omits empty params', () => {
  assert.equal(buildInquiryListEndpoint(), '/api/v1/admin/inquiries');
  assert.equal(
    buildInquiryListEndpoint({ status: undefined, search: '', skip: 0 }),
    '/api/v1/admin/inquiries?skip=0'
  );
});
