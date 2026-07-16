# pixi-canvas-init

## Purpose
Manage the PixiJS Application lifecycle — initialization, WebGL context, resize handling, and teardown. Serves as the foundation for all canvas rendering in the TRPG Comic Studio editor.

## Requirements

### Requirement: PixiJS Application initialization
The system SHALL initialize a PixiJS Application in WebGL mode and mount it to the `canvas-container` DOM element.

#### Scenario: Application starts successfully
- **WHEN** the renderer process loads and `initCanvasApp()` is called with a valid DOM container
- **THEN** a PixiJS Application instance is created with WebGL renderer
- **AND** the Application's canvas element is appended to the container

### Requirement: PixiJS Application background color
The system SHALL set the PixiJS Application background to match the editor theme (#11111b).

#### Scenario: Canvas background matches theme
- **WHEN** the Application initializes
- **THEN** the renderer background is set to 0x11111b

### Requirement: PixiJS Application resize handling
The system SHALL resize the PixiJS Application when the browser window resizes.

#### Scenario: Window resize triggers canvas resize
- **WHEN** the browser window is resized
- **THEN** the Application renderer resizes to match the container's new dimensions
- **AND** the stage scale/position adjusts to maintain the current viewport center

### Requirement: PixiJS Application teardown
The system SHALL properly destroy the PixiJS Application when the editor closes or the component unmounts.

#### Scenario: Application cleanup on destroy
- **WHEN** `destroyCanvasApp()` is called
- **THEN** the WebGL context is released
- **AND** all child display objects are destroyed recursively
- **AND** the canvas element is removed from the DOM

### Requirement: WebGL context loss recovery
The system SHALL attempt to restore the PixiJS Application after a WebGL context loss event.

#### Scenario: Context lost and restored
- **WHEN** the WebGL context is lost (e.g., GPU driver crash)
- **THEN** the system logs a warning
- **AND** when the context is restored, the Application re-renders all layers from the current Store state
