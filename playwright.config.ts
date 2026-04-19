import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ローカル実行時に .env.local から E2E 用環境変数を読み込む（CI では Secrets が直接 process.env に入る）
const envLocalPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}

export default defineConfig({
  testDir: './e2e',
  // 全テスト完了後に E2E データを一括削除する
  globalTeardown: './e2e/global-teardown.ts',
  // 登録系テストは順序依存があるためシリアル実行
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // 各テストのデフォルトタイムアウト
    actionTimeout: 10000,
    navigationTimeout: 15000,
    // Vercel Deployment Protection の Automation Bypass
    // VERCEL_AUTOMATION_BYPASS_SECRET が設定されている場合のみヘッダーを付与する。
    // Vercel はこのヘッダーを受け取ると認証をバイパスするセッション Cookie を発行する。
    // 参照: https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-for-automation
    ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { extraHTTPHeaders: { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET } }
      : {}),
  },
  projects: [
    // セットアッププロジェクト: 全テストより先に1回だけ実行してログイン状態を保存
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    // メインテストプロジェクト: storageState でログイン済み状態を引き継ぐ
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './e2e/.auth/owner.json',
      },
      dependencies: ['setup'],
    },
  ],
  // ローカル実行時はNext.js dev serverを自動起動
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120 * 1000,
      },
});
