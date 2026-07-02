import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeDashboardData,
  type DashboardDataClient,
} from './dashboardDataState';

test('normalizeDashboardData keeps recipients array when API returns a valid list', () => {
  const data = {
    recipients: [{ id: 'recipient-1' }],
  } as unknown as DashboardDataClient;

  assert.equal(normalizeDashboardData(data), data);
  assert.deepEqual(normalizeDashboardData(data)?.recipients, [{ id: 'recipient-1' }]);
});

test('normalizeDashboardData replaces invalid recipients with an empty list', () => {
  const data = {
    recipients: null,
  } as unknown as DashboardDataClient;

  const normalized = normalizeDashboardData(data);

  assert.notEqual(normalized, data);
  assert.deepEqual(normalized?.recipients, []);
  assert.equal(normalizeDashboardData(null), null);
});
