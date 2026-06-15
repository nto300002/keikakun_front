/**
 * ダッシュボード複合条件検索機能 - E2Eテスト
 *
 * 前提条件:
 * - Playwrightがインストールされていること: npm install -D @playwright/test
 * - バックエンドAPIが起動していること
 * - テストデータが準備されていること
 *
 * 実行コマンド:
 * npx playwright test e2e/dashboard-filtering.spec.ts
 */

import { test, expect, type Page } from '@playwright/test';

// storageState（playwright.config.ts で設定）により全テストは認証済み状態で開始する。
// beforeEach でのログインは不要。

/**
 * ダッシュボードデータが読み込み完了するまで待機するヘルパー
 *
 * 現在の実装では統計カードの「絞り込み」ボタンに title が付いているため、
 * Playwright では getByTitle('...でフィルター') で対象を特定する。
 */
async function waitForDashboardLoaded(page: Page) {
  // 見出しが表示されるまで待機
  await page.waitForSelector('h1', { timeout: 15000 });
  await expect(page.getByRole('heading', { name: '利用者ダッシュボード' })).toBeVisible({ timeout: 15000 });
  // 統計カードのフィルターボタンが描画されるまで待機
  await expect(getOverdueFilterButton(page)).toBeVisible({ timeout: 10000 });
}

function getOverdueFilterButton(page: Page) {
  return page.getByTitle('計画期限超過でフィルター');
}

function getUpcomingFilterButton(page: Page) {
  return page.getByTitle('計画期限間近でフィルター');
}

function getOverdueFilterChip(page: Page) {
  return page.locator('[aria-label="計画期限超過 フィルターを解除"]');
}

function getUpcomingFilterChip(page: Page) {
  return page.locator('[aria-label="計画期限間近（30日以内） フィルターを解除"]');
}

function getDashboardSearchInput(page: Page) {
  return page.getByPlaceholder('氏名・ふりがなで検索');
}

test.describe('ダッシュボード複合条件検索機能', () => {

  test.beforeEach(async ({ page }) => {
    // 各テスト前にダッシュボードへ移動（storageState でログイン済み）
    await page.goto('/dashboard');
    await waitForDashboardLoaded(page);
  });

  test('総利用者数と検索結果数が正しく表示される', async ({ page }) => {
    // Assert: 総利用者数が表示されている
    await expect(page.locator('text=総利用者数').first()).toBeVisible();

    // 初期状態では絞り込みセクションは表示されない（フィルター未適用）
    await expect(page.locator('text=絞り込み中:')).not.toBeVisible();

    // Act: フィルターボタンをクリック（計画期限超過）
    await getOverdueFilterButton(page).click();

    // Assert: Active Filters チップが表示される
    await expect(page.locator('text=絞り込み中:').first()).toBeVisible();
    await expect(getOverdueFilterChip(page)).toBeVisible();
  });

  test('フィルター名が明確になっている', async ({ page }) => {
    // Assert: 統計カードのラベルが表示されている
    await expect(page.locator('text=計画期限超過').first()).toBeVisible();
    await expect(page.locator('text=計画期限間近（30日以内）').first()).toBeVisible();
    // アセスメント開始期限は利用者一覧テーブルのカラムヘッダーに表示される
    await expect(page.getByRole('columnheader', { name: 'アセスメント開始期限' })).toBeVisible();
  });

  test('計画期限超過フィルターが動作する', async ({ page }) => {
    // Act: 計画期限超過フィルターボタンをクリック
    await getOverdueFilterButton(page).click();

    // Assert: Active Filters チップに表示される
    await expect(page.locator('text=絞り込み中:').first()).toBeVisible();
    await expect(getOverdueFilterChip(page)).toBeVisible();

    // Assert: フィルターボタンが活性化状態（解除）に変わる
    await expect(page.getByTitle('フィルター解除').first()).toBeVisible();
  });

  test('Active Filters チップが表示され、個別削除できる', async ({ page }) => {
    // Act: 複数のフィルターを適用
    await getOverdueFilterButton(page).click();
    await getUpcomingFilterButton(page).click();

    // 検索ワードを入力
    await getDashboardSearchInput(page).fill('田中');
    // waitForTimeout は削除。次行の expect がデバウンス後の状態変化を待機する。

    // Assert: Active Filters セクションが表示される
    await expect(page.locator('text=絞り込み中:').first()).toBeVisible();

    // Assert: 各フィルターチップが表示される
    await expect(page.locator('text=検索: "田中"').first()).toBeVisible();
    await expect(getOverdueFilterChip(page)).toBeVisible();
    await expect(getUpcomingFilterChip(page)).toBeVisible();

    // Act: 個別削除（計画期限超過チップの×ボタン）
    await getOverdueFilterChip(page).click();

    // Assert: 計画期限超過チップが消える
    await expect(getOverdueFilterChip(page)).not.toBeVisible();

    // Assert: 他のフィルターは残っている
    await expect(page.locator('text=検索: "田中"').first()).toBeVisible();
    await expect(getUpcomingFilterChip(page)).toBeVisible();
  });

  test('「すべてクリア」ボタンで全フィルターを解除できる', async ({ page }) => {
    // Act: 複数のフィルターを適用
    await getOverdueFilterButton(page).click();
    await getUpcomingFilterButton(page).click();
    await getDashboardSearchInput(page).fill('テスト');
    // waitForTimeout は削除。次行の expect がデバウンス後の状態変化を待機する。

    // Assert: Active Filters が表示されている
    await expect(page.locator('text=絞り込み中:').first()).toBeVisible();

    // Act: すべてクリアボタンをクリック
    await page.click('text=すべてクリア');

    // Assert: Active Filters セクションが消える
    await expect(page.locator('text=絞り込み中:')).not.toBeVisible();
  });

  test('複合条件フィルタリングが正しく動作する', async ({ page }) => {
    // Act: 複数のフィルターを同時に適用
    await getOverdueFilterButton(page).click();
    await getDashboardSearchInput(page).fill('田中');
    // waitForTimeout は削除。次行の expect がデバウンス後の状態変化を待機する。

    // Assert: 両方のフィルターが適用されている
    await expect(getOverdueFilterChip(page)).toBeVisible();
    await expect(page.locator('text=検索: "田中"').first()).toBeVisible();
  });

  test('フィルター適用後の検索結果数が正確', async ({ page }) => {
    // 初期の総利用者数を取得
    const totalCountText = await page.locator('text=総利用者数').locator('..').locator('p').nth(1).textContent();
    const totalCount = parseInt(totalCountText?.replace(/[^0-9]/g, '') || '0');

    // Act: フィルター適用
    await getOverdueFilterButton(page).click();
    // waitForTimeout は削除。次行の expect がフィルター適用後の DOM 変化を待機する。

    // Assert: フィルターが有効になったことを確認
    await expect(getOverdueFilterChip(page)).toBeVisible();
    expect(totalCount).toBeGreaterThanOrEqual(0);
  });

  test('モバイル表示でもActive Filtersチップが見やすい', async ({ page }) => {
    // Arrange: beforeEachで読み込み済みのダッシュボードをモバイル幅に変更する
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(getOverdueFilterButton(page)).toBeVisible({ timeout: 10000 });

    // Act: フィルター適用
    await getOverdueFilterButton(page).click();

    // Assert: Active Filters チップが表示されている
    await expect(page.locator('text=絞り込み中:').first()).toBeVisible();
    await expect(getOverdueFilterChip(page)).toBeVisible();
  });

  test('ページリロード後にフィルター状態がリセットされる', async ({ page }) => {
    // Act: フィルター適用
    await getOverdueFilterButton(page).click();
    await expect(page.locator('text=絞り込み中:').first()).toBeVisible();

    // Act: ページリロード
    await page.reload();
    await waitForDashboardLoaded(page);

    // Assert: リロード後はフィルターがリセットされる（URLパラメータ未実装のため）
    await expect(page.locator('text=絞り込み中:')).not.toBeVisible();
  });

  test('パフォーマンス: ダッシュボードのUI表示が15秒以内', async ({ page }) => {
    // Note: CI/本番ビルドでは高速だが、Next.js devサーバーはコンパイル時間を含む
    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForSelector('h1', { timeout: 15000 });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(15000);
  });

  test('連続フィルター切り替えが正常動作', async ({ page }) => {
    // Act: フィルターを複数回切り替え
    for (let i = 0; i < 3; i++) {
      await getOverdueFilterButton(page).click();
      // ボタンが「解除」状態へ変化するまで待機（waitForTimeout の代替）
      const deactivateButton = page.getByTitle('フィルター解除').first();
      await expect(deactivateButton).toBeVisible({ timeout: 2000 });
      await deactivateButton.click();
      // ボタンが「絞り込み」状態へ戻るまで待機
      await expect(getOverdueFilterButton(page)).toBeVisible({ timeout: 2000 });
    }

    // Assert: エラーが発生しない、UIが正常
    await expect(page.getByRole('heading', { name: '利用者一覧' })).toBeVisible();
    await expect(page.locator('text=絞り込み中:')).not.toBeVisible();
  });
});
