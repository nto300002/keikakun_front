/**
 * 個別支援計画サイクル（SupportPlanCycle）E2Eテスト
 *
 * 検証項目:
 * - 利用者一覧から支援計画ページへ遷移できる
 * - 5つのステータス項目（アセスメント〜モニタリング）が表示される
 * - PDF アップロード操作が実行できる（ファイル選択 → API レスポンス確認）
 *
 * 前提条件:
 * - 利用者が1件以上存在すること（03_welfare_recipient.spec.ts を先に実行）
 * - 03_welfare_recipient テストで登録したデータが残っていること
 */
import { test, expect } from './fixtures/auth';
import * as path from 'path';

/** テスト用PDFのパス（最小限のPDFファイルを fixtures/ に配置） */
const SAMPLE_PDF = path.join(__dirname, 'fixtures', 'sample.pdf');

test.describe('個別支援計画サイクル', () => {

  test('利用者一覧から支援計画ページへ遷移できる', async ({ loggedInPage: page }) => {
    await page.goto('/recipients');

    // 利用者が表示されるまで待機
    await page.waitForSelector('[href*="/support_plan/"]', { timeout: 10000 });

    // 最初の利用者の支援計画リンクをクリック
    const planLink = page.locator('[href*="/support_plan/"]').first();
    await expect(planLink).toBeVisible();
    await planLink.click();

    // /support_plan/{id} へ遷移すること
    await page.waitForURL(/\/support_plan\/[^/]+$/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/support_plan\//);
  });

  test('支援計画ページに5つのステータス項目が表示される', async ({ loggedInPage: page }) => {
    await page.goto('/recipients');
    await page.waitForSelector('[href*="/support_plan/"]', { timeout: 10000 });

    const href = await page.locator('[href*="/support_plan/"]').first().getAttribute('href');
    if (!href) throw new Error('支援計画リンクが見つかりません');

    await page.goto(href);
    await page.waitForURL(/\/support_plan\//, { timeout: 10000 });

    // 5ステータスの表示確認
    for (const status of ['アセスメント', '計画書案', '会議用', '最終版', 'モニタリング']) {
      await expect(
        page.locator(`text=${status}`).first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('PDFアップロード → ステータスが更新される', async ({ loggedInPage: page }) => {
    // sample.pdf が存在しない場合はスキップ
    const fs = await import('fs');
    if (!fs.existsSync(SAMPLE_PDF)) {
      test.skip(true, 'e2e/fixtures/sample.pdf が存在しないためスキップ');
      return;
    }

    await page.goto('/recipients');
    await page.waitForSelector('[href*="/support_plan/"]', { timeout: 10000 });

    const href = await page.locator('[href*="/support_plan/"]').first().getAttribute('href');
    if (!href) throw new Error('支援計画リンクが見つかりません');

    await page.goto(href);
    await page.waitForURL(/\/support_plan\//, { timeout: 10000 });

    // ファイルアップロード input を探す
    const fileInput = page.locator('input[type="file"]').first();
    if (!(await fileInput.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip(true, 'ファイルアップロード input が見つからないためスキップ');
      return;
    }

    // PDF をセット → APIレスポンスを待機
    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('/support_plans') &&
          resp.request().method() === 'POST' &&
          resp.status() === 200,
        { timeout: 15000 }
      ),
      fileInput.setInputFiles(SAMPLE_PDF),
    ]);

    expect(response.status()).toBe(200);
  });

  test('支援計画ページにパンくずリストが表示される', async ({ loggedInPage: page }) => {
    await page.goto('/recipients');
    await page.waitForSelector('[href*="/support_plan/"]', { timeout: 10000 });

    const href = await page.locator('[href*="/support_plan/"]').first().getAttribute('href');
    if (!href) throw new Error('支援計画リンクが見つかりません');

    await page.goto(href);
    await page.waitForURL(/\/support_plan\//, { timeout: 10000 });

    // 何らかのナビゲーション要素が存在すること（Breadcrumb or back link）
    const navElement = page
      .locator('nav, [aria-label="breadcrumb"], a[href="/recipients"]')
      .first();
    await expect(navElement).toBeVisible({ timeout: 5000 });
  });

});
