## ADDED Requirements

### Requirement: Bubble container with separate mesh and text
The system SHALL render each speech bubble as a container with two sub-components: a deformable mesh background (the bubble frame) and an independent text object inside it. The mesh deforms without affecting text glyph rendering.

#### Scenario: Bubble structure
- **WHEN** a bubble item is rendered on the canvas
- **THEN** it consists of a colored mesh background and a text object positioned inside the mesh bounds, rendered as sibling display objects within a PixiJS Container

### Requirement: 9-point mesh deformation
The system SHALL provide 9 control points on the bubble mesh: 4 corner points, 4 edge midpoints (top, bottom, left, right), and 1 center point. Dragging any control point deforms the bubble shape.

#### Scenario: Drag right edge midpoint to widen bubble
- **WHEN** user drags the right midpoint control point 50px to the right
- **THEN** the bubble mesh stretches rightward, the right edge curves outward, and the internal text re-flows to fill the new wider bounds

#### Scenario: Drag corner point
- **WHEN** user drags a corner control point diagonally outward
- **THEN** both adjacent edges deform to follow the new corner position

### Requirement: Text auto-reflow on mesh resize
When the bubble mesh is deformed, the text object SHALL automatically reflow to fit the new internal bounding box. No text warping occurs—only layout reflow (line breaks, alignment).

#### Scenario: Narrower bubble causes text reflow
- **WHEN** the left and right edge midpoints are dragged inward, reducing the bubble width
- **THEN** the text content reflows with new line breaks to fit the narrower width, maintaining its font size and style

### Requirement: Bubble tail/pointer
Each bubble SHALL support an optional tail (pointer) that indicates the speaking character, with configurable position (which edge, offset along that edge) and length.

#### Scenario: Add tail to bubble
- **WHEN** user sets a tail on the left edge at 50% offset, length 20px
- **THEN** a triangular pointer protrudes from the left edge midpoint of the bubble

### Requirement: Bubble style properties
The system SHALL support configurable bubble styles: background color, border color, border thickness, corner roundness, and padding.

#### Scenario: Change bubble appearance
- **WHEN** user sets bubble background to white, border to black 2px, corner radius 8px, and padding 12px
- **THEN** the bubble renders with the specified style properties
