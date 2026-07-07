import type { CalendarEventQuery } from '@/types/calendar';

const API_V1_PREFIX = '/api/v1';

export type CalendarIcsExportQuery = CalendarEventQuery;

export function buildCalendarIcsExportEndpoint(query: CalendarIcsExportQuery = {}): string {
  const params = new URLSearchParams();
  if (query.from_date) params.set('from_date', query.from_date);
  if (query.to_date) params.set('to_date', query.to_date);
  if (query.event_type) params.set('event_type', query.event_type);
  if (query.recipient_id) params.set('recipient_id', query.recipient_id);
  const queryString = params.toString();
  return queryString
    ? `${API_V1_PREFIX}/calendar/export.ics?${queryString}`
    : `${API_V1_PREFIX}/calendar/export.ics`;
}
