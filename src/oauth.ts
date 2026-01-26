/**
 * GitHub OAuth configuration and utilities
 * 
 * Setup instructions for github.com:
 * 1. Go to https://github.com/settings/developers
 * 2. Create a new OAuth App
 * 3. Set Authorization callback URL to: http://localhost:5173/callback
 * 4. Copy the Client ID and set VITE_GITHUB_CLIENT_ID
 * 
 * For GitHub Enterprise, also set:
 * - VITE_GITHUB_DOMAIN=your-enterprise.com (without https://)
 */

// GitHub domain - defaults to github.com, can be set to enterprise domain
const GITHUB_DOMAIN = import.meta.env.VITE_GITHUB_DOMAIN || 'github.com';

// Replace with your GitHub OAuth App Client ID
export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';

export const GITHUB_REDIRECT_URI = `${window.location.origin}/callback`;

// Build API URL based on domain (github.com uses api.github.com, enterprise uses domain/api/v3)
const getGitHubApiUrl = () => {
  return GITHUB_DOMAIN === 'github.com' ? 'https://api.github.com' : `https://${GITHUB_DOMAIN}/api/v3`;
};

export const GITHUB_API_URL = getGitHubApiUrl();
export const GITHUB_OAUTH_AUTHORIZE_URL = `https://${GITHUB_DOMAIN}/login/oauth/authorize`;

/**
 * Initiate GitHub OAuth flow
 */
export function initiateGitHubLogin(): void {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: 'repo workflow', // Permissions needed for viewing and triggering workflows
  });

  window.location.href = `${GITHUB_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * Note: This requires a backend proxy to securely handle the client secret
 * For development, you can use GitHub's device flow or a simple proxy
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  // This is a simplified version using a CORS proxy
  // In production, you should use your own backend to handle this securely
  const proxyUrl = import.meta.env.VITE_OAUTH_PROXY_URL || 'https://github-oauth-proxy.example.com/authenticate';
  
  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('OAuth error:', error);
    throw new Error('Failed to complete GitHub authentication');
  }
}

/**
 * Parse OAuth callback parameters from URL
 */
export function parseOAuthCallback(): { code?: string; error?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    code: params.get('code') || undefined,
    error: params.get('error') || undefined,
  };
}
