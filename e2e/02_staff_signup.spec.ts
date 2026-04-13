/**
 * スタッフ登録（Signup）E2Eテスト
 *
 * 検証項目:
 * - 正常登録 → /auth/signup-success へ遷移
 * - パスワード不一致 → エラーメッセージ表示・遷移なし
 *
 * 前提条件:
 * - 利用規約・プライバシーポリシーの同意チェックボックスが存在する
 *   (#terms-agree / #privacy-agree)
 */
import { test, expect } from '@playwright/test';
import { generateStaffData } from './helpers/test-data';

test.describe('スタッフ登録', () => {

  test('正常登録（employee）→ signup-success ページへ遷移', async ({ page }) => {
    const staff = generateStaffData();

    await page.goto('/auth/signup');

    // 姓名（日本語のみ許容: pattern=^[ぁ-ん ァ-ヶー一-龥々・　]+$）
    await page.fill('input[name="last_name"]', '山田');
    await page.fill('input[name="first_name"]', '太郎');
    await page.fill('input[name="last_name_furigana"]', 'やまだ');
    await page.fill('input[name="first_name_furigana"]', 'たろう');
    await page.fill('input[name="email"]', staff.email);

    // 役割選択（select: employee / manager）
    await page.selectOption('select[name="role"]', 'employee');

    // パスワード
    await page.fill('input[name="password"]', staff.password);
    await page.fill('input[name="confirmPassword"]', staff.confirmPassword);

    // 利用規約・プライバシーポリシーへの同意（チェックしないと送信ボタンがdisabled）
    await page.check('#terms-agree');
    await page.check('#privacy-agree');

    // 送信ボタンが有効になったことを確認してからクリック
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/auth\/signup-success/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/auth\/signup-success/);
  });

  test('パスワード不一致 → エラーメッセージ表示', async ({ page }) => {
    const staff = generateStaffData();

    await page.goto('/auth/signup');

    await page.fill('input[name="last_name"]', '山田');
    await page.fill('input[name="first_name"]', '太郎');
    await page.fill('input[name="last_name_furigana"]', 'やまだ');
    await page.fill('input[name="first_name_furigana"]', 'たろう');
    await page.fill('input[name="email"]', staff.email);
    await page.selectOption('select[name="role"]', 'employee');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass999!');

    await page.check('#terms-agree');
    await page.check('#privacy-agree');
    await page.click('button[type="submit"]');

    // signup-success へ遷移しないこと
    await page.waitForTimeout(1500);
    expect(page.url()).not.toContain('/signup-success');

    // エラーメッセージ（パスワードが一致しません）が表示されること
    await expect(
      page.locator('.text-red-400').filter({ hasText: /パスワード/ }).first()
    ).toBeVisible();
  });

  test('利用規約未同意では送信ボタンが無効', async ({ page }) => {
    const staff = generateStaffData();

    await page.goto('/auth/signup');

    await page.fill('input[name="last_name"]', '山田');
    await page.fill('input[name="first_name"]', '太郎');
    await page.fill('input[name="last_name_furigana"]', 'やまだ');
    await page.fill('input[name="first_name_furigana"]', 'たろう');
    await page.fill('input[name="email"]', staff.email);
    await page.selectOption('select[name="role"]', 'employee');
    await page.fill('input[name="password"]', staff.password);
    await page.fill('input[name="confirmPassword"]', staff.confirmPassword);

    // チェックしない → ボタンが disabled であることを確認
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

});
