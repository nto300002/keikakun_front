import { notFound } from 'next/navigation';
import PasskeyManagement from '@/components/protected/app-admin/PasskeyManagement';

/**
 * WebAuthn UIの専用E2Eハーネス。
 * 明示的なE2E用フラグがある場合だけ利用できる。
 */
export default function WebAuthnE2EPage() {
  if (process.env.WEBAUTHN_E2E_HARNESS !== '1') notFound();

  return (
    <main className="p-8">
      <PasskeyManagement />
    </main>
  );
}
