import { test, expect } from '@bgotink/playwright-coverage';
import type { Page, Route } from '@playwright/test';

test('handles OAuth success callback and stores token', async ({ page }: { page: Page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('actionviewer_repo_owner', 'octocat');
    localStorage.setItem('actionviewer_repo_name', 'hello-world');
  });

  await page.route('**/authenticate', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'gho_success_token' }),
    });
  });

  await page.goto('/callback?code=abc123');

  await expect(page.locator('.alert-success span').first()).toHaveText('Successfully logged in with GitHub!');
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

  const tokenValue = await page.evaluate(() => localStorage.getItem('actionviewer_github_token'));
  expect(tokenValue).toBe('gho_success_token');
});

test('shows OAuth error in the main app view', async ({ page }: { page: Page }) => {
  await page.goto('/callback?error=access_denied');

  await expect(page.getByText('GitHub authentication failed: access_denied')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
});

test('shows OAuth error when no code is provided', async ({ page }: { page: Page }) => {
  await page.goto('/callback');

  await expect(page.getByText('No authorization code received')).toBeVisible();
});
