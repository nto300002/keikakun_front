# E2E テスト ガイド_

Playwright を使用した k_front のエンドツーエンドテスト。

---

## ディレクトリ構成

```
e2e/
├── auth.setup.ts                   # 認証セットアップ（全テストより先に1回だけ実行）
├── 01_login.spec.ts                # ログイン機能
├── 02_staff_signup.spec.ts         # スタッフ登録
├── 03_welfare_recipient.spec.ts    # 利用者登録（5セクションフォーム）
├── 04_support_plan_cycle.spec.ts   # 個別支援計画サイクル
├── dashboard-filtering.spec.ts     # ダッシュボード複合条件検索
├── fixtures/
│   └── auth.ts                     # loginAsOwner() ヘルパー（auth.setup.ts が使用）
├── helpers/
│   ├── test-data.ts                # テストデータ生成・API_BASE_URL
│   └── recipient-form.ts           # 利用者登録フォーム入力ヘルパー
└── .auth/
    └── owner.json                  # ログイン状態キャッシュ（.gitignore 対象）
```

---

## ローカル実行

### 前提

1. **バックエンド起動**: `k_back` が `http://localhost:8000` で起動していること
2. **フロントエンド**: Next.js dev サーバーは Playwright が自動起動（`reuseExistingServer: true`）
3. **E2E 用アカウント**: DB に owner ロールのテストアカウントが存在すること（下記参照）

### 環境変数の設定

`.env.local` に以下を設定する（`playwright.config.ts` が自動で読み込む）:

```env
E2E_OWNER_EMAIL=e2e_owner@example.com
E2E_OWNER_PASSWORD=<パスワード>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **注意**: `E2E_OWNER_EMAIL` / `E2E_OWNER_PASSWORD` が未設定の場合、テスト起動時に
> `requireEnv()` がエラーをスローします。フォールバック値は設定されていません。

### テスト実行コマンド

```bash
# 全テスト実行
npx playwright test

# 特定ファイルのみ
npx playwright test e2e/04_support_plan_cycle.spec.ts

# UI モードで確認しながら実行
npx playwright test --ui

# ブラウザを表示してデバッグ
npx playwright test --headed --debug

# HTML レポートを開く
npx playwright show-report
```

---

## E2E 用アカウントの準備

`k_back/scripts/create_e2e_owner.py` を実行するか、Neon コンソールで直接 SQL を発行してください。

作成条件:

| 項目 | 値 |
|------|----|
| ロール | `owner` |
| `is_mfa_enabled` | `false`（MFA 不要にするため） |
| `is_email_verified` | `true` |
| `billing_status` | `active`（各機能を利用するため） |

> MFA が有効だと `canEdit=false` となり、ダッシュボードの `/support_plan/{id}` リンクが
> 非表示になります（`04_support_plan_cycle.spec.ts` は API 直接呼び出しで回避済み）。

---

## 認証の仕組み（storageState パターン）

ログインエンドポイントには `@limiter.limit("5/minute")` の制限があります。
各テストで毎回ログインすると 429 エラーになるため、以下のキャッシュ方式を使用します。

```
auth.setup.ts（setup プロジェクト）
  └─ loginAsOwner(page) でログイン
  └─ storageState を .auth/owner.json に保存

各テスト（chromium プロジェクト）
  └─ playwright.config.ts の storageState: './e2e/.auth/owner.json' を自動適用
  └─ 個別のログイン処理は不要・ログイン API を呼ばない
```

`playwright.config.ts` のプロジェクト設定:

```typescript
projects: [
  // 全テストより先に1回だけ実行
  { name: 'setup', testMatch: '**/auth.setup.ts' },

  // storageState で認証済み状態を引き継ぐ
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: './e2e/.auth/owner.json' },
    dependencies: ['setup'],
  },
],
```

各テストファイルは `@playwright/test` から `test` / `page` を直接使用します:

```typescript
import { test, expect } from '@playwright/test';

test('テスト名', async ({ page }) => {
  // page はすでに認証済み（storageState が自動適用）
  await page.goto('/dashboard');
});
```

---

## CI（GitHub Actions）

`.github/workflows/ci-frontend.yml` に E2E ジョブが定義されています。

### 必要な GitHub Secrets

> **これらが未設定の場合、CI 起動時に `requireEnv()` エラーで即座に失敗します。**

| Secret 名 | 内容 | 例 |
|-----------|------|----|
| `PLAYWRIGHT_BASE_URL` | フロントエンドの URL | `https://www.keikakun.com` |
| `E2E_API_URL` | バックエンドの URL | `https://api.keikakun.com` |
| `E2E_OWNER_EMAIL` | E2E 用オーナーのメールアドレス | `e2e_owner@keikakun.com` |
| `E2E_OWNER_PASSWORD` | E2E 用オーナーのパスワード | — |

### CI ワークフロー内での環境変数注入

```yaml
- name: Run E2E tests
  run: npm run test:e2e
  env:
    PLAYWRIGHT_BASE_URL: ${{ secrets.PLAYWRIGHT_BASE_URL }}
    NEXT_PUBLIC_API_URL: ${{ secrets.E2E_API_URL }}
    E2E_OWNER_EMAIL: ${{ secrets.E2E_OWNER_EMAIL }}
    E2E_OWNER_PASSWORD: ${{ secrets.E2E_OWNER_PASSWORD }}
```

---

## テストデータのクリーンアップ

### 仕組み

| データ種別 | 作成ファイル | 削除タイミング | 削除方法 |
|-----------|------------|--------------|---------|
| E2E 利用者（`last_name = 'E2E'`） | `03` / `04` | 全テスト完了後（globalTeardown） | `DELETE /api/v1/welfare-recipients/{id}` |
| E2E スタッフ（`e2e_staff_*@example.com`） | `02` | `02` の afterAll | `DELETE /api/v1/staffs/{id}` |

#### 利用者のクリーンアップフロー

```
playwright.config.ts: globalTeardown: './e2e/global-teardown.ts'
    ↓ 全テスト終了後に1回だけ実行
global-teardown.ts
    ↓ GET /api/v1/welfare-recipients/ → last_name === 'E2E' でフィルタ
    ↓ Promise.allSettled で全件 DELETE（失敗は警告のみ）
```

`afterAll` ではなく `globalTeardown` に移行している理由:  
`03` の afterAll は `04` より先に実行されるため、`04` が使う利用者が消えてしまう
（afterAll はファイル完了後・次ファイル開始前に走る）。

#### スタッフのクリーンアップフロー

```
02_staff_signup.spec.ts:「正常登録」テスト
    ↓ POST /api/v1/auth/register レスポンスをインターセプト → staff_id を取得
    ↓ afterAll: owner 認証で DELETE /api/v1/staffs/{staff_id}
```

**backend の対応**: `DELETE /api/v1/staffs/{id}` は通常「同一事務所チェック」があるが、
登録直後のスタッフは `office_associations = []`（未承認状態）のため、
事務所未所属スタッフはチェックをスキップするよう修正済み（`k_back` の `staffs.py`）。

---

### クリーンアップ失敗時のフォールバック

#### 症状の確認

```bash
# E2E スタッフが残っていないか確認（k_back コンテナ内）
docker exec keikakun_app-backend-1 python -c "
from app.db.session import sync_engine
from sqlalchemy import text
with sync_engine.connect() as conn:
    rows = conn.execute(text(\"SELECT id, email, is_deleted FROM staffs WHERE email LIKE 'e2e_staff_%'\")).fetchall()
    for r in rows: print(r)
"
```

#### 手動クリーンアップ SQL（Neon コンソールまたは psql）

```sql
-- E2E スタッフを論理削除（本番で直接実行する場合は慎重に）
UPDATE staffs
SET is_deleted = true, deleted_at = now()
WHERE email LIKE 'e2e_staff_%@example.com'
  AND is_deleted = false;

-- E2E 利用者を物理削除
DELETE FROM welfare_recipients
WHERE last_name = 'E2E';

-- 確認クエリ
SELECT id, email, is_deleted FROM staffs WHERE email LIKE 'e2e_staff_%';
SELECT id, last_name, first_name FROM welfare_recipients WHERE last_name = 'E2E';
```

> **注意**: 本番 DB を直接操作する場合は必ずバックアップを取得してから実行してください。

#### CI で定期的に蓄積する場合

GitHub Actions の `schedule` ジョブとして月次クリーンアップを追加する:

```yaml
# .github/workflows/ci-frontend.yml に追記
on:
  schedule:
    - cron: '0 2 1 * *'  # 毎月1日 UTC 2:00

jobs:
  cleanup-e2e-data:
    name: E2E データクリーンアップ（月次）
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: Cleanup E2E data only
        run: npx playwright test --grep "@cleanup" --reporter=line
        env:
          PLAYWRIGHT_BASE_URL: ${{ secrets.PLAYWRIGHT_BASE_URL }}
          NEXT_PUBLIC_API_URL: ${{ secrets.E2E_API_URL }}
          E2E_OWNER_EMAIL: ${{ secrets.E2E_OWNER_EMAIL }}
          E2E_OWNER_PASSWORD: ${{ secrets.E2E_OWNER_PASSWORD }}
```

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| `requireEnv` エラーで起動失敗 | `.env.local` の環境変数未設定 | `E2E_OWNER_EMAIL` / `E2E_OWNER_PASSWORD` を設定 |
| ログイン後 `/dashboard` に遷移しない | DB にオーナーアカウントが存在しない | `create_e2e_owner.py` を実行 |
| `[href*="/support_plan/"]` が見つからない | `canEdit=false`（MFA 無効） | 04 spec は API 直接呼び出し方式で解決済み |
| `.auth/owner.json` が古くログイン切れ | storageState が期限切れ | `.auth/owner.json` を削除して再実行 |
| 429 Too Many Requests | レート制限（5/min） | storageState が機能しているか確認 |
| スタッフが削除されずに残る | afterAll が失敗 | 上記「クリーンアップ失敗時のフォールバック」の SQL を実行 |
| 利用者が削除されずに残る | globalTeardown が失敗 | 上記「クリーンアップ失敗時のフォールバック」の SQL を実行 |

---

**最終更新**: 2026-04-15
