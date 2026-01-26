# GitHub Actions Workflow Viewer & Trigger

A React application for browsing and triggering GitHub Actions workflows in a repository.

## Features

- **Browse Workflows**: View all workflows in a GitHub repository
- **Search**: Search workflows by name or file path
- **Filter**: Filter workflows by status (active/disabled)
- **Trigger Workflows**: Manually trigger workflows with custom input parameters
- **GitHub OAuth Login**: Authenticate securely with GitHub OAuth
- **GitHub API Integration**: Seamless integration with GitHub's REST API
- **Error Handling**: Clear error messages for API issues
- **Persistent Storage**: Remembers your repositories and settings

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Authentication Options

You can authenticate in two ways:

#### Option 1: GitHub OAuth (Recommended)

1. Follow the setup guide in [OAUTH_SETUP.md](OAUTH_SETUP.md)
2. Create a GitHub OAuth App
3. Configure environment variables
4. Run the OAuth proxy server
5. Click "Login with GitHub" in the app

#### Option 2: Personal Access Token

1. Go to <https://github.com/settings/tokens>
2. Generate a new token with `repo` and `workflow` scopes
3. Enter the token manually in the app

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Testing

Run end-to-end tests with Playwright:

```bash
npm run test:e2e
```

### Linting

```bash
npm run lint
```

## Usage

1. **Authenticate**: Either login with GitHub OAuth or enter a personal access token
2. **Load Repository**: Enter the GitHub repository owner and name
3. **Browse Workflows**: Click "Load Workflows" to fetch all workflows
4. **Search & Filter**: Use the search and filter options to find specific workflows
5. **Trigger**: Click on a workflow card to trigger it with custom inputs
6. Click on a workflow card to trigger it with custom inputs

## Technologies

- React 19
- TypeScript
- Vite
- Tailwind CSS + DaisyUI
- GitHub REST API
