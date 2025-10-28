'use client';

import * as React from 'react';
import { XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Legacy Alert component (for backward compatibility)
interface LegacyAlertProps {
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

export default function LegacyAlert({ message, type, onClose }: LegacyAlertProps) {
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

// shadcn/ui compatible Alert components
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
