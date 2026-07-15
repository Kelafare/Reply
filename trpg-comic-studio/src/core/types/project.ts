// ============================================================
// Core type definitions for TRPG Comic Studio
// ============================================================

// ---- Project & Page ----

export interface ProjectMeta {
  name: string
  resolution: { width: number; height: number }
  fps: 24 | 30 | 60
  createdAt: string
  updatedAt: string
}

export type LayerType = 'background' | 'character' | 'bubble'

export type PlaybackMode = 'sequential' | 'parallel'

export interface PlaybackConfig {
  /** How images appear within each layer */
  layerMode: PlaybackMode
  /** Pause duration (ms) after all items finish before auto-advancing */
  quietHoldMs: number
}

export interface Page {
  id: string
  name: string
  layers: Record<LayerType, Layer>
  playbackConfig: PlaybackConfig
  logText: string
}

export interface Project {
  schemaVersion: string
  metadata: ProjectMeta
  pages: Page[]
  presets: AnimationPreset[]
}

// ---- Layer & Items ----

export interface Layer {
  type: LayerType
  visible: boolean
  locked: boolean
  items: CanvasItem[]
}

export interface BaseTransform {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
}

export interface CanvasItem {
  id: string
  name: string
  imagePath: string // reference to asset
  baseTransform: BaseTransform
  displayOrder: number // order within the layer
  timeline: EffectTrack[]
}

// ---- Effects & Timeline ----

export interface EffectTrack {
  effectId: string
  startTime: number // ms, relative to item's appearance time
  duration: number | null // null = continuous effect (no end)
  params: Record<string, unknown>
  enabled: boolean
}

/** Delta transform returned by each effect plugin per frame */
export interface ItemTransform {
  x?: number
  y?: number
  scaleX?: number
  scaleY?: number
  alpha?: number
  rotation?: number
  skewX?: number
  skewY?: number
}

// ---- Effect Plugin System ----

export interface EffectPlugin {
  id: string
  name: string
  /** Has an explicit end time → draggable block on timeline. False → global property. */
  hasDuration: boolean
  defaultParams: Record<string, unknown>

  /**
   * Given normalized progress (0..1) across the effect's duration,
   * return the delta transform to apply this frame.
   */
  getTransform(params: Record<string, unknown>, progress: number): ItemTransform

  /**
   * Optional: directly manipulate a PixiJS display object.
   * Used for effects that cannot be expressed as transforms (e.g., color filters).
   */
  applyPixiFilter?(
    item: unknown /* PIXI.Container */,
    params: Record<string, unknown>,
    progress: number,
  ): void

  /**
   * React component for editing this effect's parameters.
   * Stored as a lazy reference to avoid circular deps.
   */
  ParamsEditorComponent: unknown // React.FC<{params, onChange}>
}

// ---- Animation Presets ----

export interface AnimationPreset {
  id: string
  name: string
  /** Serialized timeline data (without imagePath) */
  timeline: EffectTrack[]
  /** Base transform template */
  baseTransform: Partial<BaseTransform>
  /** Category folder path in the asset library */
  category: string
}

// ---- Asset Library ----

export type AssetType = 'image' | 'audio' | 'preset'

export interface AssetEntry {
  id: string
  name: string
  type: AssetType
  path: string // relative to project assets/ folder
  /** Sub-type for filtering: png, jpg, mp3, wav, etc. */
  extension: string
  /** For presets: the serialized animation data */
  presetData?: AnimationPreset
}

export interface AssetFolder {
  id: string
  name: string
  children: (AssetFolder | AssetEntry)[]
}

// ---- AI Generation ----

export type GenerationCategory = 'character' | 'background' | 'prop'

export interface AgentProfile {
  id: string
  name: string
  referenceImagePaths: string[]
  promptTemplate: string
  /** Which model/checkpoint to use */
  modelName: string
}

export interface GenerationRequest {
  prompt: string
  negativePrompt?: string
  category: GenerationCategory
  agentId?: string // optional: use specific agent style
  referenceImagePath?: string // for IP-Adapter mode
  width: number
  height: number
  steps: number
  cfgScale: number
}

export type GenerationStatus = 'pending' | 'running' | 'done' | 'failed'

export interface GenerationResult {
  id: string
  request: GenerationRequest
  status: GenerationStatus
  outputPath?: string
  error?: string
  createdAt: string
}

// ---- Export ----

export interface ExportConfig {
  outputPath: string
  width: number
  height: number
  fps: 24 | 30 | 60
  bitrate: string // e.g. '8M'
  startPage: number
  endPage: number
}
