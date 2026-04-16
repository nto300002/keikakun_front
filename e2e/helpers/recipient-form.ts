/**
 * 利用者登録フォーム（5セクション）の入力ヘルパー
 *
 * RecipientRegistrationForm.tsx の各セクションに対応する。
 * `name` 属性が付与されていないため getByPlaceholder() を使用するが、
 * 将来的に data-testid が追加された場合はそちらへ移行すること（R-4参照）。
 */
import { type Page } from '@playwright/test';
import { type generateRecipientData } from './test-data';

type RecipientData = ReturnType<typeof generateRecipientData>;

interface RecipientFormOptions {
  /** 居住形態 select の value（デフォルト: 'home_with_family'） */
  livingArrangement?: string;
  /** 交通手段 select の value（デフォルト: 'walk'） */
  transportation?: string;
  /** 生年: デフォルト '1990' */
  birthYear?: string;
  /** 生月: デフォルト '1' */
  birthMonth?: string;
  /** 生日: デフォルト '15' */
  birthDay?: string;
  /** 性別 select の value（デフォルト: 'male'） */
  gender?: string;
}

/**
 * 利用者登録フォーム（Section 0〜4）を入力して登録完了まで進める。
 *
 * 呼び出し前に `/recipients/new` に遷移済みであること。
 * 完了後は `/dashboard` へリダイレクトされる（owner の場合）。
 */
export async function fillAndSubmitRecipientForm(
  page: Page,
  data: RecipientData,
  options: RecipientFormOptions = {},
): Promise<void> {
  const {
    livingArrangement = 'home_with_family',
    transportation = 'walk',
    birthYear = '1990',
    birthMonth = '1',
    birthDay = '15',
    gender = 'male',
  } = options;

  // --- Section 0: 基本情報 ---
  await page.getByPlaceholder('山田').fill(data.last_name);
  await page.getByPlaceholder('太郎').fill(data.first_name);
  await page.getByPlaceholder('やまだ').fill(data.last_name_furigana);
  await page.getByPlaceholder('たろう').fill(data.first_name_furigana);

  // DateDrumPicker（年/月/日 それぞれ label 親の select）
  await page.locator('label').filter({ hasText: /^年$/ }).first()
    .locator('..').locator('select').selectOption(birthYear);
  await page.locator('label').filter({ hasText: /^月$/ }).first()
    .locator('..').locator('select').selectOption(birthMonth);
  await page.locator('label').filter({ hasText: /^日$/ }).first()
    .locator('..').locator('select').selectOption(birthDay);

  // 性別（disabled でない select の末尾）
  await page.locator('select').filter({ hasNot: page.locator('[disabled]') }).last()
    .selectOption(gender);

  await page.click('button:text("次へ")');

  // --- Section 1: 連絡先・住所情報 ---
  await page.getByPlaceholder(/東京都/).fill(data.address);
  await page.locator('select').nth(0).selectOption(livingArrangement);
  await page.locator('select').nth(1).selectOption(transportation);
  await page.fill('input[type="tel"]', data.phone);

  await page.click('button:text("次へ")');

  // --- Section 2: 緊急連絡先 ---
  await page.getByPlaceholder('田中').fill('緊急');
  await page.getByPlaceholder('花子').fill('太郎');
  await page.getByPlaceholder('たなか').fill('きんきゅう');
  await page.getByPlaceholder('はなこ').fill('たろう');
  await page.locator('select').first().selectOption('その他');
  await page.fill('input[type="tel"]', '03-1234-5678');

  await page.click('button:text("次へ")');

  // --- Section 3: 障害・疾患情報 ---
  await page.getByPlaceholder(/統合失調症/).fill(data.disability_type);
  await page.locator('select').first().selectOption('not_receiving');

  await page.click('button:text("次へ")');

  // --- Section 4: 手帳・年金詳細（必須項目なし） ---
  await page.locator('h3').filter({ hasText: /手帳|年金/ }).waitFor({ timeout: 5000 });

  await page.click('button:text("登録完了")');
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}
