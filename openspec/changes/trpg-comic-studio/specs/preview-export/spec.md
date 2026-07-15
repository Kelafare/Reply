## ADDED Requirements

### Requirement: Built-in playback engine
The system SHALL render and play the dynamic comic animation in real time within the canvas, following layer order (bottom→middle→top) and within each layer respecting the configured display mode (images appear one-by-one or all at once).

#### Scenario: Sequential layer playback
- **WHEN** layer display mode is set to "sequential" and user presses Play
- **THEN** images on the background layer appear one by one in display order, with each image's timeline effects playing; after all background images finish, character layer images begin

#### Scenario: Parallel layer playback
- **WHEN** layer display mode is set to "parallel" and user presses Play
- **THEN** all images on the current layer appear simultaneously, each running their own timeline effects concurrently

### Requirement: Quiet hold duration
The system SHALL support a configurable "quiet hold" duration—a pause after all images on a page have finished their animations—before automatically advancing to the next page.

#### Scenario: Auto-advance after quiet hold
- **WHEN** all items on the current page have finished their animations, and quiet hold is set to 2 seconds
- **THEN** the page remains static for 2 seconds, then automatically transitions to the next page

#### Scenario: Manual advance disables auto
- **WHEN** user clicks "Next Page" during the quiet hold period
- **THEN** the page advances immediately, ignoring the remaining hold time

### Requirement: Playback controls
The system SHALL provide standard playback controls: Play/Pause, Stop (return to start), Next Page, Previous Page, and a progress indicator.

#### Scenario: Pause and resume
- **WHEN** user clicks Pause during playback
- **THEN** the animation freezes at the current frame; clicking Play resumes from that point

#### Scenario: Stop returns to start
- **WHEN** user clicks Stop
- **THEN** playback halts and the playhead returns to time 0

### Requirement: Real-time preview quality
During preview playback, the system SHALL render at the project's configured resolution and frame rate, prioritizing real-time performance over export-quality rendering.

#### Scenario: Preview at 24fps
- **WHEN** the project is configured for 24fps and user plays the preview
- **THEN** the engine renders and displays frames at approximately 24fps, potentially dropping frames if the system cannot keep up

### Requirement: MP4 video export
The system SHALL export the entire project as an MP4 video file using FFmpeg for frame-to-video encoding, with configurable resolution and frame rate.

#### Scenario: Export project to MP4
- **WHEN** user opens the export dialog, sets resolution to 1920×1080 and 30fps, and clicks Export
- **THEN** the system renders each frame of the project sequentially, pipes the frame data to FFmpeg, and produces an MP4 video file in the project's `exports/` folder

#### Scenario: Export progress display
- **WHEN** video export is in progress
- **THEN** a progress bar shows the percentage complete (frames rendered / total frames) with estimated remaining time

#### Scenario: Export cancellation
- **WHEN** user clicks Cancel during an export
- **THEN** the FFmpeg process is terminated, the partial output file is cleaned up, and the canvas returns to normal editing mode

### Requirement: Export settings
The system SHALL allow configuring export parameters: output resolution (with common presets like 1920×1080, 1280×720), frame rate (24/30/60 fps), and video quality/bitrate.

#### Scenario: Change export resolution
- **WHEN** user selects 1280×720 from the export resolution dropdown
- **THEN** the export renders frames at 1280×720, scaling the original canvas content proportionally
