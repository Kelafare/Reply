## ADDED Requirements

### Requirement: Project folder structure
The system SHALL store each project as a folder containing a `project.json` entry file, an `assets/` subfolder for embedded media, and an `exports/` subfolder for output videos.

#### Scenario: Create new project
- **WHEN** user creates a new project with a given name and target directory
- **THEN** the system creates a project folder with the project name, initializes a `project.json` with default settings (resolution 1920×1080, 24fps), and creates empty `assets/` and `exports/` subfolders

#### Scenario: Open existing project
- **WHEN** user selects a folder containing a valid `project.json`
- **THEN** the system deserializes the project data, validates the schema version, runs any needed migrations, and loads all page/layer/item data into the editor

### Requirement: JSON serialization with schema versioning
The project data SHALL be serialized to `project.json` in JSON format with a `schemaVersion` field. All future data structure changes MUST be handled via migration functions keyed by version number.

#### Scenario: Save project
- **WHEN** user triggers save (manual or auto-save)
- **THEN** the current editor state is serialized to `project.json` with the current schema version, preserving all page data, layer structure, timeline tracks, and asset references

#### Scenario: Open project with older schema version
- **WHEN** a `project.json` has `schemaVersion: "1.0.0"` but the app expects `"2.0.0"`
- **THEN** the system runs all migration functions from 1.0.0 to 2.0.0 in order before loading the project

### Requirement: Auto-save
The system SHALL automatically save the project at regular intervals via debounced save, with a default interval of 30 seconds after the last edit.

#### Scenario: Auto-save triggers after edit
- **WHEN** user makes any modification to the project and stops for 30 seconds
- **THEN** the system automatically writes the current state to `project.json`

#### Scenario: Auto-save does not trigger without changes
- **WHEN** no modifications have been made since the last save
- **THEN** the auto-save timer does not trigger a write

### Requirement: Undo/Redo command history
The system SHALL maintain a command history stack supporting undo (Ctrl+Z) and redo (Ctrl+Y / Ctrl+Shift+Z) with a maximum depth of 200 entries.

#### Scenario: Undo restores previous state
- **WHEN** user performs an action (e.g., moves an image) and then presses Ctrl+Z
- **THEN** the editor state is restored to exactly what it was before that action

#### Scenario: Redo re-applies undone action
- **WHEN** user has undone an action and presses Ctrl+Y
- **THEN** the undone action is re-applied

#### Scenario: New action clears redo stack
- **WHEN** user undoes an action, then performs a new action (not redo)
- **THEN** the redo stack is cleared

#### Scenario: History depth limit
- **WHEN** the undo stack exceeds 200 entries
- **THEN** the oldest entry is removed to maintain the limit

### Requirement: Manual save and save-as
The system SHALL support manual save (Ctrl+S) and save-as (save to a new folder with optional asset copying).

#### Scenario: Save-as creates new project folder
- **WHEN** user triggers save-as and selects a new directory
- **THEN** the system copies `project.json` and optionally copies all referenced assets to the new location
