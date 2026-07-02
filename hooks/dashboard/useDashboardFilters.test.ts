import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_DASHBOARD_FILTERS,
  buildDashboardParams,
  getDashboardSortButtonLabel,
  getNextDashboardSortOrder,
  hasDashboardFilter,
} from './useDashboardFilters';

test('buildDashboardParams maps UI filter state to dashboard API params', () => {
  assert.deepEqual(
    buildDashboardParams('山田', 'name_phonetic', 'desc', {
      isOverdue: true,
      isUpcoming: false,
      hasAssessmentDue: true,
      status: 'assessment',
    }),
    {
      searchTerm: '山田',
      sortBy: 'name_phonetic',
      sortOrder: 'desc',
      is_overdue: true,
      is_upcoming: false,
      has_assessment_due: true,
      status: 'assessment',
    }
  );
});

test('buildDashboardParams omits empty status as undefined', () => {
  assert.equal(
    buildDashboardParams('', 'next_renewal_deadline', 'asc', DEFAULT_DASHBOARD_FILTERS).status,
    undefined
  );
});

test('getNextDashboardSortOrder toggles only when clicking the active sort field', () => {
  assert.equal(getNextDashboardSortOrder('name_phonetic', 'asc', 'name_phonetic'), 'desc');
  assert.equal(getNextDashboardSortOrder('next_renewal_deadline', 'desc', 'name_phonetic'), 'asc');
});

test('getDashboardSortButtonLabel matches existing button label behavior', () => {
  assert.equal(getDashboardSortButtonLabel('name_phonetic', 'asc', 'name_phonetic'), '降順');
  assert.equal(getDashboardSortButtonLabel('name_phonetic', 'desc', 'name_phonetic'), '昇順');
  assert.equal(getDashboardSortButtonLabel('next_renewal_deadline', 'asc', 'name_phonetic'), '昇順');
});

test('hasDashboardFilter detects search and active filter state', () => {
  assert.equal(hasDashboardFilter('', DEFAULT_DASHBOARD_FILTERS), false);
  assert.equal(hasDashboardFilter('山田', DEFAULT_DASHBOARD_FILTERS), true);
  assert.equal(hasDashboardFilter('', { ...DEFAULT_DASHBOARD_FILTERS, isUpcoming: true }), true);
});
