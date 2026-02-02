export interface Workflow {
  id: number;
  name: string;
  path: string;
  state: 'active' | 'disabled';
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  badge_url: string;
  canTrigger?: boolean;
}

export interface RepositoryInfo {
  owner: string;
  repo: string;
}
