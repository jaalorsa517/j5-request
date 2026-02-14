# Proposal: Expand Test Coverage Scope

## Why

Currently, test coverage is limited to `src/main/services`, giving a potentially misleading high coverage score while ignoring significant parts of the application like the Renderer process, Components, Stores, and IPC mechanisms. The user has explicitly requested that "the rest of the code" should also be covered, excluding only configuration and execution entry points (e.g., `main.ts`).

Expanding the coverage scope to `src/**` ensures transparency regarding the actual quality state of the project and encourages testing across all architectural layers.

## What Changes

The coverage configuration in `vitest.config.ts` will be updated to remove restrictive inclusions and instead include all source files by default, applying specific exclusions only for non-testable files (configs, types, main execution entries).

## Capabilities

### New Capabilities
- `full-stack-coverage`: Enable coverage reporting for the entire source tree including Renderer and Main processes.

### Modified Capabilities
- `unit-testing-infrastructure`: Update requirements to reflect the expanded scope of coverage (from specific services to the entire codebase).

## Impact

- **Configuration**: `vitest.config.ts` will be modified.
- **Metrics**: Global coverage metrics will likely drop significantly as untracked files are added to the denominator. This is expected and accepted as the "true" state.
- **Workflow**: Future development will require writing tests for UI components and IPC to meet thresholds.
