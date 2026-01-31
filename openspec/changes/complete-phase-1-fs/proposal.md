## Why

The current completion of Phase 1 (Core & File System) allows for reading and writing request files, but lacks essential file system management capabilities. Users currently cannot create collections (folders), rename items, or delete them without leaving the application. This creates unnecessary friction and contradicts the goal of a robust, self-contained desktop tool. To consider Phase 1 truly "complete" as a foundation, the Core must support full CRUD operations on the file system.

## What Changes

We will extend the backend logic and IPC layer to support the full lifecycle of files and directories.

1.  **Backend Services**: Add `createDirectory`, `rename`, and `delete` methods to `FileSystemService`.
2.  **IPC Layer**: Expose these new methods securely to the renderer process.
3.  **Frontend Store**: Update the Pinia `file-system` store to interact with these new API endpoints.

Note: While this change enables the *logic* for these operations, the full UI components (context menus, modals) explicitly belong to Phase 2 (Motor UI). This change ensures the logical "backend" of the application is fully feature-complete for Phase 1 requirements.

## Capabilities

### New Capabilities
- `filesystem-management`: Comprehensive management of the file system including folder creation, file/folder renaming, and deletion.

### Modified Capabilities
- `filesystem-core`: (Implicit) Enhancing existing read/write core with management features.

## Impact

- **Services**: `src/main/services/FileSystemService.ts` will receive new Node.js `fs` implementations.
- **IPC**: `src/main/ipc.ts` and `src/preload/preload.ts` will be updated to bridge the new methods.
- **Store**: `src/renderer/stores/file-system.ts` will add actions for the new operations.
