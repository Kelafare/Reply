## ADDED Requirements

### Requirement: Click to select item
The system SHALL select a CanvasItem when the user clicks on it, and deselect when clicking empty canvas area.

#### Scenario: Select item by clicking
- **WHEN** the user clicks on a sprite in the canvas
- **THEN** `editorStore.selectedItemId` is set to the clicked item's ID
- **AND** a blue border highlight appears around the selected item

#### Scenario: Deselect by clicking empty area
- **WHEN** the user clicks on an empty area of the canvas (not on any item)
- **THEN** `editorStore.selectedItemId` is set to `null`
- **AND** the highlight border is removed from the previously selected item

### Requirement: Selection highlight visual
The system SHALL render a blue dashed border with corner and edge handles around the selected item.

#### Scenario: Selection border appears
- **WHEN** an item is selected
- **THEN** a blue (#4a9eff) dashed rectangle is drawn around the item's bounding box
- **AND** four corner resize handles (small squares) are displayed at the corners
- **AND** a top-center rotation handle (circle) is displayed above the bounding box

### Requirement: Drag to move item
The system SHALL move a selected item when the user drags it on the canvas.

#### Scenario: Drag item to new position
- **WHEN** the user presses the mouse button on a selected item and drags
- **THEN** the item follows the mouse cursor during the drag
- **AND** on mouse release, `editorStore.updateItemTransform()` is called with the new x, y position
- **AND** the selection highlight updates to the new position

### Requirement: Corner handle to resize item
The system SHALL resize a selected item when the user drags its corner handles.

#### Scenario: Resize item with corner handle
- **WHEN** the user drags a corner handle of a selected item
- **THEN** the item's width and height scale proportionally (maintain aspect ratio for Shift+drag, free for plain drag)
- **AND** on release, `editorStore.updateItemTransform()` is called with the new width and height

### Requirement: Rotation handle to rotate item
The system SHALL rotate a selected item when the user drags its top-center rotation handle.

#### Scenario: Rotate item with rotation handle
- **WHEN** the user drags the rotation handle of a selected item
- **THEN** the item rotates around its center based on the angle between the handle and item center
- **AND** on release, `editorStore.updateItemTransform()` is called with the new rotation value

### Requirement: Coordinate system handling
The system SHALL correctly convert between screen coordinates and world coordinates accounting for viewport zoom and pan.

#### Scenario: Click position correct when zoomed in
- **WHEN** the canvas is zoomed to 200% and panned to (100, 50)
- **THEN** clicking on a point in screen space maps to the correct world space position
- **AND** the correct item is selected based on world-space hit testing

### Requirement: Hit area uses item bounds
The system SHALL use each item's bounding rectangle (baseTransform width × height) as the hit area for pointer events.

#### Scenario: Click outside item bounds does not select
- **WHEN** the user clicks on an area outside an item's bounding rectangle
- **THEN** the item is not selected
- **AND** the event falls through to the empty canvas handler

### Requirement: Interactive state cursor feedback
The system SHALL change the mouse cursor to indicate available interactions.

#### Scenario: Cursor changes on hover
- **WHEN** the user hovers over an item
- **THEN** the cursor changes to `move` (indicating draggable)
- **AND** when hovering over a corner handle, the cursor changes to the appropriate resize cursor
- **AND** when hovering over the rotation handle, the cursor changes to a rotation indicator
