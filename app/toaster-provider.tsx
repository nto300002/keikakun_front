'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

export function ToasterProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      richColors
      duration={5000}
      closeButton
      expand={true}
      visibleToasts={9}
      style={{
        top: '1rem',
        right: '1rem',
      }}
    />
  );
}
