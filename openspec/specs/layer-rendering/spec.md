# layer-rendering

## Purpose
Three-layer PixiJS Container hierarchy (background / character / bubble) that mirrors the project data model. Handles Store-to-Canvas synchronization, item sprite creation/destruction, and layer visibility/lock state.

## Requirements

### Requirement: Three-layer container hierarchy
The system SHALL maintain three PixiJS Container instances corresponding to background, character, and bubble layers in strict z-order.

#### Scenario: Layers render in correct order
- **WHEN** the canvas initializes
- **THEN** the background container is at the bottom of the display list
- **AND** the character container is in the middle
- **AND** the bubble container is at the top

### Requirement: Layer visibility control
The system SHALL toggle a layer container's visibility based on the Layer.visible property in the Store.

#### Scenario: Toggle character layer off
- **WHEN** `editorStore` updates a layer's `visible` to `false`
- **THEN** the corresponding PixiJS Container's `visible` property is set to `false`
- **AND** all items in that layer are hidden from the canvas

#### Scenario: Toggle character layer on
- **WHEN** `editorStore` updates a layer's `visible` to `true`
- **THEN** the corresponding PixiJS Container's `visible` property is set to `true`
- **AND** all items in that layer reappear on the canvas

### Requirement: Layer lock control
The system SHALL disable pointer events on a locked layer's Container.

#### Scenario: Lock character layer
- **WHEN** `editorStore` updates a layer's `locked` to `true`
- **THEN** the corresponding PixiJS Container's `eventMode` is set to `'none'`
- **AND** items in that layer cannot be clicked or dragged

#### Scenario: Unlock character layer
- **WHEN** `editorStore` updates a layer's `locked` to `false`
- **THEN** the corresponding PixiJS Container's `eventMode` is set to `'static'`
- **AND** items in that layer become interactive again

### Requirement: Item rendering from Store
The system SHALL create a PixiJS Sprite for each CanvasItem in the Store and render it at the item's `baseTransform` position.

#### Scenario: Add item to layer renders a sprite
- **WHEN** a new CanvasItem is added to the character layer via `editorStore.addItem()`
- **THEN** a PixiJS Sprite is created from the item's `imagePath`
- **AND** the sprite's position, scale, rotation, and alpha match `baseTransform`

### Requirement: Item removal from Store triggers cleanup
The system SHALL remove the corresponding PixiJS Sprite when a CanvasItem is removed from the Store.

#### Scenario: Remove item destroys sprite
- **WHEN** `editorStore.removeItem()` is called for an existing item
- **THEN** the corresponding PixiJS Sprite is removed from its parent Container
- **AND** the sprite's texture and display object are destroyed

### Requirement: Item z-index ordering by displayOrder
The system SHALL render items within a layer sorted by their `displayOrder` property.

#### Scenario: Higher displayOrder renders on top
- **WHEN** two items exist in the same layer with `displayOrder` 1 and 2
- **THEN** the item with `displayOrder: 2` renders above the item with `displayOrder: 1`

### Requirement: Placeholder image for missing assets
The system SHALL display a placeholder graphic when an item's `imagePath` cannot be loaded.

#### Scenario: Missing image shows placeholder
- **WHEN** a CanvasItem references an `imagePath` that does not exist on disk
- **THEN** a placeholder rectangle with a cross pattern is rendered at the item's position
- **AND** a console warning is logged with the missing path
