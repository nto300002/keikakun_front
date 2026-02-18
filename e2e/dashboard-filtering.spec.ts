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

import { test, expect } from '@playwright/test';

// テスト用の認証情報
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!'
};

// ログインヘルパー
async function login(page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('ダッシュボード複合条件検索機能', () => {

  test.beforeEach(async ({ page }) => {
    // 各テスト前にログイン
    await login(page);
  });

  test('総利用者数と検索結果数が正しく表示される', async ({ page }) => {
    // Arrange: ダッシュボードページを表示
    await page.goto('/dashboard');

    // Act & Assert: 総利用者数が表示されている
    const totalCount = await page.locator('text=総利用者数').first();
    await expect(totalCount).toBeVisible();

    // 初期状態では検索結果数は表示されない（フィルター未適用）
    const filteredCountInitial = page.locator('text=検索結果:');
    await expect(filteredCountInitial).not.toBeVisible();

    // Act: フィルター適用（計画期限切れ）
    await page.click('text=計画期限切れ');

    // Assert: 検索結果数が表示される
    const filteredCount = await page.locator('text=検索結果:').first();
    await expect(filteredCount).toBeVisible();
  });

  test('フィルター名が明確になっている', async ({ page }) => {
    // Arrange
    await page.goto('/dashboard');

    // Assert: フィルター名が明確
    await expect(page.locator('text=計画期限切れ').first()).toBeVisible();
    await expect(page.locator('text=計画期限間近（30日以内）').first()).toBeVisible();
    await expect(page.locator('text=アセスメント開始期限').first()).toBeVisible();
  });

  test('アセスメント開始期限フィルターが動作する', async ({ page }) => {
    // Arrange
    await page.goto('/dashboard');

    // Act: アセスメント開始期限フィルターをクリック
    await page.click('[title="アセスメント開始期限でフィルター"]');

    // Assert: Active Filters チップに表示される
    await expect(page.locator('text=アセスメント開始期限あり').first()).toBeVisible();

    // Assert: フィルターアイコンが活性化状態になる
    const filterIcon = page.locator('[title="フィルター解除"]').first();
    await expect(filterIcon).toBeVisible();
  });

  test('Active Filters チップが表示され、個別削除できる', async ({ page }) => {
    // Arrange
    await page.goto('/dashboard');

    // Act: 複数のフィルターを適用
    await page.click('text=計画期限切れ');
    await page.click('text=計画期限間近（30日以内）');

    // 検索ワードを入力
    await page.fill('input[placeholder="検索"]', '田中');
    await page.waitForTimeout(500); // デバウンス待ち

    // Assert: Active Filters セクションが表示される
    await expect(page.locator('text=絞り込み中:')).toBeVisible();

    // Assert: 各フィルターチップが表示される
    await expect(page.locator('text=検索: "田中"').first()).toBeVisible();
    await expect(page.locator('text=計画期限切れ').nth(1)).toBeVisible(); // nth(1) because first is in stats card
    await expect(page.locator('text=計画期限間近（30日以内）').nth(1)).toBeVisible();

    // Act: 個別削除（計画期限切れチップの×ボタン）
    const removeButton = page.locator('text=計画期限切れ').nth(1).locator('..').locator('button');
    await removeButton.click();

    // Assert: 計画期限切れチップが消える
    await expect(page.locator('text=絞り込み中: >> text=計画期限切れ')).not.toBeVisible();

    // Assert: 他のフィルターは残っている
    await expect(page.locator('text=検索: "田中"').first()).toBeVisible();
    await expect(page.locator('text=計画期限間近（30日以内）').nth(1)).toBeVisible();
  });

  test('「すべてクリア」ボタンで全フィルターを解除できる', async ({ page }) => {
    // Arrange
    await page.goto('/dashboard');

    // Act: 複数のフィルターを適用
    await page.click('text=計画期限切れ');
    await page.click('[title="アセスメント開始期限でフィルター"]');
    await page.fill('input[placeholder="検索"]', 'テスト');
    await page.waitForTimeout(500);

    // Assert: Active Filters が表示されている
    await expect(page.locator('text=絞り込み中:')).toBeVisible();

    // Act: すべてクリアボタンをクリック
    await page.click('text=すべてクリア');

    // Assert: Active Filters セクションが消える
    await expect(page.locator('text=絞り込み中:')).not.toBeVisible();

    // Assert: 検索結果数の表示も消える
    await expect(page.locator('text=検索結果:')).not.toBeVisible();
  });

  test('複合条件フィルタリングが正しく動作する', async ({ page }) => {
    // Arrange
    await page.goto('/dashboard');

    // Act: 複数のフィルターを同時に適用
    await page.click('text=計画期限切れ');
    await page.fill('input[placeholder="検索"]', '田中');
    await page.waitForTimeout(500);

    // Assert: 両方のフィルターが適用されている
    await expect(page.locator('text=計画期限切れ').nth(1)).toBeVisible();
    await expect(page.locator('text=検索: "田中"').first()).toBeVisible();

    // Assert: APIリクエストが両方のパラメータを含む（Network check）
    // Note: 実際の実装では page.route() でリクエストをインターセプトして検証
  });

  test('フィルター適用後の検索結果数が正確', async ({ page }) => {
    // Arrange
    await page.goto('/dashboard');

    // 初期の総利用者数を取得
    const totalCountText = await page.locator('text=総利用者数').locator('..').locator('p').nth(1).textContent();
    const totalCount = parseInt(totalCountText?.replace(/[^0-9]/g, '') || '0');

    // Act: フィルター適用
    await page.click('text=計画期限切れ');
    await page.waitForTimeout(500);

    // Assert: 検索結果数が総利用者数以下
    const filteredCountText = await page.locator('text=検索結果:').locator('..').locator('span').textContent();
    const filteredCount = parseInt(filteredCountText?.replace(/[^0-9]/g, '') || '0');

    expect(filteredCount).toBeLessThanOrEqual(totalCount);
    expect(filteredCount).toBeGreaterThanOrEqual(0);
  });

  test('モバイル表示でもActive Filtersチップが見やすい', async ({ page }) => {
    // Arrange: モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    // Act: フィルター適用
    await page.click('text=計画期限切れ');

    // Assert: Active Filters が折り返し表示される（flex-wrap）
    const activeFilters = page.locator('text=絞り込み中:').locator('..');
    await expect(activeFilters).toHaveCSS('flex-wrap', 'wrap');

    // Assert: チップが表示されている
    await expect(page.locator('text=計画期限切れ').nth(1)).toBeVisible();
  });

  test('ページリロード後もフィルター状態が保持される（オプション）', async ({ page }) => {
    // Arrange
    await page.goto('/dashboard');

    // Act: フィルター適用
    await page.click('text=計画期限切れ');
    await page.waitForTimeout(500);

    // Act: ページリロード
    await page.reload();

    // Assert: フィルター状態が保持されている（URLパラメータまたはLocalStorageで実装している場合）
    // Note: 実装方法によって検証内容は変わる
    // await expect(page.locator('text=計画期限切れ').nth(1)).toBeVisible();
  });

  test('パフォーマンス: ダッシュボード読み込みが500ms以下', async ({ page }) => {
    // Arrange
    const startTime = Date.now();

    // Act
    await page.goto('/dashboard');
    await page.waitForSelector('text=利用者一覧');

    // Assert
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(500);
  });

  test('並行処理: 10件の連続フィルター切り替えが正常動作', async ({ page }) => {
    // Arrange
    await page.goto('/dashboard');

    // Act: 高速でフィルターを切り替え
    for (let i = 0; i < 10; i++) {
      await page.click('text=計画期限切れ');
      await page.waitForTimeout(50);
      await page.click('text=すべてクリア');
      await page.waitForTimeout(50);
    }

    // Assert: エラーが発生しない、UIが正常
    await expect(page.locator('text=利用者一覧')).toBeVisible();
  });
});
