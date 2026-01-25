/**
 * Local storage utility for persisting user inputs
 */

const STORAGE_KEYS = {
  REPO_OWNER: 'actionviewer_repo_owner',
  REPO_NAME: 'actionviewer_repo_name',
  GITHUB_TOKEN: 'actionviewer_github_token',
  WORKFLOW_INPUTS: 'actionviewer_workflow_inputs',
} as const;

export interface StoredRepositoryData {
  owner: string;
  repo: string;
  token?: string;
}

export interface StoredWorkflowInput {
  workflowName: string;
  inputs: Record<string, string>;
  timestamp: number;
}

/**
 * Save repository information to local storage
 */
export function saveRepositoryData(data: StoredRepositoryData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REPO_OWNER, data.owner);
    localStorage.setItem(STORAGE_KEYS.REPO_NAME, data.repo);
    if (data.token) {
      localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, data.token);
    }
  } catch (error) {
    console.error('Failed to save repository data:', error);
  }
}

/**
 * Load repository information from local storage
 */
export function loadRepositoryData(): StoredRepositoryData | null {
  try {
    const owner = localStorage.getItem(STORAGE_KEYS.REPO_OWNER);
    const repo = localStorage.getItem(STORAGE_KEYS.REPO_NAME);
    const token = localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN);

    if (owner && repo) {
      return {
        owner,
        repo,
        token: token || undefined,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to load repository data:', error);
    return null;
  }
}

/**
 * Clear repository data from local storage
 */
export function clearRepositoryData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.REPO_OWNER);
    localStorage.removeItem(STORAGE_KEYS.REPO_NAME);
    localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
  } catch (error) {
    console.error('Failed to clear repository data:', error);
  }
}

/**
 * Save workflow trigger inputs to local storage
 */
export function saveWorkflowInputs(
  workflowName: string,
  inputs: Record<string, string>
): void {
  try {
    const data: StoredWorkflowInput = {
      workflowName,
      inputs,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.WORKFLOW_INPUTS, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save workflow inputs:', error);
  }
}

/**
 * Load the most recent workflow inputs from local storage
 */
export function loadWorkflowInputs(): StoredWorkflowInput | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WORKFLOW_INPUTS);
    if (data) {
      return JSON.parse(data) as StoredWorkflowInput;
    }
    return null;
  } catch (error) {
    console.error('Failed to load workflow inputs:', error);
    return null;
  }
}

/**
 * Clear workflow inputs from local storage
 */
export function clearWorkflowInputs(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.WORKFLOW_INPUTS);
  } catch (error) {
    console.error('Failed to clear workflow inputs:', error);
  }
}
