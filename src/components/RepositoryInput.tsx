import { useState } from 'react';

interface RepositoryInputProps {
    onSubmit: (owner: string, repo: string, token?: string) => void;
    loading?: boolean;
}

export function RepositoryInput({ onSubmit, loading }: RepositoryInputProps) {
    const [owner, setOwner] = useState('');
    const [repo, setRepo] = useState('');
    const [token, setToken] = useState('');
    const [showToken, setShowToken] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (owner && repo) {
            onSubmit(owner, repo, token || undefined);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card bg-base-200 shadow-lg mb-6">
            <div className="card-body">
                <h2 className="card-title mb-4">Add Repository</h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="label">
                            <span className="label-text">Owner</span>
                        </label>
                        <input
                            type="text"
                            placeholder="github-username"
                            className="input input-bordered w-full"
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
                            className="input input-bordered w-full"
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
                            className="input input-bordered w-full flex-1"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setShowToken(!showToken)}
                            disabled={loading}
                        >
                            {showToken ? '🙈' : '👁'}
                        </button>
                    </div>
                    <label className="label">
                        <span className="label-text-alt">For private repos or higher rate limits</span>
                    </label>
                </div>

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
