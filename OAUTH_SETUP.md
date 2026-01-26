# GitHub OAuth Setup Guide

This guide will help you set up GitHub OAuth authentication for the Actions Viewer app.

## Quick Setup

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the form:
   - **Application name**: `GitHub Actions Viewer` (or your preferred name)
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5173/callback`
4. Click **"Register application"**
5. Copy the **Client ID** (you'll need this)
6. Click **"Generate a new client secret"** and copy it (you'll need this for the proxy)

### 2. Configure Environment Variables

Create a `.env` file in the root of your project:

```env
VITE_GITHUB_CLIENT_ID=your_client_id_here
VITE_OAUTH_PROXY_URL=http://localhost:3001/authenticate
```

Replace `your_client_id_here` with your actual GitHub OAuth App Client ID.

### 3. Set Up OAuth Proxy Server

Since GitHub OAuth requires a client secret that cannot be exposed in the browser, you need a simple backend proxy.

#### Option A: Use the included Node.js proxy (Recommended)

1. Navigate to the `oauth-proxy` directory:

   ```bash
   cd oauth-proxy
   npm install
   ```

2. Create `oauth-proxy/.env`:

   ```env
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   PORT=3001
   ```

3. Start the proxy server:

   ```bash
   npm start
   ```

#### Option B: Deploy to Vercel/Netlify

See the deployment guide in `oauth-proxy/README.md` for instructions on deploying the proxy as a serverless function.

### 4. Run the Application

1. Start the dev server:

   ```bash
   npm run dev
   ```

2. Open <http://localhost:5173>
3. Click **"Login with GitHub"** to authenticate

## How It Works

1. User clicks "Login with GitHub"
2. User is redirected to GitHub's authorization page
3. User authorizes the app
4. GitHub redirects back to `/callback` with an authorization code
5. The app sends the code to your proxy server
6. The proxy exchanges the code for an access token using your client secret
7. The token is returned to the app and stored in localStorage
8. The app uses the token to make authenticated GitHub API requests

## Security Notes

- **Never commit your client secret** to version control
- The proxy server should be the only place that knows the client secret
- In production, use HTTPS for both your app and proxy
- Consider implementing additional security measures like CSRF tokens
- Tokens are stored in localStorage - users should log out on shared computers

## Troubleshooting

### "Failed to exchange code for token"

- Check that your proxy server is running
- Verify the `VITE_OAUTH_PROXY_URL` environment variable is correct
- Check proxy server logs for errors

### "Authentication failed"

- Verify your Client ID and Secret are correct
- Ensure the callback URL matches exactly (including trailing slashes)
- Check that your OAuth app is not suspended

### CORS errors

- Make sure your proxy server includes proper CORS headers
- The included proxy handles this automatically

## Production Deployment

For production:

1. Update the callback URL in your GitHub OAuth App settings
2. Deploy the proxy server to a secure backend
3. Update `VITE_OAUTH_PROXY_URL` to point to your production proxy
4. Use environment variables for all sensitive configuration
5. Consider using a more robust secret management solution

## Alternative: GitHub Personal Access Token

Users can still manually enter a Personal Access Token instead of using OAuth:

1. Go to <https://github.com/settings/tokens>
2. Generate a new token with `repo` and `workflow` scopes
3. Enter the token in the app's token field

This is useful for:

- Local development
- CI/CD environments
- Users who prefer not to use OAuth
