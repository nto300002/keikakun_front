/**
 * グローバルティアダウン: 全テスト完了後に1回だけ実行される
 *
 * 対象:
 *   - last_name === 'E2E' の利用者（03・04 が作成したもの）
 *
 * スタッフのクリーンアップについて:
 *   - 02_staff_signup.spec.ts の afterAll が POST /auth/register レスポンスから
 *     staff_id を取得し、DELETE /api/v1/staffs/{id} で直接削除する（一次責務）。
 *   - globalTeardown ではスタッフは対象外。afterAll が失敗した場合の対処は
 *     README.md の「クリーンアップ失敗時のフォールバック」を参照。
 *
 * afterAll との違い:
 *   - afterAll はファイルの全テスト完了後・次ファイル開始前に実行される
 *   - globalTeardown は全ファイルの全テストが完了した後に1回だけ実行される
 *
 * これにより 03_welfare_recipient.spec.ts の afterAll が
 * 04_support_plan_cycle.spec.ts より先に削除してしまう問題が解消される。
 */
import { request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_STATE_PATH = path.join(__dirname, '.auth/owner.json');
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default async function globalTeardown(): Promise<void> {
  // storageState がなければスキップ（auth.setup.ts が失敗した場合など）
  if (!fs.existsSync(AUTH_STATE_PATH)) {
    console.warn('[teardown] storageState が見つかりません。クリーンアップをスキップします。');
    return;
  }

  const context = await request.newContext({ storageState: AUTH_STATE_PATH });
  try {
    await deleteE2ERecipients(context);
  } finally {
    await context.dispose();
  }
}

/**
 * last_name === 'E2E' の利用者を全件削除する
 *
 * 対象: 03_welfare_recipient.spec.ts / 04_support_plan_cycle.spec.ts が作成した利用者
 * 認証: owner の storageState を使用（DELETE /api/v1/welfare-recipients/{id} は owner 権限必須）
 */
async function deleteE2ERecipients(context: Awaited<ReturnType<typeof request.newContext>>): Promise<void> {
  const listResp = await context.get(`${API_BASE_URL}/api/v1/welfare-recipients/`);
  if (!listResp.ok()) {
    console.warn(`[teardown] 利用者一覧の取得に失敗しました (status: ${listResp.status()})`);
    return;
  }

  const data = await listResp.json();
  const recipients: Array<{ id: string; last_name: string }> =
    data.recipients ?? data.items ?? data;

  const e2eRecipients = recipients.filter((r) => r.last_name === 'E2E');

  if (e2eRecipients.length === 0) {
    console.log('[teardown] 削除対象の E2E 利用者はありません。');
    return;
  }

  console.log(`[teardown] E2E 利用者を ${e2eRecipients.length} 件削除します...`);

  const results = await Promise.allSettled(
    e2eRecipients.map(async (r) => {
      const resp = await context.delete(`${API_BASE_URL}/api/v1/welfare-recipients/${r.id}`);
      if (resp.status() === 404) {
        // afterAll（03/04）が先に削除済み → 正常
        return { id: r.id, status: 'already_deleted' };
      }
      if (!resp.ok()) {
        throw new Error(`DELETE /welfare-recipients/${r.id} → ${resp.status()}`);
      }
      return { id: r.id, status: 'deleted' };
    })
  );

  const deleted = results.filter(
    (r) => r.status === 'fulfilled' && (r.value as { status: string }).status === 'deleted'
  ).length;
  const alreadyGone = results.filter(
    (r) => r.status === 'fulfilled' && (r.value as { status: string }).status === 'already_deleted'
  ).length;
  const failed = results.filter((r) => r.status === 'rejected');

  if (deleted > 0) console.log(`[teardown] 利用者削除完了: ${deleted} 件`);
  if (alreadyGone > 0) console.log(`[teardown] 利用者は afterAll により削除済み: ${alreadyGone} 件（スキップ）`);
  if (failed.length > 0) {
    console.warn(`[teardown] 利用者削除失敗: ${failed.length} 件（手動削除が必要 → README.md 参照）`);
    failed.forEach((r) => {
      if (r.status === 'rejected') console.warn(`  - ${r.reason}`);
    });
  }
}
