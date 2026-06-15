'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';

interface TableLoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export function TableLoadingOverlay({ isLoading, children }: TableLoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg dark:bg-[#1a1f2e]/80" aria-live="polite">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-[#4f46e5]" />
            <p className="text-base font-semibold text-slate-900 dark:text-white">一覧を更新しています</p>
          </div>
        </div>
      )}
    </div>
  );
}
