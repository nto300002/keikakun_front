'use client';

import { ReactNode, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white border border-slate-300 text-slate-900 shadow-xl dark:bg-[#0f1419] dark:border-[#2a3441] dark:text-white rounded-lg w-full ${sizeClasses[size]} my-8 max-h-[calc(100vh-4rem)] flex flex-col`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-slate-300 dark:border-[#2a3441] flex-shrink-0">
            {title && <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-[#2a3441] rounded-lg transition-colors ml-auto"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto hidden-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
}
