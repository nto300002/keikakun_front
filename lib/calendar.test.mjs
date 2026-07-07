import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCalendarIcsExportEndpoint } from './calendarExport.ts';

test('buildCalendarIcsExportEndpoint targets recipient scoped ics export', () => {
  assert.equal(
    buildCalendarIcsExportEndpoint({
      recipient_id: 'recipient-1',
      from_date: '2026-08-01',
      to_date: '2026-08-31',
      event_type: 'renewal_deadline',
    }),
    '/api/v1/calendar/export.ics?from_date=2026-08-01&to_date=2026-08-31&event_type=renewal_deadline&recipient_id=recipient-1'
  );
});

test('buildCalendarIcsExportEndpoint omits empty filters', () => {
  assert.equal(
    buildCalendarIcsExportEndpoint({ recipient_id: 'recipient-1' }),
    '/api/v1/calendar/export.ics?recipient_id=recipient-1'
  );
});
