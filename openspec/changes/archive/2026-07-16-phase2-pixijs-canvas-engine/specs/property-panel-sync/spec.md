## ADDED Requirements

### Requirement: Property panel displays selected item data
The system SHALL display the selected item's `baseTransform` properties in the right-side property panel.

#### Scenario: Select item shows properties
- **WHEN** an item is selected on the canvas
- **THEN** the property panel shows labeled input fields for: X, Y, Width, Height, Rotation (degrees), Opacity (0-100%)
- **AND** each field is pre-filled with the item's current `baseTransform` values

#### Scenario: Deselect clears properties
- **WHEN** no item is selected (selectedItemId is null)
- **THEN** the property panel shows a placeholder message "选择对象以编辑属性"

### Requirement: Editing properties updates Store
The system SHALL update the Store when the user edits a property value in the property panel.

#### Scenario: Edit X position
- **WHEN** the user types a new value in the X input field and presses Enter or blurs the field
- **THEN** `editorStore.updateItemTransform()` is called with the new X value
- **AND** the item moves to the new X position on the canvas

#### Scenario: Edit rotation
- **WHEN** the user changes the rotation value and presses Enter or blurs
- **THEN** `editorStore.updateItemTransform()` is called with the new rotation value
- **AND** the item rotates on the canvas

### Requirement: Store changes reflect back to property panel
The system SHALL update the property panel input fields when the Store changes (e.g., from canvas drag).

#### Scenario: Canvas drag updates property panel
- **WHEN** the user drags an item on the canvas, which calls `editorStore.updateItemTransform()`
- **THEN** the X and Y input fields in the property panel update to reflect the new position

### Requirement: Property field validation
The system SHALL validate numeric input fields and prevent invalid values.

#### Scenario: Invalid input rejected
- **WHEN** the user enters a non-numeric value in a numeric field
- **THEN** the field border turns red
- **AND** the Store is NOT updated

#### Scenario: Valid input accepted
- **WHEN** the user enters a valid numeric value
- **THEN** the field displays normally
- **AND** the Store IS updated with the parsed number

### Requirement: Layer visibility and lock toggles
The system SHALL provide toggle controls in the toolbar or layer panel for each layer's visibility and lock state.

#### Scenario: Click eye icon toggles visibility
- **WHEN** the user clicks the eye icon for the character layer
- **THEN** `editorStore` updates the character layer's `visible` property
- **AND** the eye icon visually changes to indicate the hidden state
- **AND** items in that layer disappear from the canvas

#### Scenario: Click lock icon toggles lock
- **WHEN** the user clicks the lock icon for the character layer
- **THEN** `editorStore` updates the character layer's `locked` property
- **AND** the lock icon visually changes to indicate the locked state
- **AND** items in that layer can no longer be selected or dragged on the canvas
