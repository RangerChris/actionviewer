import { useState, useEffect } from 'react';
import {
  RepositoryInput,
  SearchBar,
  FilterBar,
  WorkflowList,
  TriggerModal,
  OAuthCallback,
} from './components';
import { fetchWorkflows, triggerWorkflow } from './api';
import type { Workflow } from './types';
import {
  saveRepositoryData,
  loadRepositoryData,
  saveWorkflowInputs,
  clearRepositoryData,
} from './storage';

function App() {
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [token, setToken] = useState('');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triggerModal, setTriggerModal] = useState({
    isOpen: false,
    workflowId: 0,
    workflowName: '',
  });
  const [triggerLoading, setTriggerLoading] = useState(false);

  // Check if this is an OAuth callback
  useEffect(() => {
    if (window.location.pathname === '/callback') {
      setIsOAuthCallback(true);
    }
  }, []);

  // Load saved repository data on mount
  useEffect(() => {
    const savedData = loadRepositoryData();
    if (savedData) {
      setRepoOwner(savedData.owner);
      setRepoName(savedData.repo);
      setToken(savedData.token || '');
    }
  }, []);

  // Filter workflows based on search and status
  useEffect(() => {
    let filtered = workflows;

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((w) => w.state === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(lowerSearch) ||
          w.path.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply sorting
    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (sortOrder === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    }

    setFilteredWorkflows(filtered);
  }, [workflows, searchTerm, statusFilter, sortOrder]);

  const handleLoadWorkflows = async (
    owner: string,
    repo: string,
    loadToken?: string
  ) => {
    setLoading(true);
    setError(null);
    setSearchTerm('');
    setStatusFilter('');
    setRepoOwner(owner);
    setRepoName(repo);
    setToken(loadToken || '');

    // Save repository data to local storage
    saveRepositoryData({
      owner,
      repo,
      token: loadToken,
    });

    try {
      const data = await fetchWorkflows(owner, repo, loadToken, 'dev');
      setWorkflows(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load workflows. Check repo name and token.'
      );
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerWorkflow = (workflowId: number, workflowName: string) => {
    setTriggerModal({
      isOpen: true,
      workflowId,
      workflowName,
    });
  };

  const handleConfirmTrigger = async (inputs: Record<string, string>, ref?: string) => {
    setTriggerLoading(true);
    try {
      // Prepare inputs for saving - include ref
      const inputsToSave = { ...inputs, ref: ref || 'dev' };

      // Save workflow inputs to local storage (with ref included)
      saveWorkflowInputs(triggerModal.workflowName, inputsToSave);

      // Prepare clean inputs for API call (without ref)
      const cleanInputs = { ...inputs };
      delete cleanInputs.ref;

      await triggerWorkflow(
        repoOwner,
        repoName,
        triggerModal.workflowId,
        ref || 'dev',
        cleanInputs,
        token
      );
      setTriggerModal({ isOpen: false, workflowId: 0, workflowName: '' });
      // Show success toast
      const toastDiv = document.createElement('div');
      toastDiv.className = 'toast toast-top toast-end';
      toastDiv.innerHTML = `
        <div class="alert alert-success">
          <span>Workflow triggered successfully!</span>
        </div>
      `;
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to trigger workflow'
      );
    } finally {
      setTriggerLoading(false);
    }
  };

  const handleOAuthSuccess = (oauthToken: string) => {
    setToken(oauthToken);
    saveRepositoryData({
      owner: repoOwner,
      repo: repoName,
      token: oauthToken,
    });
    setIsOAuthCallback(false);
    // Show success message
    const toastDiv = document.createElement('div');
    toastDiv.className = 'toast toast-top toast-end';
    toastDiv.innerHTML = `
      <div class="alert alert-success">
        <span>Successfully logged in with GitHub!</span>
      </div>
    `;
    document.body.appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 3000);
  };

  const handleOAuthError = (errorMessage: string) => {
    setError(errorMessage);
    setIsOAuthCallback(false);
  };

  const handleLogout = () => {
    setToken('');
    setRepoOwner('');
    setRepoName('');
    setWorkflows([]);
    setFilteredWorkflows([]);
    setSearchTerm('');
    setStatusFilter('');
    setError(null);
    clearRepositoryData();

    // Show logout success message
    const toastDiv = document.createElement('div');
    toastDiv.className = 'toast toast-top toast-end';
    toastDiv.innerHTML = `
      <div class="alert alert-info">
        <span>Logged out successfully</span>
      </div>
    `;
    document.body.appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 3000);
  };

  // Handle OAuth callback
  if (isOAuthCallback) {
    return <OAuthCallback onSuccess={handleOAuthSuccess} onError={handleOAuthError} />;
  }

  return (
    <div className="min-h-screen py-8 bg-base-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          {repoOwner && repoName ? (
            <h1 className="text-4xl font-bold mb-2 text-base-content">
              {repoOwner}/{repoName} - Workflows
            </h1>
          ) : (
            <h1 className="text-4xl font-bold mb-2 text-base-content">GitHub Actions Viewer</h1>
          )}
          <p className="text-base-content/70">
            Search and trigger workflows from any repository
          </p>
        </div>

        {/* Repository Input */}
        <RepositoryInput
          onSubmit={handleLoadWorkflows}
          loading={loading}
          currentToken={token}
          onLogout={handleLogout}
        />

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m8-8a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setError(null)}
            >
              Close
            </button>
          </div>
        )}

        {/* Workflows Section */}
        {repoOwner && repoName && (
          <div className="bg-base-100 rounded-lg p-6 shadow-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">
                {repoOwner}/{repoName} - Workflows
              </h2>

              {/* Search and Filter */}
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
              <FilterBar selectedStatus={statusFilter} onStatusChange={setStatusFilter} sortOrder={sortOrder} onSortChange={setSortOrder} />
            </div>

            {/* Workflow List */}
            <WorkflowList
              workflows={filteredWorkflows}
              loading={loading}
              onTrigger={handleTriggerWorkflow}
            />

            {/* Results Info */}
            {!loading && workflows.length > 0 && (
              <div className="mt-4 text-sm text-base-content/60">
                Showing {filteredWorkflows.length} of {workflows.length} workflows
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trigger Modal */}
      <TriggerModal
        isOpen={triggerModal.isOpen}
        workflowName={triggerModal.workflowName}
        onTrigger={handleConfirmTrigger}
        onCancel={() =>
          setTriggerModal({ isOpen: false, workflowId: 0, workflowName: '' })
        }
        loading={triggerLoading}
      />
    </div>
  );
}

export default App;
