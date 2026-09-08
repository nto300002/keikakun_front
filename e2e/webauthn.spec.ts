import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const challenge = 'AQIDBA';

async function installCredentialMock(page: Page, outcome: 'success' | 'cancel' | 'timeout' | 'unsupported' | 'browser-unsupported') {
  await page.addInitScript(({ outcome: credentialOutcome, challengeValue }) => {
    if (credentialOutcome !== 'browser-unsupported') {
      Object.defineProperty(window, 'PublicKeyCredential', {
        configurable: true,
        value: class PublicKeyCredential {},
      });
    }
    Object.defineProperty(navigator, 'credentials', {
      configurable: true,
      value: {
        get: async ({ publicKey }: { publicKey?: { userVerification?: string } }) => {
          if (credentialOutcome === 'browser-unsupported') throw new DOMException('', 'NotSupportedError');
          if (credentialOutcome === 'cancel') throw new DOMException('', 'NotAllowedError');
          if (credentialOutcome === 'timeout') throw new DOMException('', 'TimeoutError');
          if (credentialOutcome === 'unsupported') throw new DOMException('', 'NotSupportedError');
          if (publicKey?.userVerification !== 'required') throw new Error('userVerification must be required');
          document.documentElement.dataset.webauthnAssertionStarted = 'true';
          await (window as unknown as { assertNoAccessCookie: () => Promise<void> }).assertNoAccessCookie();
          const encoder = new TextEncoder();
          const clientDataJSON = encoder.encode(JSON.stringify({
            type: 'webauthn.get',
            challenge: challengeValue,
            origin: window.location.origin,
          })).buffer;
          return {
            id: 'mock-credential',
            rawId: Uint8Array.from([1, 2, 3]).buffer,
            type: 'public-key',
            response: {
              clientDataJSON,
              authenticatorData: Uint8Array.from([1, 2, 3]).buffer,
              signature: Uint8Array.from([4, 5, 6]).buffer,
              userHandle: null,
            },
          };
        },
        create: async ({ publicKey }: { publicKey?: { userVerification?: string } }) => {
          if (publicKey?.userVerification !== 'required') throw new Error('userVerification must be required');
          const encoder = new TextEncoder();
          return ({
            id: 'mock-credential',
            rawId: Uint8Array.from([1, 2, 3]).buffer,
            type: 'public-key',
            response: {
              clientDataJSON: encoder.encode(JSON.stringify({
                type: 'webauthn.create',
                challenge: challengeValue,
                origin: window.location.origin,
              })).buffer,
              attestationObject: Uint8Array.from([4, 5, 6]).buffer,
              getTransports: () => ['internal'],
            },
          });
        },
      },
    });
  }, { outcome, challengeValue: challenge });
}

async function mockCsrf(page: Page) {
  await page.route('**/api/v1/csrf-token', (route) => route.fulfill({
    json: { csrf_token: 'test-csrf-token' },
  }));
}

test.describe('app_admin WebAuthn login', () => {
  test('does not issue a cookie before successful assertion and completes login', async ({ page }) => {
    const existingAccessCookie = (await page.context().cookies()).find((cookie) => cookie.name === 'access_token');
    expect(existingAccessCookie).toBeDefined();
    await page.context().clearCookies({ name: 'access_token' });
    await page.exposeFunction('assertNoAccessCookie', async () => {
      expect((await page.context().cookies()).find((cookie) => cookie.name === 'access_token')).toBeUndefined();
    });
    await installCredentialMock(page, 'success');
    await mockCsrf(page);
    await page.route('**/api/v1/auth/token', (route) => route.fulfill({
      json: { requires_webauthn_verification: true, webauthn_pending_token: 'pending-token' },
    }));
    await page.route('**/api/v1/auth/webauthn/authentication/options', (route) => route.fulfill({
      json: { publicKey: { challenge, rpId: 'localhost', allowCredentials: [], userVerification: 'required' } },
    }));
    await page.route('**/api/v1/auth/webauthn/authentication/verify', async (route) => {
      const body = route.request().postDataJSON();
      expect(body.credential.response.signature).toBe('BAUG');
      await page.context().addCookies([existingAccessCookie!]);
      await route.fulfill({
        status: 200,
        json: { token_type: 'bearer' },
      });
    });
    await page.route('**/api/v1/staffs/me**', (route) => route.fulfill({
      json: { role: 'app_admin', full_name: 'テスト管理者', is_mfa_enabled: false },
    }));

    const authResponse = page.waitForResponse('**/api/v1/auth/token');
    await page.goto('/auth/app-admin/login');
    await page.getByLabel('メールアドレス').fill('admin@example.com');
    await page.getByLabel('パスワード').fill('password');
    await page.getByLabel('合言葉').fill('passphrase');
    const loginPromise = page.getByRole('button', { name: 'ログイン' }).click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.webauthnAssertionStarted === 'true')).toBe(true);
    await loginPromise;
    expect((await authResponse).headers()['set-cookie']).toBeUndefined();
    await expect(page).toHaveURL(/\/app-admin$/);
  });

  for (const outcome of ['cancel', 'timeout', 'unsupported', 'browser-unsupported'] as const) {
    test(`shows a Japanese message when the WebAuthn ${outcome === 'cancel' ? 'request is cancelled' : outcome === 'timeout' ? 'request times out' : outcome === 'unsupported' ? 'authenticator is unavailable' : 'browser is unsupported'}`, async ({ page }) => {
      await installCredentialMock(page, outcome);
      await mockCsrf(page);
      await page.route('**/api/v1/auth/token', (route) => route.fulfill({
        json: { requires_webauthn_verification: true, webauthn_pending_token: 'pending-token' },
      }));
      await page.route('**/api/v1/auth/webauthn/authentication/options', (route) => route.fulfill({
        json: { publicKey: { challenge, rpId: 'localhost', allowCredentials: [], userVerification: 'required' } },
      }));
      await page.goto('/auth/app-admin/login');
      await page.getByLabel('メールアドレス').fill('admin@example.com');
      await page.getByLabel('パスワード').fill('password');
      await page.getByLabel('合言葉').fill('passphrase');
      await page.getByRole('button', { name: 'ログイン' }).click();
      const alert = page.locator('[role="alert"]').filter({ hasText: outcome === 'cancel' || outcome === 'timeout' ? 'キャンセルされたか' : '対応していません' });
      await expect(alert).toBeVisible();
      await expect(page).toHaveURL(/\/auth\/app-admin\/login$/);
    });
  }
});

test.describe('app_admin WebAuthn registration', () => {
  test('registers a passkey and does not log credential data', async ({ page }) => {
    await installCredentialMock(page, 'success');
    await mockCsrf(page);
    await page.route('**/api/v1/staffs/me**', (route) => route.fulfill({
      json: { role: 'app_admin', full_name: 'テスト管理者', is_mfa_enabled: false },
    }));
    await page.route('**/api/v1/auth/webauthn/credentials', (route) => route.fulfill({ json: [] }));
    await page.route('**/api/v1/auth/webauthn/registration/options', (route) => route.fulfill({
      json: { publicKey: { challenge, rp: { id: 'localhost', name: 'Keikakun Local' }, user: { id: challenge, name: 'admin@example.com', displayName: 'テスト管理者' }, excludeCredentials: [], userVerification: 'required' } },
    }));
    await page.route('**/api/v1/auth/webauthn/registration/verify', (route) => route.fulfill({
      json: { id: 'credential-id', display_name: 'MacBook Touch ID', transports: ['internal'], created_at: new Date().toISOString(), last_used_at: null },
    }));
    await page.context().addCookies([{ name: 'access_token', value: 'e2e-access-token', domain: 'localhost', path: '/' }]);

    const consoleMessages: string[] = [];
    page.on('console', (message) => consoleMessages.push(message.text()));
    await page.goto('/e2e/webauthn');
    await page.getByLabel('パスキー名').fill('MacBook Touch ID');
    await page.getByRole('button', { name: 'パスキーを登録' }).click();
    await expect(page.getByRole('status')).toContainText('パスキーを登録しました');
    expect(consoleMessages.join('\n')).not.toContain(challenge);
    expect(consoleMessages.join('\n')).not.toContain('mock-credential');
    expect(await page.evaluate(() => `${localStorage.getItem('challenge')} ${sessionStorage.getItem('challenge')}`)).not.toContain(challenge);
    expect(await page.evaluate(() => `${localStorage.getItem('credentialId')} ${sessionStorage.getItem('credentialId')}`)).not.toContain('mock-credential');
  });
});

test.describe('token URL protection', () => {
  test('decodes an encoded token from the token fragment and removes it from the URL', async ({ page }) => {
    let requestToken = '';
    await page.route('**/api/v1/auth/verify-email', async (route) => {
      requestToken = route.request().postDataJSON().token;
      await route.fulfill({ json: { message: 'メールアドレスの確認が完了しました', role: 'employee' } });
    });

    await page.goto('/auth/verify-email#token=token%2Fwith%20encoding');

    await expect(page.getByText('Eメールの確認が完了しました')).toBeVisible();
    expect(requestToken).toBe('token/with encoding');
    expect(new URL(page.url()).hash).toBe('');
  });

  test('rejects fragments other than token', async ({ page }) => {
    let verifyCalled = false;
    await page.route('**/api/v1/auth/verify-email', (route) => {
      verifyCalled = true;
      return route.fulfill({ json: { message: 'unexpected', role: 'employee' } });
    });

    await page.goto('/auth/verify-email#other=value');

    await expect(page.getByText('確認リンクが見つかりません。')).toBeVisible();
    expect(verifyCalled).toBe(false);
    expect(new URL(page.url()).hash).toBe('');
  });

  test('rejects malformed URL encoding without calling the verification API', async ({ page }) => {
    let verifyCalled = false;
    await page.route('**/api/v1/auth/verify-email', (route) => {
      verifyCalled = true;
      return route.fulfill({ json: { message: 'unexpected', role: 'employee' } });
    });

    await page.goto('/auth/verify-email?token=query-leak#token=%E0%A4%A');

    await expect(page.getByText('確認リンクが見つかりません。')).toBeVisible();
    expect(verifyCalled).toBe(false);
    expect(new URL(page.url()).search).toBe('');
    expect(new URL(page.url()).hash).toBe('');
  });
});
