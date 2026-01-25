import type { Workflow, WorkflowRun } from './types';

const GITHUB_API = 'https://api.github.com';

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
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

export const fetchWorkflowRuns = async (
  owner: string,
  repo: string,
  workflowId: number,
  token?: string
): Promise<WorkflowRun[]> => {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`;
  const response = await fetch(url, { headers: getHeaders(token) });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch workflow runs: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.workflow_runs || [];
};

export const triggerWorkflow = async (
  owner: string,
  repo: string,
  workflowId: number,
  inputs?: Record<string, string>,
  token?: string
): Promise<void> => {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`;
  
  const body: any = {
    ref: 'main',
  };
  
  if (inputs && Object.keys(inputs).length > 0) {
    body.inputs = inputs;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to trigger workflow: ${response.statusText}`);
  }
};
