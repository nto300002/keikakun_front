'use client';

import { toast as sonnerToast } from 'sonner';

// グローバルな重複防止Map（メッセージ → 最後に表示した時刻）
const recentToasts = new Map<string, number>();
const DUPLICATE_THRESHOLD_MS = 1000; // 1秒以内の重複を防止

export const toast = {
  success: (message: string, options?: any) => {
    const now = Date.now();
    const lastShown = recentToasts.get(message);

    // 短時間に同じメッセージが表示されようとしている場合はスキップ
    if (lastShown && (now - lastShown) < DUPLICATE_THRESHOLD_MS) {
      return;
    }

    // 現在時刻を記録
    recentToasts.set(message, now);

    const result = sonnerToast.success(message, options);

    // 古いエントリをクリーンアップ（メモリリーク防止）
    setTimeout(() => {
      recentToasts.delete(message);
    }, DUPLICATE_THRESHOLD_MS + 100);

    return result;
  },

  error: (message: string, options?: any) => {
    const now = Date.now();
    const lastShown = recentToasts.get(message);

    // 短時間に同じメッセージが表示されようとしている場合はスキップ
    if (lastShown && (now - lastShown) < DUPLICATE_THRESHOLD_MS) {
      return;
    }

    // 現在時刻を記録
    recentToasts.set(message, now);

    const result = sonnerToast.error(message, options);

    // 古いエントリをクリーンアップ（メモリリーク防止）
    setTimeout(() => {
      recentToasts.delete(message);
    }, DUPLICATE_THRESHOLD_MS + 100);

    return result;
  },

  info: (message: string, options?: any) => {
    return sonnerToast.info(message, options);
  },

  warning: (message: string, options?: any) => {
    return sonnerToast.warning(message, options);
  },
};
