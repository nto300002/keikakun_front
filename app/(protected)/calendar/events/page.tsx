'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { calendarApi } from '@/lib/calendar';
import {
  CalendarEvent,
  CalendarEventQuery,
  CalendarEventType,
} from '@/types/calendar';

const eventTypeLabels: Record<CalendarEventType, string> = {
  [CalendarEventType.RENEWAL_DEADLINE]: '更新期限',
  [CalendarEventType.NEXT_PLAN_START_DATE]: '次回計画開始期限',
  [CalendarEventType.ASSESSMENT_INCOMPLETE]: 'アセスメント未完了',
  [CalendarEventType.CUSTOM]: 'その他',
};

const eventTypeStyles: Record<CalendarEventType, string> = {
  [CalendarEventType.RENEWAL_DEADLINE]: 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200',
  [CalendarEventType.NEXT_PLAN_START_DATE]: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100',
  [CalendarEventType.ASSESSMENT_INCOMPLETE]: 'border-cyan-300 bg-cyan-50 text-cyan-900 dark:border-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-100',
  [CalendarEventType.CUSTOM]: 'border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function DeadlineCalendarPage() {
  const today = useMemo(() => new Date(), []);
  const sixMonthsLater = useMemo(() => {
    const value = new Date(today);
    value.setMonth(value.getMonth() + 6);
    return value;
  }, [today]);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [fromDate, setFromDate] = useState(toDateInputValue(today));
  const [toDate, setToDate] = useState(toDateInputValue(sixMonthsLater));
  const [eventType, setEventType] = useState<CalendarEventType | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      setIsLoading(true);
      setError(null);
      const query: CalendarEventQuery = {
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        event_type: eventType || undefined,
      };

      try {
        const data = await calendarApi.getEvents(query);
        if (!ignore) setEvents(data);
      } catch {
        if (!ignore) setError('期限カレンダーの取得に失敗しました。時間をおいて再度お試しください。');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadEvents();
    return () => {
      ignore = true;
    };
  }, [eventType, fromDate, toDate]);

  const groupedEvents = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((groups, event) => {
      const key = event.event_start_datetime.slice(0, 10);
      groups[key] = groups[key] || [];
      groups[key].push(event);
      return groups;
    }, {});
  }, [events]);

  return (
    <div className="min-h-screen bg-slate-100 pt-20 text-slate-950 dark:bg-gradient-to-br dark:from-[#1a1f2e] dark:to-[#0f1419] dark:text-white">
      <main className="max-w-6xl px-4 pb-10 md:px-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">期限カレンダー</h1>
            <p className="mt-2 text-base font-semibold text-slate-600 dark:text-gray-300">
              更新期限、次回計画開始期限、アセスメント未完了を確認できます。
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-400 bg-white px-4 py-2 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            利用者ダッシュボード
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 md:grid-cols-[1fr_1fr_1.3fr]">
          <label className="text-base font-semibold text-slate-700 dark:text-gray-200">
            開始日
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="mt-1 min-h-[44px] w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-950 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label className="text-base font-semibold text-slate-700 dark:text-gray-200">
            終了日
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="mt-1 min-h-[44px] w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-950 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <label className="text-base font-semibold text-slate-700 dark:text-gray-200">
            種別
            <select
              value={eventType}
              onChange={(event) => setEventType(event.target.value as CalendarEventType | '')}
              className="mt-1 min-h-[44px] w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-950 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            >
              <option value="">すべて</option>
              <option value={CalendarEventType.RENEWAL_DEADLINE}>更新期限</option>
              <option value={CalendarEventType.NEXT_PLAN_START_DATE}>次回計画開始期限</option>
              <option value={CalendarEventType.ASSESSMENT_INCOMPLETE}>アセスメント未完了</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-base font-semibold text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-slate-300 bg-white p-8 text-center text-base font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-gray-300">
            読み込み中...
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-lg border border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900/80">
            <h2 className="text-xl font-bold">表示できる期限イベントはありません</h2>
            <p className="mt-2 text-base font-semibold text-slate-600 dark:text-gray-300">
              期間や種別を変更すると、表示される期限が変わります。
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
              <section key={dateKey}>
                <h2 className="mb-2 text-lg font-bold text-slate-800 dark:text-gray-100">
                  {new Date(`${dateKey}T00:00:00`).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </h2>
                <div className="space-y-3">
                  {dateEvents.map((event) => (
                    <article
                      key={event.id}
                      className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <span className={`inline-flex rounded-md border px-3 py-1 text-sm font-bold ${eventTypeStyles[event.event_type]}`}>
                            {eventTypeLabels[event.event_type]}
                          </span>
                          <h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                            {event.event_title}
                          </h3>
                          <p className="mt-1 text-base font-semibold text-slate-600 dark:text-gray-300">
                            {formatDateTime(event.event_start_datetime)} - {formatDateTime(event.event_end_datetime)}
                          </p>
                          {event.event_description && (
                            <p className="mt-2 whitespace-pre-line text-base text-slate-700 dark:text-gray-200">
                              {event.event_description}
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/recipients/${event.welfare_recipient_id}`}
                          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-cyan-700 px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-cyan-800 dark:bg-cyan-600 dark:hover:bg-cyan-500"
                        >
                          利用者詳細
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
