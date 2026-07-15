## ADDED Requirements

### Requirement: Three-layer rendering architecture
The system SHALL render the canvas in three fixed layers in bottom-to-top order: background layer (comic frame borders and backgrounds), character layer (character/creature images), and bubble layer (dialogue/speech bubbles).

#### Scenario: Layers render in correct z-order
- **WHEN** the canvas renders a frame
- **THEN** background layer content appears behind character layer content, which appears behind bubble layer content

#### Scenario: Each layer supports independent image insertion
- **WHEN** user drags an image from the asset library onto the canvas
- **THEN** the image is placed on the currently active layer at the drop position

### Requirement: Image insertion and basic transform
The system SHALL support inserting images onto any layer and applying basic transforms: position (x, y), size (width, height), rotation, and opacity via direct manipulation on the canvas.

#### Scenario: Select and move an image
- **WHEN** user clicks an image on the canvas and drags
- **THEN** the image moves following the cursor, and its final position is updated in the data model

#### Scenario: Resize an image via corner handles
- **WHEN** user drags a corner handle of a selected image
- **THEN** the image scales proportionally, with width and height updated in real time

#### Scenario: Rotate an image via rotation handle
- **WHEN** user drags the rotation handle of a selected image
- **THEN** the image rotates around its center point

#### Scenario: Adjust opacity via property panel
- **WHEN** user changes the opacity slider in the property panel for a selected image
- **THEN** the image's alpha value updates and is reflected immediately on the canvas

### Requirement: Canvas viewport controls
The system SHALL support canvas zoom (scroll wheel) and pan (middle mouse drag or space+drag) for navigating the workspace.

#### Scenario: Zoom with scroll wheel
- **WHEN** user scrolls the mouse wheel over the canvas
- **THEN** the canvas zooms in/out centered on the cursor position

#### Scenario: Pan with space+drag
- **WHEN** user holds spacebar and drags on the canvas
- **THEN** the viewport pans following the cursor movement

### Requirement: Layer visibility and lock
Each layer SHALL have independent visibility toggle and lock controls to prevent accidental edits.

#### Scenario: Toggle layer visibility
- **WHEN** user clicks the eye icon for the character layer
- **THEN** all items on the character layer are hidden from the canvas but remain in the data model

#### Scenario: Lock layer prevents selection
- **WHEN** a layer is locked and user clicks on an item in that layer on the canvas
- **THEN** the item is not selected and cannot be modified
