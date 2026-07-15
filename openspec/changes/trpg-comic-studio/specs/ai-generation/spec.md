## ADDED Requirements

### Requirement: ComfyUI backend bridge
The system SHALL communicate with a locally running ComfyUI instance via its JSON API. The main process manages the ComfyUI subprocess lifecycle and proxies generation requests from the renderer.

#### Scenario: Start ComfyUI on app launch
- **WHEN** the application starts and ComfyUI is configured as the active backend
- **THEN** the main process spawns a ComfyUI subprocess and waits for the API endpoint to become available

#### Scenario: Submit image generation job
- **WHEN** user fills in a prompt and clicks "Generate" in the AI panel
- **THEN** a ComfyUI workflow JSON is constructed with the prompt and model parameters, submitted via HTTP POST, and the job ID is tracked

#### Scenario: Poll for generation result
- **WHEN** a generation job is submitted to ComfyUI
- **THEN** the main process polls the job status until completion, then downloads the output image and notifies the renderer

#### Scenario: ComfyUI unavailable fallback
- **WHEN** ComfyUI is not running or not installed
- **THEN** the system falls back to the configured cloud API (DashScope or Replicate) for generation

### Requirement: Multi-agent art style management
The system SHALL support creating multiple "agent" profiles, each associated with a specific art style defined by reference images and prompt templates. Agents are selectable per generation request.

#### Scenario: Create a new style agent
- **WHEN** user uploads 5-10 reference images and provides a style name and base prompt
- **THEN** a new agent profile is created and stored, available in the generation panel's agent selector

#### Scenario: Generate with selected agent
- **WHEN** user selects an agent and submits a generation request
- **THEN** the agent's reference images and prompt template are included in the ComfyUI workflow

### Requirement: LoRA model training
The system SHALL support triggering LoRA fine-tuning on a set of uploaded character reference images (5-15 images) through Kohya_ss, producing a LoRA weight file for use in generation.

#### Scenario: Train character LoRA
- **WHEN** user uploads 10 character images and initiates LoRA training
- **THEN** the main process triggers Kohya_ss training with the images, displays progress status, and stores the resulting LoRA weights in the asset library

#### Scenario: Training progress display
- **WHEN** LoRA training is in progress
- **THEN** the AI panel displays current training step, estimated remaining time, and a live preview of intermediate results if available

### Requirement: IP-Adapter reference generation
The system SHALL support IP-Adapter as a training-free alternative for character-consistent generation, using a single reference image to guide the model.

#### Scenario: Quick generation with IP-Adapter
- **WHEN** user provides a single reference character image and a prompt, selecting "IP-Adapter" mode
- **THEN** the generated image preserves the reference character's facial features and clothing style

### Requirement: Full-category generation
The system SHALL support generating not only character images but also background scenes, props, and items through the AI panel with appropriate prompt templates per category.

#### Scenario: Generate background image
- **WHEN** user selects "Background" category, enters a scene description, and clicks Generate
- **THEN** the generated image is suitable for use as a background layer image

### Requirement: Generated image management
The system SHALL display generated images with options to save to the asset library (for reuse) or discard. Batch management of generated results SHALL be supported.

#### Scenario: Save generated image to library
- **WHEN** user clicks "Save to Library" on a generated image result
- **THEN** the image is copied to the assets folder and appears in the current library folder

#### Scenario: Batch select and delete
- **WHEN** user multi-selects several generated images and clicks delete
- **THEN** all selected images are removed from the generation history
