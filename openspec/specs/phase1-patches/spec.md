# phase1-patches

## Purpose
Patches applied during Phase 2 to fix gaps in the Phase 1 scaffold: IPC handler registration in the main process, Immer middleware integration in Zustand stores, and baseline unit test coverage.

## Requirements

### Requirement: Main process IPC handler registration
The system SHALL register `ipcMain.handle()` for every IPC channel defined in `shared/ipc-channels.ts` that is used by the preload bridge.

#### Scenario: Dialog channel returns directory path
- **WHEN** the renderer calls `electronAPI.selectDirectory()`
- **THEN** the main process opens a native directory picker dialog
- **AND** returns the selected directory path as a string, or null if cancelled

#### Scenario: File copy channel copies asset
- **WHEN** the renderer calls `electronAPI.copyFileToAsset(srcPath, projectDir)`
- **THEN** the main process copies the source file to `projectDir/assets/` using the original filename
- **AND** returns the relative path of the copied file (e.g., `assets/char_01.png`)

#### Scenario: Missing handler returns descriptive error
- **WHEN** the renderer invokes an IPC channel that has no handler registered
- **THEN** the main process returns an error object with a message indicating the channel is not yet implemented
- **AND** a console warning is logged on the main process side

### Requirement: Zustand Store uses Immer middleware
The system SHALL use the `zustand/middleware/immer` middleware in both `editor-store` and `ui-store` to enable mutable-style state updates.

#### Scenario: Mutating state in set callback
- **WHEN** `addItem()` is called on the editor store
- **THEN** the item is pushed to the layer's items array via direct mutation syntax (`state.project.pages[...].items.push(item)`)
- **AND** Zustand+Immer produces a new immutable state object

#### Scenario: Deeply nested update with Immer
- **WHEN** `updateItemTransform()` is called with a partial transform
- **THEN** the code uses `Object.assign` or spread on the draft object
- **AND** only the affected object references change (structural sharing preserved)

### Requirement: Vitest has passing unit tests
The system SHALL have at least one passing Vitest test file for core types and one for editor store actions.

#### Scenario: Core types test passes
- **WHEN** `npm test` is run
- **THEN** at least one test verifies that a valid Project object conforms to the TypeScript type shape
- **AND** the test passes

#### Scenario: Editor store test passes
- **WHEN** `npm test` is run
- **THEN** at least one test verifies that `addItem()` correctly adds a CanvasItem to a layer
- **AND** at least one test verifies that `removeItem()` correctly removes the item
- **AND** all tests pass
