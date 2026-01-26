import { useEffect, useState } from 'react';
import { parseOAuthCallback, exchangeCodeForToken } from '../oauth';

interface OAuthCallbackProps {
    onSuccess: (token: string) => void;
    onError: (error: string) => void;
}

export function OAuthCallback({ onSuccess, onError }: OAuthCallbackProps) {
    const [status, setStatus] = useState<'loading' | 'error'>('loading');

    useEffect(() => {
        const handleCallback = async () => {
            const { code, error } = parseOAuthCallback();

            if (error) {
                setStatus('error');
                onError(`GitHub authentication failed: ${error}`);
                return;
            }

            if (!code) {
                setStatus('error');
                onError('No authorization code received');
                return;
            }

            try {
                const token = await exchangeCodeForToken(code);
                onSuccess(token);
                // Redirect back to main app
                window.history.replaceState({}, '', '/');
            } catch (err) {
                setStatus('error');
                onError(err instanceof Error ? err.message : 'Authentication failed');
            }
        };

        handleCallback();
    }, [onSuccess, onError]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100">
            <div className="card w-96 bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                    {status === 'loading' ? (
                        <>
                            <span className="loading loading-spinner loading-lg"></span>
                            <h2 className="card-title mt-4">Completing GitHub Login...</h2>
                            <p className="text-sm text-base-content/70">Please wait</p>
                        </>
                    ) : (
                        <>
                            <svg
                                className="w-16 h-16 text-error"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h2 className="card-title mt-4">Authentication Error</h2>
                            <p className="text-sm text-base-content/70">
                                Please try logging in again
                            </p>
                            <div className="card-actions mt-4">
                                <button className="btn btn-primary" onClick={() => window.history.replaceState({}, '', '/')}>
                                    Go Back
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
