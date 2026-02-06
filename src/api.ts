import type { Workflow } from './types';
import { GITHUB_API_URL } from './oauth';

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
    
    const data = await response.json();
    const content = atob(data.content);
    
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
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/actions/workflows?ref=${branch}&per_page=100`;
  const response = await fetch(url, { headers: getHeaders(token) });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch workflows: ${response.statusText}`);
  }
  
  const data = await response.json();
  const workflows: Workflow[] = data.workflows || [];
  
  // Check each workflow for workflow_dispatch trigger
  const workflowsWithTriggerInfo = await Promise.all(
    workflows.map(async (workflow) => {
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
  
  const body: any = {
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
