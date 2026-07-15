## ADDED Requirements

### Requirement: Multi-track timeline with independent item tracks
The system SHALL provide a timeline panel where each image Item has its own independent horizontal track row. The timeline scrolls horizontally to represent time progression.

#### Scenario: Each new image creates a track
- **WHEN** user adds an image to any layer on a page
- **THEN** a new track row appears in the timeline, labeled with the image name and its layer color indicator

#### Scenario: Track ordering matches display order
- **WHEN** the playback mode is set to sequential within a layer
- **THEN** track rows are ordered by their appearance sequence

### Requirement: Effect block creation and drag
The system SHALL represent each effect with a duration as a draggable block on its item's track. Blocks are horizontally positioned by start time and sized by duration.

#### Scenario: Add effect block to track
- **WHEN** user selects an image and adds a "Smooth Move" effect with 2 second duration
- **THEN** a block appears on that image's track, 2 seconds wide, positioned at the current playhead or default start position

#### Scenario: Drag effect block to change start time
- **WHEN** user drags an effect block horizontally on the track
- **THEN** the block snaps to the nearest time grid interval (default 100ms) and its start time updates

#### Scenario: Resize effect block to change duration
- **WHEN** user drags the left or right edge of an effect block
- **THEN** the block's duration changes, snapping to the time grid

#### Scenario: Continuous effects have no duration block
- **WHEN** an effect has `hasDuration: false` (e.g., Wobble/Breathing)
- **THEN** the effect is shown as a property indicator on the track (not a draggable block) and applies for the entire lifetime of the item

### Requirement: Playhead control
The timeline SHALL have a vertical playhead indicator showing the current time position, supporting click-to-seek and drag-to-scrub.

#### Scenario: Click timeline ruler to seek
- **WHEN** user clicks on the time ruler at position 5s
- **THEN** the playhead moves to 5s and the canvas shows the frame at that time

#### Scenario: Drag playhead to scrub
- **WHEN** user drags the playhead handle horizontally
- **THEN** the canvas updates in real time showing the rendered frame at each scrubbed position

### Requirement: Time ruler with zoom
The timeline SHALL display a time ruler at the top with tick marks adapting to the current zoom level, supporting horizontal zoom (Ctrl+scroll) to show finer or coarser time granularity.

#### Scenario: Zoom in on timeline
- **WHEN** user Ctrl+scrolls up over the timeline
- **THEN** the time scale increases, showing finer time divisions on the ruler, and blocks appear wider

### Requirement: Effect block overlap visualization
When multiple effect blocks on the same item overlap in time, the system SHALL render them stacked vertically within the track row so the user can see the overlap is intentional.

#### Scenario: Two overlapping effect blocks
- **WHEN** a Move block (0s-2s) and a Fade block (1s-3s) exist on the same item
- **THEN** both blocks are visible in the same track row, stacked one above the other for the overlapping period (1s-2s)
