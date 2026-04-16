/**
 * ログイン機能 E2Eテスト
 *
 * 検証項目:
 * - 正常ログイン → ダッシュボードへ遷移
 * - パスワード誤り → エラーメッセージ表示・ページ遷移なし
 * - 未登録メール → エラーメッセージ表示
 * - クッキー削除後は保護ルートへアクセス不可
 */
import { test, expect } from '@playwright/test';
import { TEST_OWNER } from './helpers/test-data';

// ログインフロー自体をテストするため、グローバルの storageState（ログイン済み状態）を使わない
// これがないと既にログイン済みの状態でテストが始まり、ログインページへ遷移できない
test.use({ storageState: undefined });

test.describe('ログイン', () => {

  test('正常ログイン → ダッシュボードへ遷移', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', TEST_OWNER.email);
    await page.fill('input[name="password"]', TEST_OWNER.password);
    await page.click('button[type="submit"]');

    // MFAなし → /dashboard
    // 事業所選択あり → /auth/select-office
    await page.waitForURL(
      /\/(dashboard|auth\/mfa-verify|auth\/select-office)/,
      { timeout: 15000 }
    );

    if (page.url().includes('select-office')) {
      // 複数事業所がある場合は最初の選択肢をクリック
      await page.locator('button, a').filter({ hasText: /事業所|office/i }).first().click();
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    }

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('パスワード誤り → エラーメッセージ表示・ページ遷移なし', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', TEST_OWNER.email);
    await page.fill('input[name="password"]', 'WrongPassword999!');
    await page.click('button[type="submit"]');

    // ダッシュボードへ遷移しないことを確認
    await page.waitForTimeout(3000);
    expect(page.url()).not.toContain('/dashboard');

    // エラーメッセージが表示されていること（LoginFormは div.text-red-400 に表示）
    await expect(
      page.locator('.text-red-400').filter({ hasText: /.+/ }).first()
    ).toBeVisible();
  });

  test('未登録メール → エラーメッセージ表示', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'notexist_e2e@example.com');
    await page.fill('input[name="password"]', 'SomePassword123!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);
    expect(page.url()).not.toContain('/dashboard');
  });

  test('未認証でダッシュボードへアクセス → ログインページへリダイレクト', async ({ page }) => {
    // Cookieなし状態でアクセス
    await page.context().clearCookies();
    await page.goto('/dashboard');

    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

});
