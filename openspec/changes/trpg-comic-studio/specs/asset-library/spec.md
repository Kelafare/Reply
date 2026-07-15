## ADDED Requirements

### Requirement: Tree file manager
The system SHALL provide a tree-view file manager as a persistent right-side panel, supporting multi-level folder creation for organizing images, audio files, and animation presets.

#### Scenario: Create nested folders
- **WHEN** user right-clicks a folder and selects "New Folder", entering a name
- **THEN** a new subfolder is created inside the parent folder in the tree

#### Scenario: Drag asset into folder
- **WHEN** user drags a file or folder to a different folder in the tree
- **THEN** the item is moved to the target folder

### Requirement: Multi-media asset support
The system SHALL support importing and managing image files (PNG, JPG, WEBP), audio files (MP3, WAV, OGG), and animation preset files.

#### Scenario: Import image to library
- **WHEN** user drags an image file from the OS file explorer into the asset library
- **THEN** the image is copied to the project's assets folder and appears in the current library folder

#### Scenario: Preview audio file
- **WHEN** user clicks an audio file in the library
- **THEN** the system plays a short preview of the audio

### Requirement: Drag to canvas
The system SHALL support dragging images from the asset library tree directly onto the canvas to place them on the active layer.

#### Scenario: Drag image onto canvas
- **WHEN** user drags a character image from the asset library and drops it on the canvas
- **THEN** the image is inserted on the currently active layer at the drop position

### Requirement: Animation preset save and reuse
The system SHALL allow saving a fully configured image item (including all timeline tracks, effect blocks, and parameters) as a "preset" in the asset library. When a preset is dragged onto the canvas, it creates a new image item with all animation data inherited.

#### Scenario: Save animation preset
- **WHEN** user right-clicks an image on the canvas with configured effects and selects "Save as Preset"
- **THEN** the image's timeline data, effects, and base transform are serialized and stored as a preset in the library

#### Scenario: Apply preset to new image
- **WHEN** user drags a preset onto the canvas and selects an image file to bind
- **THEN** a new image item is created with the preset's timeline and effects applied, using the chosen image as the texture

#### Scenario: Replace preset image
- **WHEN** user drags a new image onto a preset-based item on the canvas
- **THEN** the texture is replaced while all animation data is preserved

### Requirement: Asset search and filter
The system SHALL support filtering the asset library view by name search and by file type (images only, audio only, presets only).

#### Scenario: Search assets by name
- **WHEN** user types a partial name in the library search bar
- **THEN** only assets whose names contain the search string are displayed
