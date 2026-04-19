/**
 * 認証ヘルパー
 *
 * auth.setup.ts からのみ使用される。
 *
 * # 認証の仕組み
 *
 * 1. auth.setup.ts（setup プロジェクト）が全テストより先に1回だけ実行される
 * 2. loginAsOwner() でログインし、Cookie 等を .auth/owner.json に保存する
 * 3. playwright.config.ts の chromium プロジェクトに storageState が設定されているため、
 *    標準 page フィクスチャは自動的に認証済みの状態で起動する
 *
 * # 各テストでの認証
 *
 * 各テストファイルは @playwright/test を直接 import し、標準 page フィクスチャを使う。
 * storageState は playwright.config.ts のプロジェクト設定が自動適用するため、
 * カスタムフィクスチャは不要。
 */
import { type Page, expect } from '@playwright/test';
import * as path from 'path';
import { TEST_OWNER } from '../helpers/test-data';

/**
 * オーナーアカウントでログインする
 *
 * auth.setup.ts から呼び出される（テスト全体で1回のみ）。
 */
export async function loginAsOwner(page: Page): Promise<void> {
  // ── 診断: ベース URL とページ遷移を記録 ──────────────────────────────
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? '(未設定)';
  console.log(`[auth] PLAYWRIGHT_BASE_URL = ${baseURL}`);

  // ページコンソールエラーを転送（ビルドエラー・JS エラーを CI ログで確認可能にする）
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`[browser:error] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    console.log(`[browser:pageerror] ${err.message}`);
  });

  // ── /auth/login への遷移 ───────────────────────────────────────────
  const response = await page.goto('/auth/login');
  console.log(`[auth] goto /auth/login → status: ${response?.status()}, url: ${page.url()}`);

  // ページが正常に読み込まれているか確認
  if (response && !response.ok()) {
    const body = await response.text().catch(() => '(取得失敗)');
    throw new Error(
      `ログインページの取得に失敗しました\n` +
      `  status: ${response.status()}\n` +
      `  url: ${page.url()}\n` +
      `  body(先頭500文字): ${body.slice(0, 500)}`,
    );
  }

  // DOM が安定するまで待機（React ハイドレーション完了後に操作する）
  await page.waitForLoadState('domcontentloaded');
  console.log(`[auth] domcontentloaded → url: ${page.url()}`);

  // email フィールドが出現するまで待機（ハイドレーション遅延対策）
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  console.log(`[auth] input[name="email"] found`);

  await page.fill('input[name="email"]', TEST_OWNER.email);

  // password フィールドが出現するまで明示的に待機して診断
  const passwordSelector = 'input[name="password"]';
  const passwordVisible = await page.waitForSelector(passwordSelector, { timeout: 15000 })
    .then(() => true)
    .catch(async () => {
      // タイムアウト時：ページ状態をスナップショット
      const currentUrl = page.url();
      const title = await page.title().catch(() => '(取得失敗)');
      const visibleText = await page.locator('body').innerText().catch(() => '(取得失敗)');
      const screenshotPath = path.join(__dirname, '..', 'test-results', 'auth-debug.png');
      await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
      console.log(`[auth] ❌ input[name="password"] が見つかりません`);
      console.log(`[auth]   現在 URL  : ${currentUrl}`);
      console.log(`[auth]   ページタイトル: ${title}`);
      console.log(`[auth]   表示テキスト(先頭300文字): ${visibleText.slice(0, 300)}`);
      console.log(`[auth]   スクリーンショット: ${screenshotPath}`);
      return false;
    });

  if (!passwordVisible) {
    throw new Error('input[name="password"] が見つかりませんでした（上記ログを確認）');
  }

  console.log(`[auth] input[name="password"] found`);
  await page.fill(passwordSelector, TEST_OWNER.password);
  await page.click('button[type="submit"]');

  // ログイン後の全遷移先パターン（mfa-first-setup も含む）
  await page.waitForURL(
    /\/(dashboard|auth\/mfa-verify|auth\/mfa-first-setup|auth\/select-office)/,
    { timeout: 15000 }
  );
  console.log(`[auth] ログイン後 URL: ${page.url()}`);

  // 事業所選択ページの場合は最初の事業所を選択
  if (page.url().includes('select-office')) {
    await page.locator('button, a').filter({ hasText: /事業所|office/i }).first().click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }
}
