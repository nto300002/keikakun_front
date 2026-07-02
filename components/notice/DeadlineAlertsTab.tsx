'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { deadlineApi } from '@/lib/api/deadline';
import { DeadlineAlert } from '@/types/deadline';

function getAlertLabel(alert: DeadlineAlert): string {
  if (alert.alert_type === 'assessment_incomplete') return 'アセスメント未完了';
  if (alert.alert_type === 'renewal_overdue') return '期限超過';
  return '更新期限が近い';
}

function getAlertTone(alert: DeadlineAlert): string {
  if (alert.alert_type === 'renewal_overdue') {
    return 'border-red-300 bg-red-50 text-red-800 dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-200';
  }
  if (alert.alert_type === 'renewal_deadline') {
    return 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-500/50 dark:bg-yellow-950/40 dark:text-yellow-200';
  }
  return 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/50 dark:bg-blue-950/40 dark:text-blue-200';
}

function getDaysText(alert: DeadlineAlert): string {
  if (alert.alert_type === 'assessment_incomplete') return '確認が必要です';
  const days = alert.days_remaining ?? 0;
  if (days < 0) return `${Math.abs(days)}日超過`;
  return `残り${days}日`;
}

export default function DeadlineAlertsTab() {
  const [alerts, setAlerts] = useState<DeadlineAlert[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await deadlineApi.getAlerts({ threshold_days: 30 });
        setAlerts(data.alerts);
        setTotal(data.total);
      } catch (err) {
        console.error('Client operation failed');
        setError('更新期限のお知らせの取得に失敗しました。時間をおいて再度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-300 bg-white p-6 text-slate-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        更新期限のお知らせを読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-800 shadow-sm dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-200">
        {error}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-slate-300 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">更新期限が近い利用者はいません</h2>
        <p className="mt-2 text-slate-600 dark:text-gray-400">
          30日以内に確認が必要な利用者が出た場合、ここに表示されます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">更新期限の近い利用者</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-gray-800 dark:text-gray-300">
          {total}件
        </span>
      </div>

      <div className="grid gap-3">
        {alerts.map((alert) => (
          <Link
            key={`${alert.id}-${alert.alert_type}`}
            href={`/support_plan/${alert.id}`}
            className={`block rounded-lg border p-4 transition-colors hover:brightness-95 ${getAlertTone(alert)}`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold dark:bg-black/20">
                    {getAlertLabel(alert)}
                  </span>
                  <span className="text-sm font-semibold">{getDaysText(alert)}</span>
                </div>
                <p className="mt-2 text-lg font-bold">{alert.full_name}</p>
                {alert.next_renewal_deadline && (
                  <p className="mt-1 text-sm font-medium">
                    更新期限: {new Date(alert.next_renewal_deadline).toLocaleDateString('ja-JP')}
                  </p>
                )}
              </div>
              <span className="text-sm font-bold">支援計画を確認する →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
