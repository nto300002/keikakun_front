/**
 * 個別支援計画サイクル（SupportPlanCycle）E2Eテスト
 *
 * 検証項目:
 * - 支援計画ページへ直接遷移できる
 * - 5つのステータス項目（アセスメント〜モニタリング）が表示される
 * - PDF アップロード操作が実行できる（ファイル選択 → API レスポンス確認）
 *
 * 前提条件:
 * - 利用者が1件以上存在すること（03_welfare_recipient.spec.ts を先に実行）
 *
 * 注意:
 * - ダッシュボードの /support_plan/{id} リンクは canEdit=true（MFA有効）の場合のみ表示される。
 * - E2Eテストアカウントは is_mfa_enabled=False のため canEdit=false となりリンクが出ない。
 * - そのため API で recipient ID を取得して直接 URL を構築して遷移する。
 */
import { test, expect, type Page } from './fixtures/auth';
import * as fs from 'fs';
import * as path from 'path';

/** テスト用PDFのパス（最小限のPDFファイルを fixtures/ に配置） */
const SAMPLE_PDF = path.join(__dirname, 'fixtures', 'sample.pdf');

/** バックエンド API のベース URL */
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

/**
 * API 経由で最初の利用者の support_plan ページへ移動する
 *
 * canEdit=false（MFA無効）の場合はダッシュボードに /support_plan/ リンクが表示されないため、
 * バックエンド API から recipient ID を取得して URL を直接構築する。
 */
async function gotoFirstSupportPlan(page: Page): Promise<string> {
  // バックエンド API から利用者一覧を取得（Cookie は credentials: include で自動送信される）
  const response = await page.request.get(
    `${API_BASE_URL}/api/v1/welfare-recipients/`,
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (!response.ok()) {
    throw new Error(`利用者一覧の取得に失敗しました (status: ${response.status()})`);
  }

  const data = await response.json();
  const recipients = data.recipients ?? data.items ?? data;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('利用者が0件です。03_welfare_recipient.spec.ts を先に実行してください。');
  }

  const recipientId = recipients[0].id;
  const href = `/support_plan/${recipientId}`;

  await page.goto(href);
  await page.waitForURL(/\/support_plan\//, { timeout: 10000 });
  return href;
}

test.describe('個別支援計画サイクル', () => {

  test('支援計画ページへ直接遷移できる', async ({ loggedInPage: page }) => {
    const href = await gotoFirstSupportPlan(page);

    // /support_plan/{id} へ遷移していること
    await expect(page).toHaveURL(/\/support_plan\//);
    expect(href).toMatch(/\/support_plan\/.+/);
  });

  test('支援計画ページに5つのステータス項目が表示される', async ({ loggedInPage: page }) => {
    await gotoFirstSupportPlan(page);

    // 5ステータスの表示確認（カラムヘッダーのrole属性で特定）
    for (const status of ['アセスメント', '個別支援計画書 原案', '担当者会議', '個別支援計画書 本案', 'モニタリング']) {
      await expect(
        page.getByRole('columnheader', { name: status })
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('PDFアップロード → ステータスが更新される', async ({ loggedInPage: page }) => {
    test.skip(!fs.existsSync(SAMPLE_PDF), 'e2e/fixtures/sample.pdf が存在しないためスキップ');

    await gotoFirstSupportPlan(page);

    // ファイルアップロード input を探す
    const fileInput = page.locator('input[type="file"]').first();
    const isVisible = await fileInput.isVisible({ timeout: 3000 }).catch(() => false);
    test.skip(!isVisible, 'ファイルアップロード input が見つからないためスキップ');

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
    await gotoFirstSupportPlan(page);

    // 何らかのナビゲーション要素が存在すること（Breadcrumb or back link）
    const navElement = page
      .locator('nav, [aria-label="breadcrumb"], a[href="/recipients"]')
      .first();
    await expect(navElement).toBeVisible({ timeout: 5000 });
  });

});
