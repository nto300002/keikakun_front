import ProtectedLayout from '@/components/protected/Layout';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
