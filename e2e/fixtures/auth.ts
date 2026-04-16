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
import { type Page } from '@playwright/test';
import { TEST_OWNER } from '../helpers/test-data';

/**
 * オーナーアカウントでログインする
 *
 * auth.setup.ts から呼び出される（テスト全体で1回のみ）。
 */
export async function loginAsOwner(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', TEST_OWNER.email);
  await page.fill('input[name="password"]', TEST_OWNER.password);
  await page.click('button[type="submit"]');

  // ログイン後の全遷移先パターン（mfa-first-setup も含む）
  await page.waitForURL(
    /\/(dashboard|auth\/mfa-verify|auth\/mfa-first-setup|auth\/select-office)/,
    { timeout: 15000 }
  );

  // 事業所選択ページの場合は最初の事業所を選択
  if (page.url().includes('select-office')) {
    await page.locator('button, a').filter({ hasText: /事業所|office/i }).first().click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }
}
