/**
 * 認証セットアッププロジェクト
 *
 * playwright.config.ts の setup プロジェクトとして実行される。
 * 全テストより先に1回だけ実行され、ログイン状態を .auth/owner.json に保存する。
 * 他のテストプロジェクトは storageState でこのファイルを読み込み、
 * ログイン API を呼ばずに認証済み状態でテストを開始できる。
 *
 * これによりログインエンドポイントの @limiter.limit("5/minute") の制限を回避する。
 */
import { test as setup } from '@playwright/test';
import * as path from 'path';
import { loginAsOwner } from './fixtures/auth';

export const AUTH_FILE = path.join(__dirname, '.auth/owner.json');

setup('authenticate as owner', async ({ page }) => {
  await loginAsOwner(page);
  await page.context().storageState({ path: AUTH_FILE });
});
