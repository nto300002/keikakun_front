'use client';

import { useCallback, useEffect, useState } from 'react';
import { webauthnApi, WebAuthnCredential } from '@/lib/api/webauthn';
import {
  isWebAuthnSupported,
  getJapaneseWebAuthnError,
  serializePublicKeyCredential,
  toCreationOptions,
} from '@/lib/webauthnClient.mjs';

const defaultName = 'この端末のパスキー';

export default function PasskeyManagement() {
  const [credentials, setCredentials] = useState<WebAuthnCredential[]>([]);
  const [displayName, setDisplayName] = useState(defaultName);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadCredentials = useCallback(async () => {
    try {
      setCredentials(await webauthnApi.listCredentials());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'パスキー一覧の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadCredentials(); }, [loadCredentials]);

  const registerPasskey = async () => {
    setError('');
    setMessage('');
    if (!isWebAuthnSupported()) {
      setError('このブラウザはパスキーに対応していません。対応ブラウザまたはセキュリティキーをご利用ください。');
      return;
    }
    setIsRegistering(true);
    try {
      const options = await webauthnApi.getRegistrationOptions();
      const credential = await navigator.credentials.create({
        publicKey: toCreationOptions(options.publicKey),
      });
      if (!credential) throw new Error('パスキー登録がキャンセルされました。');
      const saved = await webauthnApi.verifyRegistration(
        serializePublicKeyCredential(credential),
        displayName.trim() || defaultName,
      );
      setCredentials((current) => [...current, saved]);
      setMessage('パスキーを登録しました。生体情報はサーバーへ送信されません。');
    } catch (registrationError) {
      setError(getJapaneseWebAuthnError(registrationError, 'パスキー登録'));
    } finally {
      setIsRegistering(false);
    }
  };

  const renameCredential = async (credential: WebAuthnCredential) => {
    const nextName = window.prompt('パスキー名を入力してください', credential.display_name)?.trim();
    if (!nextName || nextName === credential.display_name) return;
    try {
      const updated = await webauthnApi.updateCredential(credential.id, nextName);
      setCredentials((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (renameError) {
      setError(renameError instanceof Error ? renameError.message : 'パスキー名の変更に失敗しました。');
    }
  };

  const revokeCredential = async (credential: WebAuthnCredential) => {
    if (!window.confirm(`「${credential.display_name}」を失効させますか？`)) return;
    try {
      await webauthnApi.revokeCredential(credential.id);
      setCredentials((current) => current.filter((item) => item.id !== credential.id));
      setMessage('パスキーを失効させました。');
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : 'パスキーの失効に失敗しました。');
    }
  };

  return (
    <section className="mt-8 border-t border-slate-200 pt-6 dark:border-gray-700" aria-labelledby="passkey-heading">
      <h3 id="passkey-heading" className="text-xl font-bold text-slate-950 dark:text-white">パスキー</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
        指紋・顔認証・端末PINなどの本人確認を利用します。生体情報や秘密鍵はケイカくんのサーバーへ送信されません。
      </p>
      <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
        この端末の認証器を優先して利用できます。対応していない場合は、USB・NFC・Bluetoothのセキュリティキーも利用できます。
      </p>
      {error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-300">{error}</p>}
      {message && <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <input
          aria-label="パスキー名"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={100}
          className="border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <button type="button" onClick={registerPasskey} disabled={isRegistering} className="bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
          {isRegistering ? '登録中...' : 'パスキーを登録'}
        </button>
      </div>
      {isLoading ? <p className="mt-4 text-sm">読み込み中...</p> : (
        <ul className="mt-4 space-y-2" aria-label="登録済みパスキー">
          {credentials.map((credential) => (
            <li key={credential.id} className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 p-3 text-sm dark:border-gray-700">
              <span>{credential.display_name}</span>
              <span className="flex gap-2">
                <button type="button" onClick={() => void renameCredential(credential)} className="text-purple-700 underline dark:text-purple-300">名前を変更</button>
                <button type="button" onClick={() => void revokeCredential(credential)} className="text-red-700 underline dark:text-red-300">失効</button>
              </span>
            </li>
          ))}
          {credentials.length === 0 && <li className="text-sm text-slate-600 dark:text-gray-300">登録済みのパスキーはありません。</li>}
        </ul>
      )}
    </section>
  );
}
