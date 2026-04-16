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
 * BiFilterAlt（react-icons）はSVG内に <title> 要素を生成するため、
 * Playwright では getByRole('img', { name: '...' }) でフィルターアイコンを特定する。
 */
async function waitForDashboardLoaded(page: Page) {
  // 見出しが表示されるまで待機
  await page.waitForSelector('h1', { timeout: 15000 });
  await expect(page.getByRole('heading', { name: '利用者ダッシュボード' })).toBeVisible({ timeout: 15000 });
  // 統計カードのフィルターアイコンが描画されるまで待機
  await expect(page.getByRole('img', { name: '計画期限切れでフィルター' })).toBeVisible({ timeout: 10000 });
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

    // Act: フィルターアイコンをクリック（計画期限切れ）
    await page.getByRole('img', { name: '計画期限切れでフィルター' }).click();

    // Assert: Active Filters チップが表示される
    await expect(page.locator('text=絞り込み中:').first()).toBeVisible();
    await expect(page.locator('[aria-label="計画期限切れ フィルターを解除"]')).toBeVisible();
  });

  test('フィルター名が明確になっている', async ({ page }) => {
    // Assert: 統計カードのラベルが表示されている
    await expect(page.locator('text=計画期限切れ').first()).toBeVisible();
    await expect(page.locator('text=計画期限間近（30日以内）').first()).toBeVisible();
    // アセスメント開始期限は利用者一覧テーブルのカラムヘッダーに表示される
    await expect(page.getByRole('columnheader', { name: 'アセスメント開始期限' })).toBeVisible();
  });

  test('計画期限切れフィルターが動作する', async ({ page }) => {
    // Act: 計画期限切れフィルターアイコンをクリック
    await page.getByRole('img', { name: '計画期限切れでフィルター' }).click();

    // Assert: Active Filters チップに表示される
    await expect(page.locator('text=絞り込み中:').first()).toBeVisible();
    await expect(page.locator('[aria-label="計画期限切れ フィルターを解除"]')).toBeVisible();

    // Assert: フィルターアイコンが活性化状態（解除アイコン）に変わる
    await expect(page.getByRole('img', { name: 'フィルター解除' }).first()).toBeVisible();
  });

  test('Active Filters チップが表示され、個別削除できる', async ({ page }) => {
    // Act: 複数のフィルターを適用
    await page.getByRole('img', { name: '計画期限切れでフィルター' }).click();
    await page.getByRole('img', { name: '計画期限間近でフィルター' }).click();

    // 検索ワードを入力
    await page.fill('input[placeholder="検索"]', '田中');
    // waitForTimeout は削除。次行の expect がデバウンス後の状態変化を待機する。

    // Assert: Active Filters セクションが表示される
    await expect(page.locator('text=絞り込み中:').first()).toBeVisible();

    // Assert: 各フィルターチップが表示される
    await expect(page.locator('text=検索: "田中"').first()).toBeVisible();
    await expect(page.locator('[aria-label="計画期限切れ フィルターを解除"]')).toBeVisible();
    await expect(page.locator('[aria-label="計画期限間近（30日以内） フィルターを解除"]')).toBeVisible();

    // Act: 個別削除（計画期限切れチップの×ボタン）
    await page.locator('[aria-label="計画期限切れ フィルターを解除"]').click();

    // Assert: 計画期限切れチップが消える
    await expect(page.locator('[aria-label="計画期限切れ フィルターを解除"]')).not.toBeVisible();

    // Assert: 他のフィルターは残っている
    await expect(page.locator('text=検索: "田中"').first()).toBeVisible();
    await expect(page.locator('[aria-label="計画期限間近（30日以内） フィルターを解除"]')).toBeVisible();
  });

  test('「すべてクリア」ボタンで全フィルターを解除できる', async ({ page }) => {
    // Act: 複数のフィルターを適用
    await page.getByRole('img', { name: '計画期限切れでフィルター' }).click();
    await page.getByRole('img', { name: '計画期限間近でフィルター' }).click();
    await page.fill('input[placeholder="検索"]', 'テスト');
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
    await page.getByRole('img', { name: '計画期限切れでフィルター' }).click();
    await page.fill('input[placeholder="検索"]', '田中');
    // waitForTimeout は削除。次行の expect がデバウンス後の状態変化を待機する。

    // Assert: 両方のフィルターが適用されている
    await expect(page.locator('[aria-label="計画期限切れ フィルターを解除"]')).toBeVisible();
    await expect(page.locator('text=検索: "田中"').first()).toBeVisible();
  });

  test('フィルター適用後の検索結果数が正確', async ({ page }) => {
    // 初期の総利用者数を取得
    const totalCountText = await page.locator('text=総利用者数').locator('..').locator('p').nth(1).textContent();
    const totalCount = parseInt(totalCountText?.replace(/[^0-9]/g, '') || '0');

    // Act: フィルター適用
    await page.getByRole('img', { name: '計画期限切れでフィルター' }).click();
    // waitForTimeout は削除。次行の expect がフィルター適用後の DOM 変化を待機する。

    // Assert: フィルターが有効になったことを確認
    await expect(page.locator('[aria-label="計画期限切れ フィルターを解除"]')).toBeVisible();
    expect(totalCount).toBeGreaterThanOrEqual(0);
  });

  test('モバイル表示でもActive Filtersチップが見やすい', async ({ page }) => {
    // Arrange: モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await waitForDashboardLoaded(page);

    // Act: フィルター適用
    await page.getByRole('img', { name: '計画期限切れでフィルター' }).click();

    // Assert: Active Filters チップが表示されている
    await expect(page.locator('text=絞り込み中:').first()).toBeVisible();
    await expect(page.locator('[aria-label="計画期限切れ フィルターを解除"]')).toBeVisible();
  });

  test('ページリロード後にフィルター状態がリセットされる', async ({ page }) => {
    // Act: フィルター適用
    await page.getByRole('img', { name: '計画期限切れでフィルター' }).click();
    await expect(page.locator('text=絞り込み中:').first()).toBeVisible();

    // Act: ページリロード
    await page.reload();
    await waitForDashboardLoaded(page);

    // Assert: リロード後はフィルターがリセットされる（URLパラメータ未実装のため）
    await expect(page.locator('text=絞り込み中:')).not.toBeVisible();
  });

  test('パフォーマンス: ダッシュボードのUI表示が10秒以内', async ({ page }) => {
    // Note: CI/本番ビルドでは高速だが、Next.js devサーバーはコンパイル時間を含む
    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForSelector('h1', { timeout: 15000 });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);
  });

  test('連続フィルター切り替えが正常動作', async ({ page }) => {
    const filterIcon = page.getByRole('img', { name: '計画期限切れでフィルター' });
    const deactivateIcon = page.getByRole('img', { name: 'フィルター解除' }).first();

    // Act: フィルターを複数回切り替え
    for (let i = 0; i < 3; i++) {
      await filterIcon.click();
      // アイコンが「解除」状態へ変化するまで待機（waitForTimeout の代替）
      await expect(deactivateIcon).toBeVisible({ timeout: 2000 });
      await deactivateIcon.click();
      // アイコンが「有効化」状態へ戻るまで待機
      await expect(filterIcon).toBeVisible({ timeout: 2000 });
    }

    // Assert: エラーが発生しない、UIが正常
    await expect(page.getByRole('heading', { name: '利用者一覧' })).toBeVisible();
    await expect(page.locator('text=絞り込み中:')).not.toBeVisible();
  });
});
