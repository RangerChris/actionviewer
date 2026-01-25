import { test, expect } from '@bgotink/playwright-coverage';
import type { Page, Route } from '@playwright/test';

const workflows = [
  {
    id: 123,
    name: 'CI',
    path: '.github/workflows/ci.yml',
    state: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    url: 'https://api.github.com/repos/example/repo/actions/workflows/123',
    html_url: 'https://github.com/example/repo/actions/workflows/123',
    badge_url: 'https://github.com/example/repo/workflows/123/badge.svg',
  },
  {
    id: 456,
    name: 'Docs',
    path: '.github/workflows/docs.yml',
    state: 'disabled',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-02-02T00:00:00Z',
    url: 'https://api.github.com/repos/example/repo/actions/workflows/456',
    html_url: 'https://github.com/example/repo/actions/workflows/456',
    badge_url: 'https://github.com/example/repo/workflows/456/badge.svg',
  },
];

test.beforeEach(async ({ page }: { page: Page }) => {
  await page.route('**/actions/workflows', async (route: Route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.pathname.endsWith('/workflows')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ workflows }) });
      return;
    }
    await route.continue();
  });

  await page.route('**/actions/workflows/123/dispatches', async (route: Route) => {
    await route.fulfill({ status: 204, contentType: 'application/json', body: '' });
  });
});

test('load, filter, search, and trigger a workflow', async ({ page }: { page: Page }) => {
  await page.goto('/');

  await page.getByPlaceholder('github-username').fill('octocat');
  await page.getByPlaceholder('repo-name').fill('hello-world');
  await page.getByRole('button', { name: 'Load Workflows' }).click();

  await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Docs' })).toBeVisible();
  await expect(page.getByText('Showing 2 of 2 workflows')).toBeVisible();

  await page.getByLabel('Filter workflows by status').selectOption('active');
  await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Docs' })).toBeHidden();

  await page.getByLabel('Filter workflows by status').selectOption('');
  await page.getByPlaceholder('Search workflows...').fill('docs');
  await expect(page.getByRole('heading', { name: 'Docs' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'CI' })).toBeHidden();

  await page.getByPlaceholder('Search workflows...').fill('notfound');
  await expect(page.getByText('No workflows found')).toBeVisible();

  await page.getByPlaceholder('Search workflows...').fill('CI');
  await page.getByLabel('Filter workflows by status').selectOption('active');

  const activeCard = page.locator('.card', { hasText: 'CI' });
  await activeCard.hover();
  await activeCard.getByRole('button', { name: 'Trigger' }).click();

  const modal = page.getByRole('dialog');
  await expect(modal).toContainText('Trigger: CI');
  await modal.getByPlaceholder('main').fill('feature/test');
  await modal.getByRole('button', { name: 'Trigger' }).click();

  await expect(page.getByText('Workflow triggered successfully!')).toBeVisible();
});

test('surface API errors to the user', async ({ page }: { page: Page }) => {
  await page.route('**/actions/workflows', async (route: Route) => {
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Not Found' }) });
  });

  await page.goto('/');

  await page.getByPlaceholder('github-username').fill('bad');
  await page.getByPlaceholder('repo-name').fill('repo');
  await page.getByRole('button', { name: 'Load Workflows' }).click();

  await expect(page.getByText(/Failed to fetch workflows/)).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByText(/Failed to fetch workflows/)).toBeHidden();
});
