## ADDED Requirements

### Requirement: Log side panel
The system SHALL provide a collapsible Log panel occupying 30% of the right side of the editor view when open, displaying the session log text alongside the canvas area.

#### Scenario: Open Log panel
- **WHEN** user clicks the Log toggle button in the toolbar
- **THEN** the editor layout splits, with the canvas taking the left 70% and the Log panel the right 30%

#### Scenario: Close Log panel
- **WHEN** user clicks the Log toggle again or the close button on the panel
- **THEN** the Log panel collapses and the canvas returns to full width

### Requirement: Docx log file parsing
The system SHALL parse `.docx` format log files exported from the 海豹骰 (Seal Dice) server using the `mammoth` library, extracting text content while preserving formatting (bold, italic, colors, font sizes).

#### Scenario: Load docx log file
- **WHEN** user opens a `.docx` log file through the Log panel
- **THEN** the file is parsed via IPC to the main process, and the extracted rich text content is displayed in the Log panel with original formatting preserved

#### Scenario: Parse error handling
- **WHEN** the selected file is not a valid docx or parsing fails
- **THEN** the system displays an error message indicating the parse failure without crashing

### Requirement: Rich text display
The system SHALL render the parsed log content with preserved formatting in a scrollable text area, supporting font colors, bold, italic, and font size variations as present in the original docx.

#### Scenario: Display formatted log
- **WHEN** the docx contains text with mixed formatting (e.g., red bold for GM lines, blue for player lines)
- **THEN** the Log panel displays text with the corresponding colors and styles

### Requirement: Log text copy and paste
The system SHALL support copying text from the Log panel with original formatting preserved, and pasting it into text fields (e.g., bubble text) retaining the formatting where applicable.

#### Scenario: Copy text from Log and paste into bubble
- **WHEN** user selects a portion of the Log text, copies it (Ctrl+C), selects a bubble text field, and pastes (Ctrl+V)
- **THEN** the text is inserted into the bubble with formatting information preserved where possible

### Requirement: Log scroll synchronization
The Log panel SHALL scroll independently from the canvas. Optionally, the system MAY highlight the section of log text that corresponds to the current page/frame being viewed.

#### Scenario: Independent scroll
- **WHEN** user scrolls the Log panel
- **THEN** only the Log content scrolls; the canvas and timeline are unaffected
