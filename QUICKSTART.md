# Quick Start Guide - GitHub OAuth

Get up and running with GitHub OAuth authentication in 5 minutes!

## Step 1: Create GitHub OAuth App (2 minutes)

1. Visit <https://github.com/settings/developers>
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: `GitHub Actions Viewer`
   - **Homepage URL**: `http://localhost:5173`
   - **Callback URL**: `http://localhost:5173/callback`
4. Click **"Register application"**
5. **Copy the Client ID** shown on the next page
6. Click **"Generate a new client secret"** and **copy it immediately** (you won't see it again!)

## Step 2: Configure the Main App (1 minute)

Create `.env` in the project root:

```env
VITE_GITHUB_CLIENT_ID=paste_your_client_id_here
VITE_OAUTH_PROXY_URL=http://localhost:3001/authenticate
```

## Step 3: Set Up the OAuth Proxy (2 minutes)

```bash
# Navigate to the proxy directory
cd oauth-proxy

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `oauth-proxy/.env`:

```env
GITHUB_CLIENT_ID=paste_your_client_id_here
GITHUB_CLIENT_SECRET=paste_your_client_secret_here
PORT=3001
```

## Step 4: Start Everything

**Terminal 1** - Start the OAuth proxy:

```bash
cd oauth-proxy
npm start
```

You should see:

```
✅ GitHub OAuth Proxy running on http://localhost:3001
```

**Terminal 2** - Start the React app:

```bash
npm run dev
```

## Step 5: Test It Out

1. Open <http://localhost:5173>
2. Click **"Login with GitHub"**
3. Authorize the app on GitHub
4. You'll be redirected back and logged in! 🎉

## Troubleshooting

### "YOUR_CLIENT_ID_HERE" in the console

- Make sure you created the `.env` file in the project root
- Restart the dev server after creating `.env`

### "Failed to exchange code for token"

- Make sure the OAuth proxy is running in a separate terminal
- Check that `oauth-proxy/.env` has the correct client secret
- Verify `VITE_OAUTH_PROXY_URL` points to `http://localhost:3001/authenticate`

### Still stuck?

See the full guide in [OAUTH_SETUP.md](OAUTH_SETUP.md)

## Alternative: Use a Personal Access Token

Don't want to set up OAuth? You can still use the app!

1. Go to <https://github.com/settings/tokens/new>
2. Create a token with `repo` and `workflow` scopes
3. Paste it into the token field in the app

---

**Security Note**: Never commit your `.env` files or share your client secret!
