/**
 * 利用者登録（WelfareRecipient）E2Eテスト
 *
 * 検証項目:
 * - 5セクションの多段フォームを完走 → /dashboard へ遷移
 * - 登録後 /recipients 一覧に利用者が表示される
 *
 * フォーム構成:
 *   Section 0: 基本情報（姓・名・ふりがな・生年月日・性別）
 *   Section 1: 連絡先・住所（住所・居住形態・交通手段・電話番号）
 *   Section 2: 緊急連絡先（姓・名・ふりがな・電話番号）
 *   Section 3: 障害・疾患情報（障害名・生活保護受給状況）
 *   Section 4: 手帳・年金詳細（任意）→ 登録完了ボタン
 *
 * 前提条件:
 * - TEST_OWNER が owner ロールでログイン済み
 * - owner は申請なしで直接登録可能
 */
import { test, expect } from '@playwright/test';
import { generateRecipientData } from './helpers/test-data';
import { fillAndSubmitRecipientForm } from './helpers/recipient-form';

test.describe('利用者登録', () => {

  test('5セクション完走 → ダッシュボードへ遷移', async ({ page }) => {
    const recipient = generateRecipientData();

    await page.goto('/recipients/new');
    await expect(page.locator('h1').filter({ hasText: '利用者新規登録' }).first()).toBeVisible();

    await fillAndSubmitRecipientForm(page, recipient);

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('必須項目未入力 → Section 0 でバリデーションエラー・次へ進めない', async ({ page }) => {
    await page.goto('/recipients/new');

    // 何も入力せずに「次へ」をクリック
    await page.click('button:text("次へ")');

    // Section 0 のまま留まること
    await expect(page.locator('h3').filter({ hasText: '基本情報' })).toBeVisible();

    // エラーメッセージが表示されること
    await expect(
      page.locator('p.text-red-400').first()
    ).toBeVisible();
  });

  test('登録後 /recipients 一覧に利用者が表示される', async ({ page }) => {
    const recipient = generateRecipientData();

    await page.goto('/recipients/new');

    await fillAndSubmitRecipientForm(page, recipient, {
      livingArrangement: 'home_alone',
      transportation: 'public_transport',
      birthYear: '1985',
      birthMonth: '6',
      birthDay: '20',
      gender: 'female',
    });

    // 一覧画面で確認（API フェッチ完了を待機してからアサート）
    await page.goto('/recipients');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=E2E').first()).toBeVisible({ timeout: 10000 });
  });

});
