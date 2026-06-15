'use client';

import { useState } from 'react';

interface MonitoringDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (days: number) => void;
  currentDeadline: number;
}

export default function MonitoringDeadlineModal({
  isOpen,
  onClose,
  onConfirm,
  currentDeadline,
}: MonitoringDeadlineModalProps) {
  const [deadline, setDeadline] = useState(currentDeadline);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(deadline);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border border-slate-300 shadow-lg dark:bg-[#1a1f2e] dark:border-[#2a3441] p-6 w-full max-w-md">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">モニタリング期限設定</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:text-[#9ca3af] dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="mb-6">
          <label className="block text-base font-semibold text-slate-700 dark:text-[#9ca3af] mb-2">
            期限（日数）
          </label>
          <div className="space-y-4">
            {/* スライダー */}
            <input
              type="range"
              min="7"
              max="30"
              value={deadline}
              onChange={(e) => setDeadline(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-[#2a3441] rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            {/* 現在の値表示 */}
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-slate-600 dark:text-[#9ca3af]">7日</span>
              <div className="bg-slate-50 border border-slate-300 dark:bg-[#0f1419] dark:border-[#2a3441] rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{deadline}</span>
                <span className="text-base font-semibold text-slate-600 dark:text-[#9ca3af] ml-1">日</span>
              </div>
              <span className="text-base font-semibold text-slate-600 dark:text-[#9ca3af]">30日</span>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-[#2a3441] dark:hover:bg-[#3a4451] dark:text-white px-4 py-2 rounded-md font-semibold transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold transition-colors"
          >
            決定
          </button>
        </div>
      </div>
    </div>
  );
}
