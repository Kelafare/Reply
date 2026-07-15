## ADDED Requirements

### Requirement: Effect plugin registry
The system SHALL provide a plugin registry where all animation effects are registered by unique ID. Each effect implements the `EffectPlugin` interface providing: id, name, hasDuration flag, defaultParams, getTransform function, optional applyPixiFilter function, and a React ParamsEditor component.

#### Scenario: Register and list built-in effects
- **WHEN** the application starts
- **THEN** all built-in effects (Move, Fade, Scale, Wobble, Material, FrameAnimation) are registered and available for use

#### Scenario: Add custom effect via plugin
- **WHEN** a new effect object implementing the EffectPlugin interface is added to the registry
- **THEN** the effect appears in the effect picker UI and can be applied to items

### Requirement: Smooth move effect
The system SHALL provide a smooth move effect that interpolates an image's position from a start offset to an end offset over a configurable duration, with adjustable easing curve.

#### Scenario: Apply smooth move
- **WHEN** user adds a Move effect with start (0,0), end (200, 100), duration 2s, easing "easeInOutQuad"
- **THEN** the image smoothly moves from its base position to +200px right and +100px down over 2 seconds, with acceleration at start and deceleration at end

### Requirement: Fade animation effect
The system SHALL provide a fade effect that transitions opacity from the current value to a target alpha over a configurable duration, with an option to auto-restore to original opacity after the animation ends.

#### Scenario: Fade out with auto-restore
- **WHEN** user adds a Fade effect with targetAlpha 0, duration 1s, autoRestore true
- **THEN** the image fades to invisible over 1s, then immediately returns to its original opacity

#### Scenario: Fade in without auto-restore
- **WHEN** user adds a Fade effect with targetAlpha 1, duration 1s, autoRestore false
- **THEN** the image fades in to full opacity and stays there

### Requirement: Scale animation effect
The system SHALL provide a scale effect that smoothly transitions an image's scale from its current value to a target scale multiplier over a configurable duration.

#### Scenario: Scale down animation
- **WHEN** user adds a Scale effect with targetScaleX 0.5, targetScaleY 0.5, duration 1.5s
- **THEN** the image shrinks to half size over 1.5 seconds

### Requirement: Wobble/breathing effect
The system SHALL provide a wobble (breathing) effect that applies a subtle oscillating deformation to the image, simulating breathing or idle animation. This effect has no end time and runs continuously.

#### Scenario: Apply breathing effect
- **WHEN** user adds a Wobble effect to a character image with amplitude 3px and frequency 0.5Hz
- **THEN** the character image oscillates gently (scale ~1.00-1.03, with slight y-axis shift) in a sine-wave pattern for as long as the image is visible

### Requirement: Material override effect
The system SHALL provide a material override effect that applies a color tint or texture overlay on an image while preserving its silhouette/alpha channel, configurable with start and end time.

#### Scenario: Apply color tint
- **WHEN** user adds a Material effect with tint "#ff0000", intensity 0.5, duration 2s
- **THEN** the image is overlaid with a 50% red tint starting at the effect start time, reverting to normal after the duration

### Requirement: Frame animation effect
The system SHALL provide a frame animation effect where multiple image frames are played in sequence on a single item position, with configurable frame duration and loop option.

#### Scenario: Play frame sequence
- **WHEN** user adds 4 frames to an image's frame list (each 200ms), with loop enabled
- **THEN** the image cycles through the 4 frames repeatedly, each frame displaying for 200ms

#### Scenario: Frame animation with end time
- **WHEN** user sets a frame animation duration to 1.6s with 4 frames of 200ms each, loop disabled
- **THEN** the animation plays through all frames twice (4 × 200ms × 2 = 1.6s) and stops

### Requirement: UT-style text animation
The system SHALL provide a text animation effect for speech bubbles that supports character-by-character reveal (typewriter mode) or instant full display, with optional per-character audio binding.

#### Scenario: Typewriter text reveal
- **WHEN** user enables UT animation with "character-by-character" mode and a total duration of 3s for 15 characters
- **THEN** characters appear one at a time, each taking 200ms, over the 3s duration

#### Scenario: Instant full text display
- **WHEN** user enables UT animation with "instant" mode and plays the timeline
- **THEN** all text appears at once when the bubble's start time is reached

### Requirement: Effect compositor — additive overlay
The system SHALL compose multiple overlapping effects on the same item by summing their individual transform deltas in track array order. Effects operate on an additive basis—a Move effect contributes x/y offsets, a Scale effect contributes scale multipliers, and a Fade effect contributes alpha offsets, all applied simultaneously in the area of overlap.

#### Scenario: Combined move + scale + fade
- **WHEN** a Move effect (0-2s, to +150,+80), Scale effect (0-2s, to 0.6x), and Fade effect (0-2s, to 0.5 alpha) all overlap on the same image
- **THEN** the image simultaneously moves, shrinks, and fades over the overlapping period, producing a "walking away" composite animation

#### Scenario: Non-overlapping effects apply independently
- **WHEN** a Move effect runs 0-1s and a Fade effect runs 2-3s on the same image
- **THEN** the image moves during 0-1s, stays still during 1-2s, then fades during 2-3s
