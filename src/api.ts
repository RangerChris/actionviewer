import type { Workflow } from './types';

const GITHUB_API = 'https://api.github.com';

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    // OAuth tokens from GitHub OAuth flow start with 'gho_'
    // Personal Access Tokens start with 'ghp_' or other prefixes
    // OAuth tokens should use 'Bearer', PATs should use 'token'
    const authPrefix = token.startsWith('gho_') ? 'Bearer' : 'token';
    headers['Authorization'] = `${authPrefix} ${token}`;
  }
  return headers;
};

export const fetchWorkflows = async (
  owner: string,
  repo: string,
  token?: string
): Promise<Workflow[]> => {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/actions/workflows`;
  const response = await fetch(url, { headers: getHeaders(token) });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch workflows: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.workflows || [];
};

export const triggerWorkflow = async (
  owner: string,
  repo: string,
  workflowId: number,
  ref: string,
  inputs?: Record<string, string>,
  token?: string
): Promise<void> => {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`;
  
  const body: any = {
    ref: ref || 'main',
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
