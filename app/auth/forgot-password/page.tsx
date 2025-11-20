import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'パスワードをリセット | ケイカくん',
  description: 'パスワードリセット用のメールを送信します',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
