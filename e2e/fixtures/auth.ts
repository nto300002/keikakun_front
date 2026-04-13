/**
 * 認証済み状態でテストを開始するカスタムフィクスチャ
 *
 * ログインフローを共通化し、各テストで再利用する
 */
import { test as base, expect, type Page } from '@playwright/test';
import { TEST_OWNER } from '../helpers/test-data';

export type AuthFixtures = {
  loggedInPage: Page;
};

export const test = base.extend<AuthFixtures>({
  loggedInPage: async ({ page }, use) => {
    await loginAsOwner(page);
    await use(page);
  },
});

/**
 * オーナーアカウントでログインする
 * MFAなし・事業所選択なしの構成を前提とする
 */
export async function loginAsOwner(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', TEST_OWNER.email);
  await page.fill('input[name="password"]', TEST_OWNER.password);
  await page.click('button[type="submit"]');

  // ログイン後の遷移先を待機（MFA・事業所選択の分岐を考慮）
  await page.waitForURL(
    /\/(dashboard|auth\/mfa-verify|auth\/select-office)/,
    { timeout: 15000 }
  );

  // 事業所選択ページの場合は最初の事業所を選択
  if (page.url().includes('select-office')) {
    const officeItem = page.locator('button, a').filter({ hasText: /事業所|office/i }).first();
    await officeItem.click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }
}

export { expect } from '@playwright/test';
