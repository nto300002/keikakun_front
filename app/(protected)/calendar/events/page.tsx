'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { calendarApi } from '@/lib/calendar';
import { TableLoadingOverlay } from '@/components/ui/table-loading-overlay';
import { IcsDownloadControl } from '@/components/ui/ics-download-control';
import { toast } from '@/lib/toast-debug';
import {
  CalendarEvent,
  CalendarEventQuery,
  CalendarEventType,
} from '@/types/calendar';

const weekDayLabels = ['日', '月', '火', '水', '木', '金', '土'];

const eventTypeLabels: Record<CalendarEventType, string> = {
  [CalendarEventType.RENEWAL_DEADLINE]: '更新期限',
  [CalendarEventType.NEXT_PLAN_START_DATE]: '次回計画開始期限',
  [CalendarEventType.ASSESSMENT_INCOMPLETE]: 'アセスメント未完了',
  [CalendarEventType.CUSTOM]: 'その他',
};

const eventTypeStyles: Record<CalendarEventType, string> = {
  [CalendarEventType.RENEWAL_DEADLINE]: 'bg-rose-200 text-rose-950 dark:bg-rose-400/80 dark:text-rose-950',
  [CalendarEventType.NEXT_PLAN_START_DATE]: 'bg-amber-200 text-amber-950 dark:bg-amber-300/80 dark:text-amber-950',
  [CalendarEventType.ASSESSMENT_INCOMPLETE]: 'bg-cyan-200 text-cyan-950 dark:bg-cyan-300/80 dark:text-cyan-950',
  [CalendarEventType.CUSTOM]: 'bg-slate-200 text-slate-900 dark:bg-slate-500 dark:text-white',
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthGridDates(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const gridStart = addDays(firstDay, -firstDay.getDay());
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function formatEventTime(value: string): string {
  return new Date(value).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getEventDateKey(event: CalendarEvent): string {
  return event.event_start_datetime.slice(0, 10);
}

export default function DeadlineCalendarPage() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [displayYear, setDisplayYear] = useState(today.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventType, setEventType] = useState<CalendarEventType | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingIcs, setIsDownloadingIcs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calendarDates = useMemo(
    () => getMonthGridDates(displayYear, displayMonth),
    [displayMonth, displayYear],
  );
  const visibleFromDate = calendarDates[0];
  const visibleToDate = calendarDates[calendarDates.length - 1];

  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      setIsLoading(true);
      setError(null);
      const query: CalendarEventQuery = {
        from_date: toDateKey(visibleFromDate),
        to_date: toDateKey(visibleToDate),
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
  }, [eventType, visibleFromDate, visibleToDate]);

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((groups, event) => {
      const key = getEventDateKey(event);
      groups[key] = groups[key] || [];
      groups[key].push(event);
      return groups;
    }, {});
  }, [events]);

  const moveMonth = (amount: number) => {
    const next = new Date(displayYear, displayMonth + amount, 1);
    setDisplayYear(next.getFullYear());
    setDisplayMonth(next.getMonth());
  };

  const moveYear = (amount: number) => {
    setDisplayYear((year) => year + amount);
  };

  const moveToday = () => {
    setDisplayYear(today.getFullYear());
    setDisplayMonth(today.getMonth());
  };

  const handleDownloadIcs = async () => {
    setIsDownloadingIcs(true);
    try {
      await calendarApi.downloadIcs({
        from_date: toDateKey(visibleFromDate),
        to_date: toDateKey(visibleToDate),
        event_type: eventType || undefined,
      });
      toast.success('カレンダーファイルをダウンロードしました');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'カレンダーファイルのダウンロードに失敗しました';
      toast.error(message);
    } finally {
      setIsDownloadingIcs(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-20 text-slate-950 dark:bg-gradient-to-br dark:from-[#1a1f2e] dark:to-[#0f1419] dark:text-white">
      <main className="max-w-7xl px-4 pb-10 md:px-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">期限カレンダー</h1>
            <p className="mt-2 text-base font-semibold text-slate-600 dark:text-gray-300">
              更新期限、次回計画開始期限、アセスメント未完了を月単位で確認できます。
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <IcsDownloadControl
              isDownloading={isDownloadingIcs}
              onDownload={handleDownloadIcs}
              buttonLabel=".icsダウンロード"
              className="lg:items-end"
            />
            <Link
              href="/dashboard"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg border border-slate-400 bg-white px-4 py-2 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
            >
              利用者ダッシュボード
            </Link>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-gray-400">表示月</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
              {displayYear}年 {displayMonth + 1}月
            </h2>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <button
                type="button"
                onClick={() => moveYear(-1)}
                className="min-h-[44px] rounded-md border border-slate-400 bg-white px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
              >
                前年
              </button>
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                className="min-h-[44px] rounded-md border border-slate-400 bg-white px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
              >
                前月
              </button>
              <button
                type="button"
                onClick={moveToday}
                className="min-h-[44px] rounded-md bg-cyan-700 px-3 py-2 text-base font-semibold text-white hover:bg-cyan-800 dark:bg-cyan-600 dark:hover:bg-cyan-500"
              >
                今日
              </button>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                className="min-h-[44px] rounded-md border border-slate-400 bg-white px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
              >
                次月
              </button>
              <button
                type="button"
                onClick={() => moveYear(1)}
                className="min-h-[44px] rounded-md border border-slate-400 bg-white px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
              >
                翌年
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:w-[300px]">
              <label className="text-sm font-bold text-slate-600 dark:text-gray-300">
                年
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  value={displayYear}
                  onChange={(event) => setDisplayYear(Number(event.target.value))}
                  className="mt-1 min-h-[44px] w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-950 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                />
              </label>
              <label className="text-sm font-bold text-slate-600 dark:text-gray-300">
                月
                <select
                  value={displayMonth}
                  onChange={(event) => setDisplayMonth(Number(event.target.value))}
                  className="mt-1 min-h-[44px] w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-base text-slate-950 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                >
                  {Array.from({ length: 12 }, (_, index) => (
                    <option key={index} value={index}>
                      {index + 1}月
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="text-sm font-bold text-slate-600 dark:text-gray-300 sm:w-[220px]">
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
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-base font-semibold text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        <TableLoadingOverlay isLoading={isLoading}>
          <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950/70">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-7 border-b border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
                {weekDayLabels.map((label, index) => (
                  <div
                    key={label}
                    className={`px-3 py-2 text-center text-sm font-bold ${index === 0 ? 'text-rose-700 dark:text-rose-300' : index === 6 ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-gray-200'}`}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDates.map((date) => {
                  const dateKey = toDateKey(date);
                  const dateEvents = eventsByDate[dateKey] || [];
                  const isCurrentMonth = date.getMonth() === displayMonth;
                  const isToday = dateKey === toDateKey(today);

                  return (
                    <div
                      key={dateKey}
                      className={`min-h-[132px] border-b border-r border-slate-300 p-2 last:border-r-0 dark:border-slate-700 ${isCurrentMonth ? 'bg-white dark:bg-slate-950/40' : 'bg-slate-50 text-slate-400 dark:bg-slate-900/40 dark:text-gray-500'}`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-bold ${isToday ? 'bg-cyan-700 text-white dark:bg-cyan-500 dark:text-slate-950' : 'text-slate-700 dark:text-gray-200'}`}
                        >
                          {date.getDate()}
                        </span>
                        {dateEvents.length > 0 && (
                          <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
                            {dateEvents.length}件
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {dateEvents.slice(0, 4).map((event) => (
                          <div key={event.id} className="relative h-7">
                            <Link
                              href={`/support_plan/${event.welfare_recipient_id}`}
                              title={`${eventTypeLabels[event.event_type]} ${event.event_title}`}
                              className={`absolute inset-x-0 top-0 z-10 block truncate rounded-md px-2 py-1 text-xs font-bold leading-5 shadow-sm transition-shadow hover:z-30 hover:whitespace-normal hover:break-words hover:shadow-lg ${eventTypeStyles[event.event_type]}`}
                            >
                              {formatEventTime(event.event_start_datetime)} {event.event_title}
                            </Link>
                          </div>
                        ))}
                        {dateEvents.length > 4 && (
                          <div className="rounded-md bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-gray-300">
                            他 {dateEvents.length - 4}件
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TableLoadingOverlay>
      </main>
    </div>
  );
}
