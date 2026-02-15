## Why

A significant portion of the application functionality, specifically the Dark/Light mode and multiple request tabs, has been implemented by other systems but is currently missing from the main specifications. This creates a discrepancy where the implementation is ahead of the documentation, making it difficult to maintain consistency and valid verify future changes.
Additionally, there have been refactors in TypeScript interfaces to types that need to be reflected in the core foundation standards.

## What Changes

This change aims to "officialise" these existing features by creating the necessary specifications and design documents. It does not introduce new code, but rather synchronizes the `openspec` documentation with the current codebase state (HEAD).

Key areas to document:
1.  **UI Theming**: The `useThemeStore` and CSS variable implementation for Dark/Light mode.
2.  **Core Types**: The shift from `interface` to `type` for data structures.
3.  **Workspace Tabs**: Verification of the multi-tab implementation against existing specs.

## Capabilities

### New Capabilities

- `ui-theming`: Management of application themes (Dark/Light), including system preference detection and persistence via localStorage.

### Modified Capabilities

- `core-foundation`: Update TypeScript standards to prefer `type` over `interface` for data structures.
- `workspace-tabs`: Verify and update specs if the implementation introduced behavioral changes not covered in the original spec.

## Impact

- **Documentation**: New spec file `specs/ui-theming/spec.md`.
- **Standards**: Updates to `specs/core-foundation/spec.md`.
- **Verification**: No functional code changes, but `tasks.md` will include verification steps to ensure implementation matches these new specs.
