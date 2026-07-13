import { expect, test, type Page } from '@playwright/test';

const APP_ADMIN_EMAIL = process.env.E2E_APP_ADMIN_EMAIL;
const APP_ADMIN_PASSWORD = process.env.E2E_APP_ADMIN_PASSWORD;
const APP_ADMIN_PASSPHRASE = process.env.E2E_APP_ADMIN_PASSPHRASE;

const appAdminCredentialsAvailable = Boolean(
  APP_ADMIN_EMAIL && APP_ADMIN_PASSWORD && APP_ADMIN_PASSPHRASE,
);

async function loginAsAppAdmin(page: Page) {
  await page.goto('/auth/app-admin/login');

  await page.fill('input[name="email"]', APP_ADMIN_EMAIL!);
  await page.fill('input[name="password"]', APP_ADMIN_PASSWORD!);
  await page.fill('input[name="passphrase"]', APP_ADMIN_PASSPHRASE!);

  await Promise.all([
    page.waitForURL(/\/app-admin/, { timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);
}

test.describe('app-admin dashboard tabs', () => {
  test.skip(
    !appAdminCredentialsAvailable,
    'Set E2E_APP_ADMIN_EMAIL, E2E_APP_ADMIN_PASSWORD, and E2E_APP_ADMIN_PASSPHRASE to run app-admin smoke tests.',
  );

  test.use({ storageState: undefined });

  test('app-admin can open the main dashboard panels', async ({ page }) => {
    await loginAsAppAdmin(page);

    await expect(page.getByTestId('logs-panel')).toBeVisible();

    const tabs = [
      { label: '問い合わせ', panelId: 'inquiries-panel' },
      { label: '承認リクエスト', panelId: 'approvals-panel' },
      { label: 'お知らせ', panelId: 'announcements-panel' },
      { label: '事務所', panelId: 'offices-panel' },
      { label: 'ログ', panelId: 'logs-panel' },
    ] as const;

    for (const tab of tabs) {
      await page.getByRole('button', { name: tab.label }).click();
      await expect(page.getByTestId(tab.panelId)).toBeVisible();
    }
  });
});
