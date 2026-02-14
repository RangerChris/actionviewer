import type { Workflow } from './types';
import { GITHUB_API_URL } from './oauth';

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    // OAuth tokens (gho_*) and GitHub App tokens should use 'Bearer'
    // All other tokens (ghp_*, ghs_*, ghu_*) should use 'token'
    const authPrefix = token.startsWith('gho_') ? 'Bearer' : 'token';
    headers['Authorization'] = `${authPrefix} ${token}`;
  }
  return headers;
};

const checkWorkflowDispatch = async (
  owner: string,
  repo: string,
  path: string,
  token?: string,
  branch: string = 'dev'
): Promise<boolean> => {
  // Skip checking for dynamic workflows (they don't have actual files)
  if (path.startsWith('dynamic/')) {
    return false;
  }
  
  try {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const response = await fetch(url, { headers: getHeaders(token) });
    
    if (!response.ok) {
      return false;
    }
    
    const data = (await response.json()) as { content?: string };
    const content = data.content ? atob(data.content) : '';
    
    // Check if workflow_dispatch is in the 'on:' section
    // This is a simple pattern match - could be more sophisticated
    return content.includes('workflow_dispatch');
  } catch {
    return false;
  }
};

export const fetchWorkflows = async (
  owner: string,
  repo: string,
  token?: string,
  branch: string = 'dev'
): Promise<Workflow[]> => {
  let allWorkflows: Workflow[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/actions/workflows?ref=${branch}&per_page=100&page=${page}`;
    const response = await fetch(url, { headers: getHeaders(token) });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.statusText}`);
    }
    
    const data = (await response.json()) as { workflows?: Workflow[] };
    const workflows: Workflow[] = data.workflows || [];
    
    if (workflows.length === 0) {
      hasMore = false;
    } else {
      allWorkflows = allWorkflows.concat(workflows);
      page++;
      // Stop if we've fetched enough or reached the end
      if (workflows.length < 100) {
        hasMore = false;
      }
    }
  }
  
  // Check each workflow for workflow_dispatch trigger
  const workflowsWithTriggerInfo = await Promise.all(
    allWorkflows.map(async (workflow) => {
      const canTrigger = await checkWorkflowDispatch(owner, repo, workflow.path, token, branch);
      return { ...workflow, canTrigger };
    })
  );
  
  return workflowsWithTriggerInfo;
};

export const triggerWorkflow = async (
  owner: string,
  repo: string,
  workflowId: number,
  ref: string,
  inputs?: Record<string, string>,
  token?: string
): Promise<void> => {
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`;
  
  const body: { ref: string; inputs?: Record<string, string> } = {
    ref: ref || 'dev',
  };
  
  // Only include inputs if they exist and are not empty
  // Some workflows don't accept inputs at all
  if (inputs && Object.keys(inputs).length > 0) {
    body.inputs = inputs;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || response.statusText;
      throw new Error(`Failed to trigger workflow: ${errorMessage}`);
  }
};

export const fetchRepositories = async (
  owner: string,
  token?: string
): Promise<string[]> => {
  const usersUrl = `${GITHUB_API_URL}/users/${owner}/repos?per_page=100&sort=updated&type=all`;
  const orgsUrl = `${GITHUB_API_URL}/orgs/${owner}/repos?per_page=100&sort=updated&type=all`;

  const fetchRepoList = async (url: string) => {
    const res = await fetch(url, { headers: getHeaders(token) });
    if (!res.ok) return { ok: false, status: res.status, statusText: res.statusText, data: null as unknown };
    const json = (await res.json()) as unknown;
    return { ok: true, status: res.status, statusText: res.statusText, data: json };
  };

  // Try the users endpoint first
  let result = await fetchRepoList(usersUrl);

  // If users endpoint returns empty array, it might be an org - try the orgs endpoint
  if (result.ok && Array.isArray(result.data) && result.data.length === 0) {
    result = await fetchRepoList(orgsUrl);
  } else if (!result.ok) {
    // If users endpoint fails, try orgs endpoint
    result = await fetchRepoList(orgsUrl);
  }

  if (!result.ok) {
    throw new Error(`Failed to fetch repositories: ${result.statusText}`);
  }

  const data = result.data;
  const repos: Array<{ name: string }> = Array.isArray(data) ? data : [];

  // Extract names and sort alphabetically
  return repos.map((repo) => repo.name).sort((a, b) => a.localeCompare(b));
};
