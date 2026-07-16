# canvas-viewport

## Purpose
Canvas viewport navigation controls — zoom (Ctrl+scroll), pan (Space+drag), and reset (Ctrl+0). Transforms are applied to the PixiJS stage and synced to the UI Store.

## Requirements

### Requirement: Zoom with Ctrl+scroll wheel
The system SHALL zoom the canvas viewport in and out when the user holds Ctrl and scrolls the mouse wheel, centered on the mouse cursor position.

#### Scenario: Zoom in centered on cursor
- **WHEN** the user holds Ctrl and scrolls the mouse wheel up
- **THEN** the stage scale increases by a factor of 1.1 per scroll tick
- **AND** the stage position adjusts so the point under the cursor remains stationary

#### Scenario: Zoom out centered on cursor
- **WHEN** the user holds Ctrl and scrolls the mouse wheel down
- **THEN** the stage scale decreases by a factor of 0.9 per scroll tick
- **AND** the stage position adjusts so the point under the cursor remains stationary

### Requirement: Zoom range limits
The system SHALL constrain the zoom level between 10% and 500%.

#### Scenario: Zoom in capped at 500%
- **WHEN** the user zooms in beyond 5.0 scale
- **THEN** the zoom level is clamped to 5.0

#### Scenario: Zoom out capped at 10%
- **WHEN** the user zooms out beyond 0.1 scale
- **THEN** the zoom level is clamped to 0.1

### Requirement: Pan with Space+drag
The system SHALL pan the canvas when the user holds Space and drags with the mouse.

#### Scenario: Pan canvas with space+drag
- **WHEN** the user holds Space and drags the mouse
- **THEN** the stage position follows the mouse movement
- **AND** the cursor changes to a grab/hand icon

#### Scenario: Pan stops on space release
- **WHEN** the user releases the Space key during a pan operation
- **THEN** the pan operation ends
- **AND** the cursor returns to default

### Requirement: Reset viewport
The system SHALL reset the viewport to default (scale 1.0, centered) when the user presses Ctrl+0.

#### Scenario: Reset with Ctrl+0
- **WHEN** the user presses Ctrl+0
- **THEN** the stage scale is set to 1.0
- **AND** the stage position is set to center the canvas content

### Requirement: Viewport state stored in UI Store
The system SHALL store the current zoom and pan values in the UI Store.

#### Scenario: Zoom level persisted in store
- **WHEN** the user zooms the canvas
- **THEN** `uiStore.canvasZoom` is updated with the new zoom level
- **AND** `uiStore.canvasPanX` and `canvasPanY` are updated with the new pan position
