## Why

Implement Phase 3 of the J5-request roadmap: "Git Ops". The goal is to allow developers to manage the Git workflow directly within the application, enabling them to version request collections, handle commits, push/pull changes, and manage branches without leaving the tool. This aligns with the "API-as-Code" philosophy where proper version control is central.

## What Changes

We will introduce a new Git Operations module in the UI that interacts with the underlying git repositories of the opened workspaces. This will include a visual interface for common git commands and support for managing multiple repositories simultaneously.

## Capabilities

### New Capabilities
- `git-operations`: Core git functionality including commit, push, pull, fetch, and branch management within the UI.
- `git-ui`: visual components to stage changes, view history, and handle errors/conflicts.
- `multi-repo-support`: Support for detecting and managing multiple git repositories within the active workspace.

### Modified Capabilities
- `filesystem-core`: (Implicit) May need updates to support git-aware file watching or status checks, but primarily this is a new layer on top. We will list it if we modify the core directly, but for now, we'll treat `git-operations` as new.

## Impact

- **UI**: New "Git" or "Source Control" side panel/view.
- **Backend/Electron**: Main process needs to expose git commands (via simple-git or isomorphic-git) to the renderer.
- **Store**: New store module for Git state (current branch, status, staged files).
