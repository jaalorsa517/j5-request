## Why

Phase 4 focuses on the "Executor" functionality of the Request app. This is the engine that actually performs the HTTP requests and handles the scripting logic. Currently, the UI exists (Phase 2) and FS layer (Phase 1), but we lack the core capability to execute requests robustly and script interactions.

This phase is critical for:
1.  **Safety & Reliability**: Executing requests in the Main process to bypass CORS (RNF-04).
2.  **Automation**: Enabling pre-request and test scripts in a sandboxed environment (RF-08, RNF-05).
3.  **Dynamic Workflows**: allowing data to be passed between requests via environment variables (RF-09).

## What Changes

We will implement the request execution engine in the Electron Main process. We will also build a secure sandbox for user scripts and implementing the environment variable system that ties execution and scripting together.

## Capabilities

### New Capabilities
- `request-execution-engine`: Core logic to send HTTP requests from the Main process (using `net` or `axios` equivalent in Node) to avoid CORS issues and handle large responses.
- `scripting-sandbox`: A secure execution environment (using `vm2` or Node's `vm` with strict context) for running user-defined JavaScript/TypeScript during Pre-request and Post-response hooks.
- `environment-manager`: System to manage global and environment-specific variables, including secret handling and variable resolution in request fields (e.g., `{{baseUrl}}`).

### Modified Capabilities
- `file-system-store`: Will need to interface with the Environment Manager to persist environment configs and secrets properly.

## Impact

- **Main Process**: New IPC handlers for executing requests and running scripts.
- **Architecture**: Decoupling execution from the UI. The UI only sends a "Request Definition" and receives a "Response Object".
- **Security**: Strict isolation for user scripts is paramount to prevent malicious access to the user's file system via the sandbox.
