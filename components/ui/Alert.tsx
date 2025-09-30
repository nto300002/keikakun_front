'use client';

import { XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

const alertStyles = {
  success: {
    bg: 'bg-green-100 border-green-400 text-green-700',
    icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
  },
  error: {
    bg: 'bg-red-100 border-red-400 text-red-700',
    icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
  },
  warning: {
    bg: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
  },
};

export default function Alert({ message, type, onClose }: AlertProps) {
  const styles = alertStyles[type];

  return (
    <div
      className={`border-l-4 p-4 my-4 rounded-md shadow-md ${styles.bg}`}
      role="alert"
    >
      <div className="flex">
        <div className="py-1">
          {styles.icon}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.bg}`}
            >
              <span className="sr-only">Dismiss</span>
              <XCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
