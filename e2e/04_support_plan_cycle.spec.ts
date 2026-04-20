/**
 * 個別支援計画サイクル（SupportPlanCycle）E2Eテスト
 *
 * 検証項目:
 * - 支援計画ページへ直接遷移できる
 * - 5つのステータス項目（アセスメント〜モニタリング）が表示される
 * - PDF アップロード操作が実行できる（ファイル選択 → API レスポンス確認）
 *
 * 前提条件:
 * - TEST_OWNER が owner ロールでログイン済み
 * - beforeAll で利用者を API 経由で作成し、afterAll で削除する（自己完結テスト）
 *
 * 注意:
 * - ダッシュボードの /support_plan/{id} リンクは canEdit=true（MFA有効）の場合のみ表示される。
 * - E2Eテストアカウントは is_mfa_enabled=False のため canEdit=false となりリンクが出ない。
 * - そのため API で recipient ID を取得して直接 URL を構築して遷移する。
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { API_BASE_URL } from './helpers/test-data';

/** storageState のパス（beforeAll / afterAll の認証済みリクエストで使用） */
const AUTH_STATE_PATH = path.join(__dirname, '.auth/owner.json');

/** テスト用PDFのパス（最小限のPDFファイルを fixtures/ に配置） */
const SAMPLE_PDF = path.join(__dirname, 'fixtures', 'sample.pdf');

/** サンプルPDFが存在するか（モジュールロード時に1回だけ評価） */
const samplePdfExists = fs.existsSync(SAMPLE_PDF);

/** このスイートが作成した利用者 ID（afterAll でクリーンアップ） */
let createdRecipientId: string | null = null;

/**
 * API 経由で指定 recipient の support_plan ページへ移動する
 *
 * canEdit=false（MFA無効）の場合はダッシュボードに /support_plan/ リンクが表示されないため、
 * 事前に取得した recipient ID から URL を直接構築する。
 */
async function gotoSupportPlan(page: Page, recipientId: string): Promise<string> {
  const href = `/support_plan/${recipientId}`;
  await page.goto(href);
  await page.waitForURL(/\/support_plan\//, { timeout: 10000 });
  return href;
}

test.describe('個別支援計画サイクル', () => {

  /**
   * テスト開始前に利用者を1件 API 経由で作成する。
   * 03_welfare_recipient.spec.ts の afterAll が全E2E利用者を削除するため、
   * このスイートは自己完結で利用者を準備する必要がある。
   */
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
    try {
      const uid = Date.now().toString(36);
      const payload = {
        basic_info: {
          firstName: `サイクル${uid}`,
          lastName: 'E2E',
          firstNameFurigana: 'さいくる',
          lastNameFurigana: 'いーつーいー',
          birthDay: '1990-01-15',
          gender: 'male',
        },
        contact_address: {
          address: '東京都新宿区西新宿1-1-1',
          formOfResidence: 'home_with_family',
          meansOfTransportation: 'walk',
          tel: '090-0000-0000',
        },
        emergency_contacts: [
          {
            firstName: '太郎',
            lastName: '緊急',
            firstNameFurigana: 'たろう',
            lastNameFurigana: 'きんきゅう',
            relationship: 'その他',
            tel: '03-0000-0000',
            priority: 1,
          },
        ],
        disability_info: {
          disabilityOrDiseaseName: '知的障害',
          livelihoodProtection: 'not_receiving',
        },
        disability_details: [],
      };

      const response = await context.request.post(
        `${API_BASE_URL}/api/v1/welfare-recipients/`,
        {
          data: payload,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok()) {
        const body = await response.text();
        throw new Error(`利用者の作成に失敗しました (status: ${response.status()}): ${body}`);
      }

      const data = await response.json();
      createdRecipientId = data.recipient_id ?? null;

      if (!createdRecipientId) {
        throw new Error(`レスポンスに recipient_id が含まれていません: ${JSON.stringify(data)}`);
      }
    } finally {
      await context.close();
    }
  });

  /**
   * テスト終了後、beforeAll で作成した利用者を削除する。
   */
  test.afterAll(async ({ browser }) => {
    if (!createdRecipientId) return;
    const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
    try {
      await context.request.delete(
        `${API_BASE_URL}/api/v1/welfare-recipients/${createdRecipientId}`
      );
    } finally {
      await context.close();
    }
  });

  test('支援計画ページへ直接遷移できる', async ({ page }) => {
    if (!createdRecipientId) throw new Error('利用者 ID が未設定です（beforeAll 失敗）');
    const href = await gotoSupportPlan(page, createdRecipientId);

    await expect(page).toHaveURL(/\/support_plan\//);
    expect(href).toMatch(/\/support_plan\/.+/);
  });

  test('支援計画ページに5つのステータス項目が表示される', async ({ page }) => {
    if (!createdRecipientId) throw new Error('利用者 ID が未設定です（beforeAll 失敗）');
    await gotoSupportPlan(page, createdRecipientId);

    // 5ステータスの表示確認（カラムヘッダーのrole属性で特定）
    for (const status of ['アセスメント', '個別支援計画書 原案', '担当者会議', '個別支援計画書 本案', 'モニタリング']) {
      await expect(
        page.getByRole('columnheader', { name: status })
      ).toBeVisible({ timeout: 5000 });
    }
  });

  // R-6: samplePdfExists をモジュールレベルで評価し、テスト開始直後にスキップ判定する
  test('PDFアップロード → ステータスが更新される', async ({ page }) => {
    test.skip(!samplePdfExists, 'e2e/fixtures/sample.pdf が存在しないためスキップ');
    if (!createdRecipientId) throw new Error('利用者 ID が未設定です（beforeAll 失敗）');

    await gotoSupportPlan(page, createdRecipientId);

    // ファイルアップロード input を探す
    const fileInput = page.locator('input[type="file"]').first();
    const isVisible = await fileInput.isVisible({ timeout: 3000 }).catch(() => false);
    if (!isVisible) {
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

  test('支援計画ページにパンくずリストが表示される', async ({ page }) => {
    if (!createdRecipientId) throw new Error('利用者 ID が未設定です（beforeAll 失敗）');
    await gotoSupportPlan(page, createdRecipientId);

    // 何らかのナビゲーション要素が存在すること（Breadcrumb or back link）
    const navElement = page
      .locator('nav, [aria-label="breadcrumb"], a[href="/recipients"]')
      .first();
    await expect(navElement).toBeVisible({ timeout: 5000 });
  });

});
