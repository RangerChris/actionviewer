import { test, expect } from '@bgotink/playwright-coverage';
import type { Page, Route } from '@playwright/test';

const workflows = [
  {
    id: 101,
    name: 'Alpha',
    path: '.github/workflows/alpha.yml',
    state: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    url: 'https://api.github.com/repos/example/repo/actions/workflows/101',
    html_url: 'https://github.com/example/repo/actions/workflows/101',
    badge_url: 'https://github.com/example/repo/workflows/101/badge.svg',
  },
  {
    id: 202,
    name: 'Beta',
    path: '.github/workflows/beta.yml',
    state: 'disabled',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-02-02T00:00:00Z',
    url: 'https://api.github.com/repos/example/repo/actions/workflows/202',
    html_url: 'https://github.com/example/repo/actions/workflows/202',
    badge_url: 'https://github.com/example/repo/workflows/202/badge.svg',
  },
  {
    id: 303,
    name: 'Dynamic',
    path: 'dynamic/generated.yml',
    state: 'active',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-02-03T00:00:00Z',
    url: 'https://api.github.com/repos/example/repo/actions/workflows/303',
    html_url: 'https://github.com/example/repo/actions/workflows/303',
    badge_url: 'https://github.com/example/repo/workflows/303/badge.svg',
  },
];

const workflowDispatchContent = (name: string) => `name: ${name}
on:
  workflow_dispatch:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3`;

const base64 = (value: string) => btoa(value);

const mockWorkflowRoutes = async (page: Page) => {
  await page.route('**/actions/workflows**', async (route: Route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.pathname.endsWith('/workflows')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ workflows }),
      });
      return;
    }
    await route.continue();
  });

  await page.route('**/contents/.github/workflows/alpha.yml**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: base64(workflowDispatchContent('Alpha')), encoding: 'base64' }),
    });
  });

  await page.route('**/contents/.github/workflows/beta.yml**', async (route: Route) => {
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Not Found' }) });
  });
};

test('load, sort, filter, and search workflows', async ({ page }: { page: Page }) => {
  await mockWorkflowRoutes(page);
  await page.goto('/');

  await page.getByPlaceholder('github-username').fill('octocat');
  await page.getByPlaceholder('repo-name').fill('hello-world');
  await page.getByRole('button', { name: 'Load Workflows' }).click();

  await expect(page.getByText('Showing 3 of 3 workflows')).toBeVisible();

  const workflowNames = await page.locator('h3.font-semibold').allTextContents();
  expect(workflowNames).toEqual(['Alpha', 'Beta', 'Dynamic']);

  await page.getByLabel('Sort workflows by name').selectOption('desc');
  const workflowNamesDesc = await page.locator('h3.font-semibold').allTextContents();
  expect(workflowNamesDesc).toEqual(['Dynamic', 'Beta', 'Alpha']);

  await page.getByLabel('Filter workflows by status').selectOption('disabled');
  await expect(page.getByRole('heading', { name: 'Beta' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alpha' })).toBeHidden();

  const betaCard = page.getByRole('heading', { name: 'Beta' }).locator('..').locator('..');
  await expect(betaCard.locator('.tooltip')).toHaveAttribute('data-tip', 'Workflow is disabled');

  await page.getByLabel('Filter workflows by status').selectOption('');
  await page.getByPlaceholder('Search workflows...').fill('dyn');
  await expect(page.getByRole('heading', { name: 'Dynamic' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alpha' })).toBeHidden();

  const dynamicCard = page.getByRole('heading', { name: 'Dynamic' }).locator('..').locator('..');
  await expect(dynamicCard.locator('.tooltip')).toHaveAttribute(
    'data-tip',
    'Workflow might not work due to missing permissions or configuration'
  );

  await page.getByPlaceholder('Search workflows...').fill('nope');
  await expect(page.getByText('No workflows found.')).toBeVisible();
});

test('trigger workflow, save inputs, and logout', async ({ page }: { page: Page }) => {
  let dispatchHeaders: Record<string, string> = {};
  let dispatchBody: any = null;

  await page.route('**/actions/workflows**', async (route: Route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.pathname.endsWith('/workflows')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ workflows: [workflows[0]] }),
      });
      return;
    }
    await route.continue();
  });

  await page.route('**/contents/.github/workflows/alpha.yml**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: base64(workflowDispatchContent('Alpha')), encoding: 'base64' }),
    });
  });

  await page.route('**/actions/workflows/101/dispatches', async (route: Route) => {
    dispatchHeaders = route.request().headers();
    dispatchBody = await route.request().postDataJSON();
    await route.fulfill({ status: 204, contentType: 'application/json', body: '' });
  });

  await page.goto('/');

  await page.getByPlaceholder('github-username').fill('octocat');
  await page.getByPlaceholder('repo-name').fill('hello-world');
  await page.getByPlaceholder('ghp_xxxxxxxxxxxx').fill('gho_test_token');
  await page.getByRole('button', { name: 'Load Workflows' }).click();

  await expect(page.getByRole('heading', { name: 'Alpha' })).toBeVisible();

  await page.getByRole('button', { name: 'Trigger' }).click();

  const modal = page.getByRole('dialog');
  await expect(modal).toContainText('Trigger: Alpha');
  await modal.getByPlaceholder('dev').fill('feature/demo');
  await modal.getByRole('button', { name: 'Trigger' }).click();

  await expect(page.getByText('Workflow triggered successfully!')).toBeVisible();
  expect(dispatchHeaders['authorization']).toBe('Bearer gho_test_token');
  expect(dispatchBody).toEqual({ ref: 'feature/demo' });

  const storedInputs = await page.evaluate(() => localStorage.getItem('actionviewer_workflow_inputs'));
  expect(storedInputs).toContain('feature/demo');

  await page.getByRole('button', { name: 'Trigger' }).click();
  const modalAgain = page.getByRole('dialog');
  await expect(modalAgain.getByPlaceholder('dev')).toHaveValue('feature/demo');
  await modalAgain.getByRole('button', { name: 'Cancel' }).click();

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByText('Logged out successfully')).toBeVisible();

  const repoOwner = await page.evaluate(() => localStorage.getItem('actionviewer_repo_owner'));
  const repoName = await page.evaluate(() => localStorage.getItem('actionviewer_repo_name'));
  const tokenValue = await page.evaluate(() => localStorage.getItem('actionviewer_github_token'));

  expect(repoOwner).toBeNull();
  expect(repoName).toBeNull();
  expect(tokenValue).toBeNull();
});

test('uses token auth header for workflow fetch', async ({ page }: { page: Page }) => {
  let requestHeaders: Record<string, string> = {};

  await page.route('**/actions/workflows**', async (route: Route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.pathname.endsWith('/workflows')) {
      requestHeaders = route.request().headers();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ workflows: [] }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/');

  await page.getByPlaceholder('github-username').fill('octocat');
  await page.getByPlaceholder('repo-name').fill('hello-world');
  await page.getByPlaceholder('ghp_xxxxxxxxxxxx').fill('ghp_token_value');
  await page.getByRole('button', { name: 'Load Workflows' }).click();

  expect(requestHeaders['authorization']).toBe('token ghp_token_value');
  await expect(page.getByText('No workflows found.')).toBeVisible();
});

test('load repositories list and select a repo', async ({ page }: { page: Page }) => {
  await page.route('**/users/*/repos**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  await page.route('**/orgs/*/repos**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ name: 'actions-viewer' }, { name: 'beta-repo' }]),
    });
  });

  await page.goto('/');

  await page.getByPlaceholder('github-username').fill('octo-org');
  await page.getByRole('button', { name: '📦' }).click();

  const repoListButtons = page.locator('.btn.btn-ghost.btn-sm');
  await expect(repoListButtons).toHaveCount(2);

  await page.getByRole('button', { name: 'actions-viewer' }).click();
  await expect(page.getByPlaceholder('repo-name')).toHaveValue('actions-viewer');
  await expect(repoListButtons).toHaveCount(0);
});

test('toggles token visibility and handles repository load failure', async ({ page }: { page: Page }) => {
  await page.route('**/users/*/repos**', async (route: Route) => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Down' }) });
  });

  await page.route('**/orgs/*/repos**', async (route: Route) => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Down' }) });
  });

  await page.goto('/');

  const tokenInput = page.getByPlaceholder('ghp_xxxxxxxxxxxx');
  await expect(tokenInput).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: '🙈' }).click();
  await expect(tokenInput).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: '🙉' }).click();
  await expect(tokenInput).toHaveAttribute('type', 'password');

  await page.getByPlaceholder('github-username').fill('octo-org');
  await page.getByRole('button', { name: '📦' }).click();

  await expect(page.locator('.btn.btn-ghost.btn-sm')).toHaveCount(0);
});

test('surface API errors for workflow loading and triggering', async ({ page }: { page: Page }) => {
  await page.route('**/actions/workflows**', async (route: Route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.pathname.endsWith('/workflows')) {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Boom' }) });
      return;
    }
    await route.continue();
  });

  await page.goto('/');

  await page.getByPlaceholder('github-username').fill('bad');
  await page.getByPlaceholder('repo-name').fill('repo');
  await page.getByRole('button', { name: 'Load Workflows' }).click();

  await expect(page.getByText(/Failed to fetch workflows/)).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByText(/Failed to fetch workflows/)).toBeHidden();

  await mockWorkflowRoutes(page);
  await page.getByPlaceholder('github-username').fill('octocat');
  await page.getByPlaceholder('repo-name').fill('hello-world');
  await page.getByRole('button', { name: 'Load Workflows' }).click();

  await page.route('**/actions/workflows/101/dispatches', async (route: Route) => {
    await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Bad request' }) });
  });

  const alphaCard = page.getByRole('heading', { name: 'Alpha' }).locator('..').locator('..');
  await alphaCard.getByRole('button', { name: 'Trigger' }).click();
  const modal = page.getByRole('dialog');
  await modal.getByPlaceholder('dev').fill('dev');
  await modal.getByRole('button', { name: 'Trigger' }).click();

  await expect(page.getByText(/Failed to trigger workflow/)).toBeVisible();
});
