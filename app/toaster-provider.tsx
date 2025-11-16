'use client';

import { Toaster } from 'sonner';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
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
