# Local Storage Implementation

## Overview

The application now includes local storage functionality to persist user inputs without requiring any external systems or APIs. This allows users to maintain their preferences and previously entered data across sessions.

## Features

### 1. Repository Data Storage

- **Stored Fields:**
  - Repository owner name
  - Repository name
  - GitHub token (optional)

- **Persistence:**
  - Automatically saved when the user loads workflows
  - Automatically loaded when the app starts
  - Persists across browser sessions until cleared

### 2. Workflow Input Storage

- **Stored Fields:**
  - Workflow name
  - All input parameters provided by the user
  - Timestamp of when the inputs were saved

- **Persistence:**
  - Automatically saved when a workflow is triggered
  - Automatically loaded when triggering the same workflow again
  - Enables quick re-triggering of workflows with the same parameters

## Storage Implementation

### Storage Module (`src/storage.ts`)

The storage functionality is centralized in the `storage.ts` module, providing the following functions:

#### Repository Data Functions

```typescript
// Save repository information
saveRepositoryData(data: StoredRepositoryData): void

// Load repository information
loadRepositoryData(): StoredRepositoryData | null

// Clear repository data
clearRepositoryData(): void
```

#### Workflow Input Functions

```typescript
// Save workflow trigger inputs
saveWorkflowInputs(workflowName: string, inputs: Record<string, string>): void

// Load the most recent workflow inputs
loadWorkflowInputs(): StoredWorkflowInput | null

// Clear workflow inputs
clearWorkflowInputs(): void
```

## Component Integration

### App Component (`src/App.tsx`)

- Loads saved repository data on initial mount
- Saves repository data when workflows are loaded
- Saves workflow inputs when workflows are triggered

### RepositoryInput Component (`src/components/RepositoryInput.tsx`)

- Loads and displays saved repository data on mount
- Saves data to local storage when the form is submitted

### TriggerModal Component (`src/components/TriggerModal.tsx`)

- Loads previously saved inputs for the same workflow when the modal opens
- Allows users to quickly re-trigger workflows with saved parameters

## Storage Keys

Data is stored in the browser's localStorage with the following keys:

- `actionviewer_repo_owner` - Repository owner
- `actionviewer_repo_name` - Repository name
- `actionviewer_github_token` - GitHub authentication token
- `actionviewer_workflow_inputs` - Last triggered workflow inputs

## Technical Details

- **Storage Type:** Browser localStorage (no server/API required)
- **Error Handling:** All storage operations include try-catch error handling with console logging
- **Data Format:** JSON serialization for complex objects
- **Browser Support:** Works in all modern browsers that support localStorage
- **Privacy:** Data is stored locally in the user's browser and never sent to external servers

## User Experience Benefits

1. **Quick Access:** Users don't need to re-enter repository information after the first visit
2. **Workflow Efficiency:** Repeated workflow triggers don't require re-entering all parameters
3. **Seamless:** Auto-loading happens transparently without user action
4. **Optional Token Storage:** Users can optionally store their GitHub token for convenience
5. **Session Persistence:** Settings are retained across browser sessions until explicitly cleared

## Notes

- Token storage is optional and left to the user's discretion
- All data is stored locally and can be cleared through browser settings (Clear Browsing Data)
- The storage functions include error handling for cases where localStorage may not be available (private browsing, disabled storage, etc.)
