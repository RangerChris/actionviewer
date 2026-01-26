import { useState, useEffect } from 'react';
import { loadRepositoryData, saveRepositoryData } from '../storage';
import { initiateGitHubLogin } from '../oauth';

interface RepositoryInputProps {
    onSubmit: (owner: string, repo: string, token?: string) => void;
    loading?: boolean;
    currentToken?: string;
    onLogout?: () => void;
}

export function RepositoryInput({ onSubmit, loading, currentToken, onLogout }: RepositoryInputProps) {
    const [owner, setOwner] = useState('');
    const [repo, setRepo] = useState('');
    const [token, setToken] = useState('');
    const [showToken, setShowToken] = useState(false);

    // Load saved repository data on mount
    useEffect(() => {
        const savedData = loadRepositoryData();
        if (savedData) {
            setOwner(savedData.owner);
            setRepo(savedData.repo);
            setToken(savedData.token || '');
        }
    }, []);

    // Update token when currentToken changes (e.g., after OAuth login)
    useEffect(() => {
        if (currentToken && currentToken !== token) {
            setToken(currentToken);
        }
    }, [currentToken]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (owner && repo) {
            // Save to local storage when submitting
            saveRepositoryData({ owner, repo, token: token || undefined });
            onSubmit(owner, repo, token || undefined);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card bg-base-300 shadow-lg mb-6">
            <div className="card-body">
                <h2 className="card-title mb-4 text-base-content">Add Repository</h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="label">
                            <span className="label-text">Owner</span>
                        </label>
                        <input
                            type="text"
                            placeholder="github-username"
                            className="input input-bordered w-full bg-base-100 text-base-content"
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="label">
                            <span className="label-text">Repository</span>
                        </label>
                        <input
                            type="text"
                            placeholder="repo-name"
                            className="input input-bordered w-full bg-base-100 text-base-content"
                            value={repo}
                            onChange={(e) => setRepo(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="label">
                        <span className="label-text">GitHub Token (Optional)</span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type={showToken ? 'text' : 'password'}
                            placeholder="ghp_xxxxxxxxxxxx"
                            className="input input-bordered w-full flex-1 bg-base-100 text-base-content"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="btn btn-square btn-outline"
                            onClick={() => setShowToken(!showToken)}
                            disabled={loading}
                            title={showToken ? 'Hide token' : 'Show token'}
                        >
                            {showToken ? '🙈' : '👁'}
                        </button>
                    </div>
                    <label className="label">
                        <span className="label-text-alt">For private repos or higher rate limits</span>
                    </label>
                </div>

                <div className="divider text-base-content/50">OR</div>

                <div className="mb-4">
                    <button
                        type="button"
                        className="btn btn-outline w-full gap-2"
                        onClick={initiateGitHubLogin}
                        disabled={loading}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        Login with GitHub
                    </button>
                    <label className="label">
                        <span className="label-text-alt">Authenticate securely via OAuth</span>
                    </label>
                </div>

                {currentToken && (
                    <div className="mb-4">
                        <button
                            type="button"
                            className="btn btn-error btn-outline w-full"
                            onClick={onLogout}
                            disabled={loading}
                        >
                            Logout
                        </button>
                        <label className="label">
                            <span className="label-text-alt text-success">✓ You are logged in</span>
                        </label>
                    </div>
                )}

                <div className="card-actions justify-end">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!owner || !repo || loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Loading...
                            </>
                        ) : (
                            'Load Workflows'
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
