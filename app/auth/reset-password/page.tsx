import { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'パスワードを再設定 | ケイカくん',
  description: '新しいパスワードを設定します',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
