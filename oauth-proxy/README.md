# GitHub OAuth Proxy Server

A simple Node.js proxy server to securely handle GitHub OAuth token exchanges.

## Why This is Needed

GitHub OAuth requires a client secret to exchange authorization codes for access tokens. This secret must never be exposed in client-side code (like React apps). This proxy server acts as a secure intermediary.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file:

   ```env
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   PORT=3001
   ```

3. Start the server:

   ```bash
   npm start
   ```

## Endpoints

### POST /authenticate

Exchange an authorization code for an access token.

**Request:**

```json
{
  "code": "authorization_code_from_github"
}
```

**Response:**

```json
{
  "access_token": "gho_..."
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "service": "github-oauth-proxy"
}
```

## Deployment

### Option 1: Deploy to Vercel

This proxy can be deployed as a Vercel serverless function:

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Set environment variables in Vercel dashboard
4. Update `VITE_OAUTH_PROXY_URL` in your React app

### Option 2: Deploy to any Node.js hosting

Deploy to Heroku, Railway, Render, or any platform that supports Node.js apps.

### Option 3: Run locally

For development, simply run `npm start` and keep it running alongside your React app.

## Security

- Never commit `.env` file
- Use HTTPS in production
- Consider adding rate limiting
- Consider adding request origin validation
- Rotate secrets regularly

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_CLIENT_ID` | Yes | Your GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | Yes | Your GitHub OAuth App Client Secret |
| `PORT` | No | Server port (default: 3001) |
