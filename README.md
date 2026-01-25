# GitHub Actions Workflow Viewer & Trigger

A React application for browsing and triggering GitHub Actions workflows in a repository.

## Features

- **Browse Workflows**: View all workflows in a GitHub repository
- **Search**: Search workflows by name or file path
- **Filter**: Filter workflows by status (active/disabled)
- **Trigger Workflows**: Manually trigger workflows with custom input parameters
- **GitHub API Integration**: Seamless integration with GitHub''s REST API
- **Error Handling**: Clear error messages for API issues

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A GitHub personal access token (for private repos or higher API limits)

### Installation

``````bash
npm install
``````

### Development

``````bash
npm run dev
``````

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

``````bash
npm run build
``````

### Testing

Run end-to-end tests with Playwright:

``````bash
npm run test:e2e
``````

### Linting

``````bash
npm run lint
``````

## Usage

1. Enter the GitHub repository owner and name
2. Optionally provide a GitHub token for private repositories
3. Click "Load Workflows" to fetch all workflows
4. Use the search and filter options to find specific workflows
5. Click on a workflow card to trigger it with custom inputs

## Technologies

- React 19
- TypeScript
- Vite
- Tailwind CSS + DaisyUI
- GitHub REST API
