'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface DateDrumPickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  error?: boolean;
  minYear?: number;
  maxYear?: number;
}

export default function DateDrumPicker({
  value,
  onChange,
  error = false,
  minYear = 2000,
  maxYear = new Date().getFullYear(),
}: DateDrumPickerProps) {
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [day, setDay] = useState<string>('');

  // 前回の値を追跡して無限ループを防ぐ
  const lastNotifiedValue = useRef<string>('');

  // 親からの値が変更されたときに年月日を分解
  useEffect(() => {
    if (value !== lastNotifiedValue.current) {
      const [y, m, d] = value.split('-');
      if (y && m && d) {
        setYear(y);
        setMonth(parseInt(m, 10).toString());
        setDay(parseInt(d, 10).toString());
      } else if (!value) {
        // 値がクリアされた場合
        setYear('');
        setMonth('');
        setDay('');
      }
    }
  }, [value]);

  // 年の配列を生成（降順：新しい年から古い年へ）
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  // 月の配列を生成
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 選択された年月に応じた日数を計算
  const getDaysInMonth = useCallback((year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  }, []);

  const daysInMonth = year && month
    ? getDaysInMonth(parseInt(year, 10), parseInt(month, 10))
    : 31;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // 年月日を結合して親に通知（無限ループを防ぐ）
  const notifyChange = useCallback((newYear: string, newMonth: string, newDay: string) => {
    if (newYear && newMonth && newDay) {
      const formattedDate = `${newYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`;
      if (formattedDate !== lastNotifiedValue.current) {
        lastNotifiedValue.current = formattedDate;
        onChange(formattedDate);
      }
    } else if (!newYear && !newMonth && !newDay) {
      if (lastNotifiedValue.current !== '') {
        lastNotifiedValue.current = '';
        onChange('');
      }
    }
  }, [onChange]);

  // 年が変更されたとき
  const handleYearChange = (newYear: string) => {
    setYear(newYear);

    if (newYear) {
      // 日を調整（年が変わってうるう年が変わる可能性があるため）
      if (month && day) {
        const maxDay = getDaysInMonth(parseInt(newYear, 10), parseInt(month, 10));
        const adjustedDay = parseInt(day, 10) > maxDay ? maxDay.toString() : day;
        setDay(adjustedDay);
        notifyChange(newYear, month, adjustedDay);
      } else if (month) {
        notifyChange(newYear, month, day);
      }
    } else {
      // 年をクリアした場合、すべてクリア
      setMonth('');
      setDay('');
      notifyChange('', '', '');
    }
  };

  // 月が変更されたとき
  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);

    if (newMonth && year) {
      // 日を調整（月によって日数が異なるため）
      if (day) {
        const maxDay = getDaysInMonth(parseInt(year, 10), parseInt(newMonth, 10));
        const adjustedDay = parseInt(day, 10) > maxDay ? maxDay.toString() : day;
        setDay(adjustedDay);
        notifyChange(year, newMonth, adjustedDay);
      } else {
        notifyChange(year, newMonth, day);
      }
    } else if (!newMonth) {
      // 月をクリアした場合、日もクリア
      setDay('');
      notifyChange(year, '', '');
    }
  };

  // 日が変更されたとき
  const handleDayChange = (newDay: string) => {
    setDay(newDay);
    if (year && month) {
      notifyChange(year, month, newDay);
    }
  };

  const selectClassName = `
    px-3 py-2 bg-[#1a1f2e] border rounded-lg text-white
    focus:outline-none focus:ring-2 focus:ring-[#10b981]
    appearance-none cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500' : 'border-[#2a3441]'}
  `;

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* 年 */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">年</label>
        <select
          value={year}
          onChange={(e) => handleYearChange(e.target.value)}
          className={selectClassName}
        >
          <option value="">選択</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}年
            </option>
          ))}
        </select>
      </div>

      {/* 月 */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">月</label>
        <select
          value={month}
          onChange={(e) => handleMonthChange(e.target.value)}
          className={selectClassName}
          disabled={!year}
        >
          <option value="">選択</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}月
            </option>
          ))}
        </select>
      </div>

      {/* 日 */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">日</label>
        <select
          value={day}
          onChange={(e) => handleDayChange(e.target.value)}
          className={selectClassName}
          disabled={!year || !month}
        >
          <option value="">選択</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}日
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
