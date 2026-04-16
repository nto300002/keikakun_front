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
 *
 * 注意: チェックボックスを直接 page.check() するとエラーになる。
 * TermsAgreement コンポーネントは「モーダルを読んでから同意」フローを強制するため、
 * モーダルを開いてスクロール → 「同意する」ボタンをクリックする必要がある。
 *
 * クリーンアップ:
 * - afterAll で登録したスタッフを DELETE /api/v1/staffs/{id} で削除する。
 * - 登録直後は office_associations が空（未承認）のため、通常の同一事務所チェックが
 *   スキップされるよう backend を修正済み。
 */
import { test, expect, type Page } from '@playwright/test';
import * as path from 'path';
import { generateStaffData, API_BASE_URL } from './helpers/test-data';

/** storageState のパス（afterAll のクリーンアップで使用） */
const AUTH_STATE_PATH = path.join(__dirname, '.auth/owner.json');

// サインアップフロー自体をテストするため、グローバルの storageState（ログイン済み状態）を使わない
// owner の Cookie が送信されると、バックエンドや CSRF トークン初期化で予期せぬ干渉が起きる
test.use({ storageState: undefined });

/** 正常登録テストで作成したスタッフの ID（afterAll でクリーンアップ） */
let createdStaffId: string | null = null;

/**
 * 利用規約 or プライバシーポリシーのモーダル同意フローを実行する
 *
 * TermsAgreement コンポーネントの仕様:
 * - チェックボックス直接クリック → 警告表示のみ（同意にならない）
 * - モーダルを 95% 以上スクロール後に「同意する」ボタンが活性化
 */
async function agreeViaModal(page: Page, type: 'terms' | 'privacy'): Promise<void> {
  const linkText = type === 'terms' ? '利用規約' : 'プライバシーポリシー';

  // リンクボタン（モーダルを開く）をクリック
  // label 内の button[type="button"] を対象にする（submit ボタンと区別）
  await page.locator('label').filter({ hasText: linkText })
    .locator('button[type="button"]')
    .click();

  // モーダルのスクロール可能コンテンツ領域を最下部までスクロール
  // TermsModal の contentRef: div[style*="scroll-behavior"].overflow-y-auto
  const contentArea = page.locator('div[style*="scroll-behavior"]').first();
  await contentArea.waitFor({ state: 'visible', timeout: 5000 });
  await contentArea.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });

  // 「同意する」ボタンが有効化されるまで待機（95%スクロールで活性化）
  const agreeButton = page.locator('button').filter({ hasText: '同意する' });
  await expect(agreeButton).toBeEnabled({ timeout: 5000 });
  await agreeButton.click();

  // モーダルが閉じるまで待機
  await expect(contentArea).not.toBeVisible({ timeout: 5000 });
}

test.describe('スタッフ登録', () => {

  /**
   * テスト終了後、正常登録テストで作成したスタッフを削除する。
   *
   * 認証: owner の storageState を使って DELETE /api/v1/staffs/{id} を呼ぶ。
   * backend: 事業所未所属スタッフ（office_associations = []）は同一事務所チェックをスキップするよう修正済み。
   */
  test.afterAll(async ({ browser }) => {
    if (!createdStaffId) return;

    const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
    try {
      const resp = await context.request.delete(
        `${API_BASE_URL}/api/v1/staffs/${createdStaffId}`
      );
      if (resp.ok()) {
        console.log(`[cleanup] E2E スタッフを削除しました: ${createdStaffId}`);
      } else {
        console.warn(`[cleanup] E2E スタッフの削除に失敗しました (status: ${resp.status()})`);
      }
    } finally {
      await context.close();
    }
  });

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

    // 利用規約・プライバシーポリシーへの同意（モーダルを読んでから同意）
    await agreeViaModal(page, 'terms');
    await agreeViaModal(page, 'privacy');

    // 送信ボタンが有効になったことを確認してからクリック
    await expect(page.locator('button[type="submit"]')).toBeEnabled();

    // POST /auth/register のレスポンスをインターセプトしてスタッフ ID を取得する
    // afterAll でのクリーンアップに使用
    const [registerResponse] = await Promise.all([
      page.waitForResponse(
        (resp) => /\/api\/v1\/auth\/register$/.test(resp.url()) && resp.status() === 201,
        { timeout: 15000 }
      ),
      page.click('button[type="submit"]'),
    ]);

    const body = await registerResponse.json().catch(() => null);
    if (body?.id) {
      createdStaffId = body.id;
    }

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

    // パスワード不一致でも同意フローは通す（送信してエラーを確認するため）
    await agreeViaModal(page, 'terms');
    await agreeViaModal(page, 'privacy');
    await page.click('button[type="submit"]');

    // signup-success へ遷移しないこと（エラー要素が表示されるまで待機）
    await expect(
      page.locator('.text-red-400').filter({ hasText: /パスワード/ }).first()
    ).toBeVisible({ timeout: 5000 });
    expect(page.url()).not.toContain('/signup-success');
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
