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
import { test, expect } from './fixtures/auth';
import { generateRecipientData } from './helpers/test-data';

test.describe('利用者登録', () => {

  test('5セクション完走 → ダッシュボードへ遷移', async ({ loggedInPage: page }) => {
    const recipient = generateRecipientData();

    await page.goto('/recipients/new');
    await expect(page.locator('h1').filter({ hasText: '利用者新規登録' })).toBeVisible();

    // --- Section 0: 基本情報 ---
    await page.fill('input[placeholder="山田"]', recipient.last_name);
    await page.fill('input[placeholder="太郎"]', recipient.first_name);
    await page.fill('input[placeholder="やまだ"]', recipient.last_name_furigana);
    await page.fill('input[placeholder="たろう"]', recipient.first_name_furigana);

    // DateDrumPicker（年/月/日 それぞれ select）
    // ラベル「年」の親要素内 select を選択
    await page.locator('label').filter({ hasText: /^年$/ }).first()
      .locator('..').locator('select').selectOption('1990');
    await page.locator('label').filter({ hasText: /^月$/ }).first()
      .locator('..').locator('select').selectOption('1');
    await page.locator('label').filter({ hasText: /^日$/ }).first()
      .locator('..').locator('select').selectOption('15');

    // 性別
    await page.locator('select').filter({ hasNot: page.locator('[disabled]') }).last()
      .selectOption('male');

    await page.click('button:text("次へ")');

    // --- Section 1: 連絡先・住所情報 ---
    await expect(page.locator('h3').filter({ hasText: '連絡先・住所情報' })).toBeVisible();

    await page.fill('textarea[placeholder*="東京都"]', recipient.address);
    await page.locator('select').nth(0).selectOption('home_with_family');
    await page.locator('select').nth(1).selectOption('walk');
    await page.fill('input[type="tel"]', recipient.phone);

    await page.click('button:text("次へ")');

    // --- Section 2: 緊急連絡先 ---
    await expect(page.locator('h3').filter({ hasText: '緊急連絡先情報' })).toBeVisible();

    // 1件目の緊急連絡先（初期から1件）
    await page.fill('input[placeholder="田中"]', '緊急');
    await page.fill('input[placeholder="花子"]', '太郎');
    await page.fill('input[placeholder="たなか"]', 'きんきゅう');
    await page.fill('input[placeholder="はなこ"]', 'たろう');
    await page.fill('input[type="tel"]', '03-1234-5678');

    await page.click('button:text("次へ")');

    // --- Section 3: 障害・疾患情報 ---
    await expect(page.locator('h3').filter({ hasText: '障害・疾患情報' })).toBeVisible();

    await page.fill('input[placeholder*="統合失調症"]', recipient.disability_type);
    // 生活保護受給状況
    await page.locator('select').first().selectOption('not_receiving');

    await page.click('button:text("次へ")');

    // --- Section 4: 手帳・年金詳細（必須項目なし） ---
    await expect(page.locator('h3').filter({ hasText: /手帳|年金/ })).toBeVisible({ timeout: 5000 });

    // 登録完了ボタンをクリック
    await page.click('button:text("登録完了")');

    // owner は直接登録 → /dashboard へリダイレクト
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('必須項目未入力 → Section 0 でバリデーションエラー・次へ進めない', async ({ loggedInPage: page }) => {
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

  test('登録後 /recipients 一覧に利用者が表示される', async ({ loggedInPage: page }) => {
    const recipient = generateRecipientData();

    // 登録フロー実行
    await page.goto('/recipients/new');

    await page.fill('input[placeholder="山田"]', recipient.last_name);
    await page.fill('input[placeholder="太郎"]', recipient.first_name);
    await page.fill('input[placeholder="やまだ"]', recipient.last_name_furigana);
    await page.fill('input[placeholder="たろう"]', recipient.first_name_furigana);

    await page.locator('label').filter({ hasText: /^年$/ }).first()
      .locator('..').locator('select').selectOption('1985');
    await page.locator('label').filter({ hasText: /^月$/ }).first()
      .locator('..').locator('select').selectOption('6');
    await page.locator('label').filter({ hasText: /^日$/ }).first()
      .locator('..').locator('select').selectOption('20');
    await page.locator('select').filter({ hasNot: page.locator('[disabled]') }).last()
      .selectOption('female');
    await page.click('button:text("次へ")');

    await page.fill('textarea[placeholder*="東京都"]', recipient.address);
    await page.locator('select').nth(0).selectOption('home_alone');
    await page.locator('select').nth(1).selectOption('public_transport');
    await page.fill('input[type="tel"]', recipient.phone);
    await page.click('button:text("次へ")');

    await page.fill('input[placeholder="田中"]', '緊急');
    await page.fill('input[placeholder="花子"]', '花子');
    await page.fill('input[placeholder="たなか"]', 'きんきゅう');
    await page.fill('input[placeholder="はなこ"]', 'はなこ');
    await page.fill('input[type="tel"]', '03-9999-0000');
    await page.click('button:text("次へ")');

    await page.fill('input[placeholder*="統合失調症"]', recipient.disability_type);
    await page.locator('select').first().selectOption('not_receiving');
    await page.click('button:text("次へ")');

    await page.click('button:text("登録完了")');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // 一覧画面で確認
    await page.goto('/recipients');
    await page.waitForSelector('text=E2E', { timeout: 10000 });
    await expect(page.locator('text=E2E').first()).toBeVisible();
  });

});
