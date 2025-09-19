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
        <div className="absolute inset-0 bg-[#1a1f2e]/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-[#4f46e5]" />
            <p className="text-sm font-medium text-white">データを取得中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
