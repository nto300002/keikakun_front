# E2Eテストセットアップガイド

## 📋 概要

ダッシュボード複合条件検索機能のE2Eテストを実行するためのセットアップ手順です。

---

## 🚀 Playwrightのインストール

### 1. Playwrightをインストール

```bash
cd k_front
npm install -D @playwright/test
```

### 2. Playwrightブラウザをインストール

```bash
npx playwright install
```

### 3. playwright.config.ts の作成

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 4. package.json にスクリプト追加

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## 🧪 テストの実行

### 全テストを実行

```bash
npm run test:e2e
```

### UI モードで実行（推奨）

```bash
npm run test:e2e:ui
```

### 特定のテストファイルのみ実行

```bash
npx playwright test e2e/dashboard-filtering.spec.ts
```

### ヘッドモードで実行（ブラウザを表示）

```bash
npx playwright test --headed
```

### デバッグモード

```bash
npx playwright test --debug
```

---

## 📊 テストレポートの確認

```bash
npm run test:e2e:report
```

---

## 🔧 テストデータの準備

### テストユーザーの作成

バックエンドで以下のテストデータを準備してください:

```sql
-- テスト用事業所
INSERT INTO offices (id, name, type, created_by, last_modified_by)
VALUES ('...', 'テスト事業所', 'transition_to_employment', '...', '...');

-- テスト用スタッフ
INSERT INTO staffs (id, email, full_name, role, office_id, is_mfa_enabled)
VALUES ('...', 'test@example.com', 'テストユーザー', 'manager', '...', true);

-- テスト用利用者（複数パターン）
-- 1. 計画期限切れの利用者
-- 2. 計画期限間近の利用者
-- 3. アセスメント開始期限ありの利用者
-- 4. フィルター対象外の利用者
```

または、専用のシードスクリプトを用意:

```bash
cd k_back
python scripts/seed_test_data.py
```

---

## 🎯 テストカバレッジ

### Phase 2.8 テストシナリオ

- ✅ 総利用者数と検索結果数の表示確認
- ✅ フィルター名の明確化確認
- ✅ アセスメント開始期限フィルター動作確認
- ✅ Active Filters チップの表示・個別削除確認
- ✅ 「すべてクリア」機能確認
- ✅ 複合条件フィルタリング確認
- ✅ 検索結果数の正確性確認
- ✅ モバイル表示確認
- ✅ パフォーマンステスト（500ms以下）
- ✅ 並行処理テスト（10件連続切り替え）

---

## 📝 CI/CD 統合（オプション）

### GitHub Actions の例

`.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: k_front
        run: npm ci

      - name: Install Playwright browsers
        working-directory: k_front
        run: npx playwright install --with-deps

      - name: Run E2E tests
        working-directory: k_front
        run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: k_front/playwright-report/
          retention-days: 30
```

---

## ⚠️ トラブルシューティング

### テストが失敗する場合

1. **バックエンドが起動していない**
   ```bash
   cd k_back
   docker-compose up
   ```

2. **フロントエンドが起動していない**
   ```bash
   cd k_front
   npm run dev
   ```

3. **テストデータがない**
   - シードスクリプトを実行
   - または手動でテストデータを作成

4. **ブラウザが見つからない**
   ```bash
   npx playwright install
   ```

5. **タイムアウトエラー**
   - `playwright.config.ts` の `timeout` を延長
   - バックエンドのレスポンスが遅い可能性を確認

---

## 🔗 参考リンク

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors](https://playwright.dev/docs/selectors)

---

**作成日**: 2026-02-17
**最終更新**: 2026-02-17
