/**
 * 認証ヘルパー
 *
 * auth.setup.ts からのみ使用される。
 */
import { type Page } from '@playwright/test';
import * as path from 'path';
import { TEST_OWNER } from '../helpers/test-data';

export async function loginAsOwner(page: Page): Promise<void> {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? '(未設定)';
  console.log(`[auth] PLAYWRIGHT_BASE_URL = ${baseURL}`);

  // ブラウザコンソールエラーを CI ログに転送
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log(`[browser:error] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    console.log(`[browser:pageerror] ${err.message}`);
  });

  // ── /auth/login への遷移 ─────────────────────────────────────────
  const gotoResponse = await page.goto('/auth/login');
  console.log(`[auth] goto → status: ${gotoResponse?.status()}, url: ${page.url()}`);

  if (gotoResponse && !gotoResponse.ok()) {
    const body = await gotoResponse.text().catch(() => '(取得失敗)');
    throw new Error(
      `ログインページが ${gotoResponse.status()} を返しました\n` +
      `  url: ${page.url()}\n` +
      `  body(先頭500文字): ${body.slice(0, 500)}`,
    );
  }

  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.fill('input[name="email"]', TEST_OWNER.email);
  await page.waitForSelector('input[name="password"]', { timeout: 15000 });
  await page.fill('input[name="password"]', TEST_OWNER.password);

  // ── ログインボタン押下 + /auth/token のレスポンスを同時に捕捉 ────
  // NEXT_PUBLIC_API_URL がビルド時に未設定だと http://localhost:8000 に飛ぶため、
  // 実際のリクエスト先 URL とレスポンスを記録して確認する。
  const [loginApiResponse] = await Promise.all([
    page.waitForResponse(
      (resp) => resp.url().includes('/auth/token') && resp.request().method() === 'POST',
      { timeout: 15000 },
    ).catch(async () => {
      // /auth/token へのリクエスト自体が来なかった（送信先が localhost 等でネットワークエラー）
      const url = page.url();
      const text = await page.locator('body').innerText().catch(() => '');
      console.log(`[auth] ❌ /auth/token へのリクエストが 15 秒以内に発生しませんでした`);
      console.log(`[auth]   現在 URL: ${url}`);
      console.log(`[auth]   ページテキスト(先頭300): ${text.slice(0, 300)}`);
      return null;
    }),
    page.click('button[type="submit"]'),
  ]);

  if (loginApiResponse) {
    const loginStatus = loginApiResponse.status();
    const loginUrl = loginApiResponse.url();
    const loginBody = await loginApiResponse.text().catch(() => '(取得失敗)');
    console.log(`[auth] /auth/token → status: ${loginStatus}, url: ${loginUrl}`);
    console.log(`[auth] /auth/token body(先頭300): ${loginBody.slice(0, 300)}`);

    if (loginStatus !== 200) {
      const currentUrl = page.url();
      throw new Error(
        `ログイン API がエラーを返しました\n` +
        `  リクエスト先: ${loginUrl}\n` +
        `  status: ${loginStatus}\n` +
        `  body: ${loginBody}\n` +
        `  現在 URL: ${currentUrl}`,
      );
    }

    // ── Vercel Preview 対応: access_token Cookie をフロントドメインにも設定 ─────
    // access_token は Domain=.keikakun.com で発行されるため、
    // vercel.app ドメインでは Next.js middleware がこの Cookie を参照できない。
    // API ドメインに保存された access_token を Playwright context.cookies() で取得し、
    // Vercel ドメイン用として手動追加することで解決する。
    const apiUrl = new URL(loginApiResponse.url());
    const apiOrigin = `${apiUrl.protocol}//${apiUrl.hostname}`;
    const apiCookies = await page.context().cookies([apiOrigin]);
    const accessTokenCookie = apiCookies.find(c => c.name === 'access_token');

    if (accessTokenCookie) {
      const currentHostname = new URL(page.url()).hostname;
      await page.context().addCookies([{
        name: accessTokenCookie.name,
        value: accessTokenCookie.value,
        domain: currentHostname,
        path: accessTokenCookie.path,
        httpOnly: accessTokenCookie.httpOnly,
        secure: accessTokenCookie.secure,
        sameSite: accessTokenCookie.sameSite,
      }]);
      console.log(`[auth] access_token を ${currentHostname} ドメインに追加しました`);
    } else {
      console.log(`[auth] ⚠️ API ドメインに access_token Cookie が見つかりませんでした（APIドメイン: ${apiOrigin}）`);
      const allCookies = await page.context().cookies();
      console.log(`[auth]   全 Cookie 一覧: ${allCookies.map(c => `${c.name}@${c.domain}`).join(', ')}`);
    }
  } else {
    // リクエスト自体が飛ばなかったケース
    const screenshotPath = path.join(__dirname, '..', 'test-results', 'auth-no-request.png');
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    throw new Error('/auth/token へのリクエストが発生しませんでした（ネットワークエラーの可能性。NEXT_PUBLIC_API_URL の Vercel Preview 設定を確認）');
  }

  // ── ログイン後のリダイレクト待機 ─────────────────────────────────
  await page.waitForURL(
    /\/(dashboard|auth\/mfa-verify|auth\/mfa-first-setup|auth\/select-office)/,
    { timeout: 15000 },
  ).catch(async () => {
    const currentUrl = page.url();
    const text = await page.locator('body').innerText().catch(() => '');
    const screenshotPath = path.join(__dirname, '..', 'test-results', 'auth-redirect-timeout.png');
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    throw new Error(
      `ログイン後のリダイレクトが発生しませんでした\n` +
      `  現在 URL: ${currentUrl}\n` +
      `  ページテキスト(先頭300): ${text.slice(0, 300)}`,
    );
  });

  console.log(`[auth] ログイン成功 → ${page.url()}`);

  if (page.url().includes('select-office')) {
    await page.locator('button, a').filter({ hasText: /事業所|office/i }).first().click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }
}
