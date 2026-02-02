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
];

test.describe('Local Storage - Repository Data', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.route('**/actions/workflows', async (route: Route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.pathname.endsWith('/workflows')) {
        await route.fulfill({ 
          status: 200, 
          contentType: 'application/json', 
          body: JSON.stringify({ workflows }) 
        });
        return;
      }
      await route.continue();
    });

    // Mock workflow file content to include workflow_dispatch
    await page.route('**/contents/.github/workflows/ci.yml', async (route: Route) => {
      const workflowContent = `name: CI
on:
  workflow_dispatch:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3`;
      const encoded = Buffer.from(workflowContent).toString('base64');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: encoded, encoding: 'base64' })
      });
    });

    await page.route('**/actions/workflows/123/dispatches', async (route: Route) => {
      await route.fulfill({ status: 204, contentType: 'application/json', body: '' });
    });
  });

  test('saves repository owner and name to localStorage', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Fill in repository information
    await page.getByPlaceholder('github-username').fill('testuser');
    await page.getByPlaceholder('repo-name').fill('testrepo');

    // Load workflows
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    // Verify localStorage contains the saved data
    const ownerValue = await page.evaluate(() => {
      try {
        return localStorage.getItem('actionviewer_repo_owner');
      } catch {
        return null;
      }
    });
    const repoValue = await page.evaluate(() => {
      try {
        return localStorage.getItem('actionviewer_repo_name');
      } catch {
        return null;
      }
    });

    expect(ownerValue).toBe('testuser');
    expect(repoValue).toBe('testrepo');
  });

  test('loads repository data from localStorage on app startup', async ({ page, context }: { page: Page; context: any }) => {
    // Set up localStorage before navigating
    await page.goto('/');

    // First, save repository data
    await page.getByPlaceholder('github-username').fill('saveduser');
    await page.getByPlaceholder('repo-name').fill('savedrepo');
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    // Get the storage state
    const storageState = await context.storageState();

    // Create a new context with the saved storage
    const newContext = await context.browser().newContext({ storageState });
    const newPage = await newContext.newPage();

    // Set up routes for new page
    await newPage.route('**/actions/workflows', async (route: Route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.pathname.endsWith('/workflows')) {
        await route.fulfill({ 
          status: 200, 
          contentType: 'application/json', 
          body: JSON.stringify({ workflows }) 
        });
        return;
      }
      await route.continue();
    });

    // Navigate to the page
    await newPage.goto('/');

    // Verify the fields are pre-filled with saved data
    const ownerInput = newPage.getByPlaceholder('github-username');
    const repoInput = newPage.getByPlaceholder('repo-name');

    await expect(ownerInput).toHaveValue('saveduser');
    await expect(repoInput).toHaveValue('savedrepo');

    await newContext.close();
  });

  test('saves GitHub token to localStorage when provided', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Fill in repository information with token
    await page.getByPlaceholder('github-username').fill('testuser');
    await page.getByPlaceholder('repo-name').fill('testrepo');
    await page.getByPlaceholder('ghp_xxxxxxxxxxxx').fill('ghp_test123token');

    // Load workflows
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    // Verify localStorage contains the token
    const tokenValue = await page.evaluate(() => {
      try {
        return localStorage.getItem('actionviewer_github_token');
      } catch {
        return null;
      }
    });

    expect(tokenValue).toBe('ghp_test123token');
  });

  test('loads GitHub token from localStorage on startup', async ({ page, context }: { page: Page; context: any }) => {
    await page.goto('/');

    // First, save repository data with token
    await page.getByPlaceholder('github-username').fill('tokenuser');
    await page.getByPlaceholder('repo-name').fill('tokenrepo');
    await page.getByPlaceholder('ghp_xxxxxxxxxxxx').fill('ghp_savedtoken456');
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    // Get the storage state
    const storageState = await context.storageState();

    // Create a new context with the saved storage
    const newContext = await context.browser().newContext({ storageState });
    const newPage = await newContext.newPage();

    // Set up routes for new page
    await newPage.route('**/actions/workflows', async (route: Route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.pathname.endsWith('/workflows')) {
        await route.fulfill({ 
          status: 200, 
          contentType: 'application/json', 
          body: JSON.stringify({ workflows }) 
        });
        return;
      }
      await route.continue();
    });

    // Navigate to the page
    await newPage.goto('/');

    // Verify the token field is pre-filled
    const tokenInput = newPage.getByPlaceholder('ghp_xxxxxxxxxxxx');
    const tokenValue = await tokenInput.inputValue();
    expect(tokenValue).toBe('ghp_savedtoken456');

    await newContext.close();
  });

  test('persists repository data across multiple page reloads', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Initial load and save
    await page.getByPlaceholder('github-username').fill('persistent');
    await page.getByPlaceholder('repo-name').fill('persist-repo');
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    // First reload
    await page.reload();
    let ownerInput = page.getByPlaceholder('github-username');
    await expect(ownerInput).toHaveValue('persistent');

    // Second reload
    await page.reload();
    ownerInput = page.getByPlaceholder('github-username');
    await expect(ownerInput).toHaveValue('persistent');

    // Third reload to be sure
    await page.reload();
    ownerInput = page.getByPlaceholder('github-username');
    await expect(ownerInput).toHaveValue('persistent');
  });
});

test.describe('Local Storage - Workflow Inputs', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.route('**/actions/workflows', async (route: Route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.pathname.endsWith('/workflows')) {
        await route.fulfill({ 
          status: 200, 
          contentType: 'application/json', 
          body: JSON.stringify({ workflows }) 
        });
        return;
      }
      await route.continue();
    });

    // Mock workflow file content to include workflow_dispatch
    await page.route('**/contents/.github/workflows/ci.yml', async (route: Route) => {
      const workflowContent = `name: CI
on:
  workflow_dispatch:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3`;
      const encoded = Buffer.from(workflowContent).toString('base64');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: encoded, encoding: 'base64' })
      });
    });

    await page.route('**/actions/workflows/123/dispatches', async (route: Route) => {
      await route.fulfill({ status: 204, contentType: 'application/json', body: '' });
    });
  });

  test('saves workflow inputs to localStorage when workflow is triggered', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Load workflows
    await page.getByPlaceholder('github-username').fill('triggeruser');
    await page.getByPlaceholder('repo-name').fill('triggerrepo');
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    // Trigger workflow with custom branch
    await page.getByRole('button', { name: 'Trigger' }).click();

    const modal = page.getByRole('dialog');
    await expect(modal).toContainText('Trigger: CI');
    await modal.getByPlaceholder('main').fill('feature/test-branch');
    await modal.getByRole('button', { name: 'Trigger' }).click();

    await expect(page.getByText('Workflow triggered successfully!')).toBeVisible();

    // Verify localStorage contains the workflow inputs
    const storedInputsJson = await page.evaluate(() => {
      try {
        return localStorage.getItem('actionviewer_workflow_inputs');
      } catch {
        return null;
      }
    });

    const storedInputs = storedInputsJson ? JSON.parse(storedInputsJson) : null;
    expect(storedInputs).not.toBeNull();
    expect(storedInputs?.workflowName).toBe('CI');
    expect(storedInputs?.inputs?.ref).toBe('feature/test-branch');
    expect(storedInputs?.timestamp).toBeDefined();
  });

  test('loads saved workflow inputs when triggering the same workflow again', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Load workflows
    await page.getByPlaceholder('github-username').fill('triggeruser');
    await page.getByPlaceholder('repo-name').fill('triggerrepo');
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    // First trigger with custom branch
    await page.getByRole('button', { name: 'Trigger' }).click();

    let modal = page.getByRole('dialog');
    await expect(modal).toContainText('Trigger: CI');
    await modal.getByPlaceholder('main').fill('develop');
    await modal.getByRole('button', { name: 'Trigger' }).click();

    await expect(page.getByText('Workflow triggered successfully!')).toBeVisible();

    // Trigger the same workflow again
    await page.getByRole('button', { name: 'Trigger' }).click();

    modal = page.getByRole('dialog');
    // Verify the branch input is pre-filled with the saved value
    const branchInput = modal.getByPlaceholder('main');
    await expect(branchInput).toHaveValue('develop');
  });

  test('saves timestamp with workflow inputs', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Load and trigger workflow
    await page.getByPlaceholder('github-username').fill('user');
    await page.getByPlaceholder('repo-name').fill('repo');
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    const beforeTrigger = Date.now();

    await page.getByRole('button', { name: 'Trigger' }).click();

    const modal = page.getByRole('dialog');
    await modal.getByPlaceholder('main').fill('main');
    await modal.getByRole('button', { name: 'Trigger' }).click();

    const afterTrigger = Date.now();
    await expect(page.getByText('Workflow triggered successfully!')).toBeVisible();

    // Verify timestamp is recent
    const storedInputsJson = await page.evaluate(() => {
      try {
        return localStorage.getItem('actionviewer_workflow_inputs');
      } catch {
        return null;
      }
    });

    const storedInputs = storedInputsJson ? JSON.parse(storedInputsJson) : null;
    expect(storedInputs?.timestamp).toBeGreaterThanOrEqual(beforeTrigger);
    expect(storedInputs?.timestamp).toBeLessThanOrEqual(afterTrigger);
  });

  test('clears workflow inputs when modal is closed without triggering', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Load workflows
    await page.getByPlaceholder('github-username').fill('user');
    await page.getByPlaceholder('repo-name').fill('repo');
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    // First trigger and save inputs
    await page.getByRole('button', { name: 'Trigger' }).click();

    let modal = page.getByRole('dialog');
    await modal.getByPlaceholder('main').fill('saved-branch');
    await modal.getByRole('button', { name: 'Trigger' }).click();
    await expect(page.getByText('Workflow triggered successfully!')).toBeVisible();

    // Open modal again and verify saved data loads
    await page.getByRole('button', { name: 'Trigger' }).click();

    modal = page.getByRole('dialog');
    const branchInput = modal.getByPlaceholder('main');
    await expect(branchInput).toHaveValue('saved-branch');

    // Cancel/close the modal
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).not.toBeVisible();

    // Stored data should still exist
    const storedInputsJson = await page.evaluate(() => {
      try {
        return localStorage.getItem('actionviewer_workflow_inputs');
      } catch {
        return null;
      }
    });

    const storedInputs = storedInputsJson ? JSON.parse(storedInputsJson) : null;
    expect(storedInputs).not.toBeNull();
  });
});

test.describe('Local Storage - Edge Cases', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.route('**/actions/workflows', async (route: Route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.pathname.endsWith('/workflows')) {
        await route.fulfill({ 
          status: 200, 
          contentType: 'application/json', 
          body: JSON.stringify({ workflows }) 
        });
        return;
      }
      await route.continue();
    });

    // Mock workflow file content to include workflow_dispatch
    await page.route('**/contents/.github/workflows/ci.yml', async (route: Route) => {
      const workflowContent = `name: CI
on:
  workflow_dispatch:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3`;
      const encoded = Buffer.from(workflowContent).toString('base64');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: encoded, encoding: 'base64' })
      });
    });

    await page.route('**/actions/workflows/123/dispatches', async (route: Route) => {
      await route.fulfill({ status: 204, contentType: 'application/json', body: '' });
    });
  });

  test('handles empty localStorage gracefully on first load', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Verify fields are empty
    const ownerInput = page.getByPlaceholder('github-username');
    const repoInput = page.getByPlaceholder('repo-name');

    await expect(ownerInput).toHaveValue('');
    await expect(repoInput).toHaveValue('');
  });

  test('allows updating saved repository data', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // First save
    await page.getByPlaceholder('github-username').fill('user1');
    await page.getByPlaceholder('repo-name').fill('repo1');
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    // Clear and update
    await page.getByPlaceholder('github-username').clear();
    await page.getByPlaceholder('github-username').fill('user2');
    await page.getByPlaceholder('repo-name').clear();
    await page.getByPlaceholder('repo-name').fill('repo2');
    await page.getByRole('button', { name: 'Load Workflows' }).click();

    // Reload and verify new data is loaded
    await page.reload();
    const ownerInput = page.getByPlaceholder('github-username');
    const repoInput = page.getByPlaceholder('repo-name');

    await expect(ownerInput).toHaveValue('user2');
    await expect(repoInput).toHaveValue('repo2');
  });

  test('stores and retrieves special characters in inputs', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Load workflows
    await page.getByPlaceholder('github-username').fill('test-user_123');
    await page.getByPlaceholder('repo-name').fill('repo-name.test');
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    // Trigger with special characters in branch
    await page.getByRole('button', { name: 'Trigger' }).click();

    const modal = page.getByRole('dialog');
    await modal.getByPlaceholder('main').fill('feature/test-123_abc');
    await modal.getByRole('button', { name: 'Trigger' }).click();

    await expect(page.getByText('Workflow triggered successfully!')).toBeVisible();

    // Verify special characters are preserved
    const storedInputsJson = await page.evaluate(() => {
      try {
        return localStorage.getItem('actionviewer_workflow_inputs');
      } catch {
        return null;
      }
    });

    const storedInputs = storedInputsJson ? JSON.parse(storedInputsJson) : null;
    expect(storedInputs?.inputs?.ref).toBe('feature/test-123_abc');
  });

  test('preserves data when switching between repositories', async ({ page }: { page: Page }) => {
    await page.goto('/');

    // Load first repository
    await page.getByPlaceholder('github-username').fill('owner1');
    await page.getByPlaceholder('repo-name').fill('repo1');
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    // Trigger workflow in first repo
    await page.getByRole('button', { name: 'Trigger' }).click();

    let modal = page.getByRole('dialog');
    await modal.getByPlaceholder('main').fill('branch1');
    await modal.getByRole('button', { name: 'Trigger' }).click();
    await expect(page.getByText('Workflow triggered successfully!')).toBeVisible();

    // Verify workflow inputs were saved
    let storedInputsJson = await page.evaluate(() => {
      try {
        return localStorage.getItem('actionviewer_workflow_inputs');
      } catch {
        return null;
      }
    });
    let storedInputs = storedInputsJson ? JSON.parse(storedInputsJson) : null;
    expect(storedInputs?.inputs?.ref).toBe('branch1');

    // Wait for toast to disappear
    await page.getByText('Workflow triggered successfully!').waitFor({ state: 'hidden' });

    // Switch to another repository
    await page.getByPlaceholder('github-username').clear();
    await page.getByPlaceholder('github-username').fill('owner2');
    await page.getByPlaceholder('repo-name').clear();
    await page.getByPlaceholder('repo-name').fill('repo2');
    await page.getByRole('button', { name: 'Load Workflows' }).click();
    await expect(page.getByRole('heading', { name: 'CI' })).toBeVisible();

    // Verify repository storage was updated
    const ownerValue = await page.evaluate(() => {
      try {
        return localStorage.getItem('actionviewer_repo_owner');
      } catch {
        return null;
      }
    });
    expect(ownerValue).toBe('owner2');

    // Verify that old workflow inputs from repo1 are still in storage
    storedInputsJson = await page.evaluate(() => {
      try {
        return localStorage.getItem('actionviewer_workflow_inputs');
      } catch {
        return null;
      }
    });
    storedInputs = storedInputsJson ? JSON.parse(storedInputsJson) : null;
    expect(storedInputs?.inputs?.ref).toBe('branch1');
  });
});
