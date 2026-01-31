## Why

We are building a local-first API client where the file system is the source of truth. The foundation of this application relies on a granular file structure that allows users to manage collections and requests as physical folders and files. This structure is critical for enabling Git-based collaboration (RNF-02) and preventing merge conflicts (RF-01).

Currently, the application lacks this core storage mechanism. We need to implement the fundamental layer that maps directory structures to "Collections" and JSON files to "Requests", ensuring that what the user sees in the UI is exactly what exists on disk.

## What Changes

This change implements the core file system logic and the initial "explorer" view.
1.  **File System Service (Main Process):** A robust service to recursively read directories, parse request files, and watch for file system changes in real-time.
2.  **Data Protocol:** Definition of the JSON schema for Requests and Collections.
3.  **Basic Renderer UI:** A basic file tree view in the renderer process to visualize the collections and requests loaded from disk.

## Capabilities

### New Capabilities
- `filesystem-collections`: Core logic for mapping physical directories to Collections and JSON files to API Requests, including reading, watching, and basic parsing.

### Modified Capabilities
<!-- None, initial implementation -->

## Impact

- **Main Process:** New `FileSystemService` and IPC handlers for file operations.
- **Renderer Process:** New Store/State for collections and a basic file explorer component.
- **Shared:** TypeScript interfaces/schemas for `J5Request` and `J5Collection`.
