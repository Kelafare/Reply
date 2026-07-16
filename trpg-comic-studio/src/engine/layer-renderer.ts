import { Container, Sprite, Texture, Graphics, Text, Assets } from 'pixi.js'
import { getStageContainer } from './canvas-app'
import { useEditorStore } from '../store/editor-store'
import type { Project, Layer as LayerData, CanvasItem } from '../core/types'

// ---- Container references ----

let backgroundContainer: Container | null = null
let characterContainer: Container | null = null
let bubbleContainer: Container | null = null

/** Map of item ID → Sprite for efficient lookup during sync */
const itemSpriteMap = new Map<string, Sprite>()

// ---- Initialization ----

/**
 * Create the three-layer container hierarchy and add to the stage.
 */
export function createLayerContainers(): {
  background: Container
  character: Container
  bubble: Container
} {
  const stage = getStageContainer()
  if (!stage) {
    throw new Error('[layer-renderer] Stage container not found. Call initCanvasApp() first.')
  }

  // Remove old containers if re-initializing
  if (backgroundContainer) stage.removeChild(backgroundContainer)
  if (characterContainer) stage.removeChild(characterContainer)
  if (bubbleContainer) stage.removeChild(bubbleContainer)

  backgroundContainer = new Container()
  backgroundContainer.label = 'layer-background'
  backgroundContainer.sortableChildren = true

  characterContainer = new Container()
  characterContainer.label = 'layer-character'
  characterContainer.sortableChildren = true
  characterContainer.eventMode = 'static'

  bubbleContainer = new Container()
  bubbleContainer.label = 'layer-bubble'
  bubbleContainer.sortableChildren = true
  bubbleContainer.eventMode = 'static'

  // z-order: background (bottom) → character (middle) → bubble (top)
  stage.addChild(backgroundContainer)
  stage.addChild(characterContainer)
  stage.addChild(bubbleContainer)

  return {
    background: backgroundContainer,
    character: characterContainer,
    bubble: bubbleContainer,
  }
}

/**
 * Get a layer container by type.
 */
export function getLayerContainer(type: string): Container | null {
  switch (type) {
    case 'background':
      return backgroundContainer
    case 'character':
      return characterContainer
    case 'bubble':
      return bubbleContainer
    default:
      return null
  }
}

// ---- Store → PixiJS Sync ----

let prevProjectRef: Project | null = null

/**
 * Full sync from Store's Project to PixiJS layer containers.
 * Called whenever the project changes.
 */
export function syncLayersFromStore(): void {
  const project = useEditorStore.getState().project
  if (!project) {
    clearAllLayers()
    prevProjectRef = null
    return
  }

  // Initialize containers if needed
  if (!backgroundContainer || !characterContainer || !bubbleContainer) {
    createLayerContainers()
  }

  const currentPage = project.pages[useEditorStore.getState().currentPageIndex]
  if (!currentPage) return

  syncLayer(currentPage.layers.background, backgroundContainer!)
  syncLayer(currentPage.layers.character, characterContainer!)
  syncLayer(currentPage.layers.bubble, bubbleContainer!)

  prevProjectRef = project
}

/**
 * Sync a single layer's data to its PixiJS Container.
 */
function syncLayer(layerData: LayerData, container: Container): void {
  // Sync visibility and lock state
  container.visible = layerData.visible
  container.eventMode = layerData.locked ? 'none' : 'static'

  // Track which item IDs exist in the store
  const storeItemIds = new Set(layerData.items.map((item) => item.id))

  // Remove sprites for items no longer in the store
  for (const [id, sprite] of itemSpriteMap) {
    if (!storeItemIds.has(id) && sprite.parent === container) {
      container.removeChild(sprite)
      sprite.destroy({ texture: true })
      itemSpriteMap.delete(id)
    }
  }

  // Create or update sprites for current items
  for (const item of layerData.items) {
    let sprite = itemSpriteMap.get(item.id)

    if (!sprite) {
      sprite = createItemSprite(item)
      container.addChild(sprite)
      itemSpriteMap.set(item.id, sprite)
    }

    applyItemTransform(sprite, item)
    sprite.zIndex = item.displayOrder
  }
}

// ---- Item Sprite Management ----

/**
 * Create a PixiJS Sprite for a CanvasItem.
 * Falls back to a placeholder rectangle if the image fails to load.
 */
function createItemSprite(item: CanvasItem): Sprite {
  let sprite: Sprite

  try {
    // Try to load from texture cache, fall back to placeholder
    if (Texture.from(item.imagePath).width > 0) {
      sprite = new Sprite(Texture.from(item.imagePath))
    } else {
      sprite = createPlaceholderSprite(item)
    }
  } catch {
    console.warn(`[layer-renderer] Failed to load image: ${item.imagePath}, using placeholder.`)
    sprite = createPlaceholderSprite(item)
  }

  sprite.label = item.id
  sprite.eventMode = 'static'
  sprite.cursor = 'move'

  return sprite
}

/**
 * Create a placeholder rectangle with cross pattern for missing images.
 */
function createPlaceholderSprite(item: CanvasItem): Sprite {
  const graphics = new Graphics()
  const w = item.baseTransform.width || 200
  const h = item.baseTransform.height || 200

  // Filled rectangle
  graphics.rect(0, 0, w, h)
  graphics.fill({ color: 0x333344 })
  graphics.stroke({ width: 2, color: 0x585b70 })

  // Cross lines to indicate missing
  graphics.moveTo(0, 0)
  graphics.lineTo(w, h)
  graphics.stroke({ width: 2, color: 0x585b70 })
  graphics.moveTo(w, 0)
  graphics.lineTo(0, h)
  graphics.stroke({ width: 2, color: 0x585b70 })

  // Generate texture from graphics
  const texture = app?.renderer.generateTexture(graphics)
  const sprite = new Sprite(texture || Texture.WHITE)
  sprite.width = w
  sprite.height = h

  return sprite
}

/**
 * Apply a CanvasItem's baseTransform to a Sprite.
 */
function applyItemTransform(sprite: Sprite, item: CanvasItem): void {
  const t = item.baseTransform
  sprite.x = t.x
  sprite.y = t.y
  sprite.width = t.width
  sprite.height = t.height
  sprite.rotation = (t.rotation * Math.PI) / 180 // degrees to radians
  sprite.alpha = t.opacity
}

/**
 * Render a new single CanvasItem and add it to its layer container.
 */
export function renderItem(item: CanvasItem, layerType: string): Sprite | null {
  const container = getLayerContainer(layerType)
  if (!container) {
    console.warn(`[layer-renderer] Layer not found: ${layerType}`)
    return null
  }

  // Remove existing sprite for this item if present
  removeItemSprite(item.id)

  const sprite = createItemSprite(item)
  sprite.zIndex = item.displayOrder
  container.addChild(sprite)
  itemSpriteMap.set(item.id, sprite)

  return sprite
}

/**
 * Remove and destroy the sprite for a given item ID.
 */
export function removeItemSprite(itemId: string): void {
  const sprite = itemSpriteMap.get(itemId)
  if (sprite) {
    if (sprite.parent) {
      sprite.parent.removeChild(sprite)
    }
    sprite.destroy({ texture: true })
    itemSpriteMap.delete(itemId)
  }
}

/**
 * Clear all sprites from all layers.
 */
function clearAllLayers(): void {
  for (const [id, sprite] of itemSpriteMap) {
    sprite.destroy({ texture: true })
  }
  itemSpriteMap.clear()

  if (backgroundContainer) backgroundContainer.removeChildren()
  if (characterContainer) characterContainer.removeChildren()
  if (bubbleContainer) bubbleContainer.removeChildren()
}

// ---- Store Subscription ----

let _storeUnsubscribe: (() => void) | null = null

/**
 * Start subscribing to Store changes and automatically sync layers.
 * Should be called once after the canvas is initialized.
 */
export function startStoreSubscription(): void {
  if (_storeUnsubscribe) return

  // Initialize containers before first sync
  if (!backgroundContainer) {
    createLayerContainers()
  }

  _storeUnsubscribe = useEditorStore.subscribe((state, prevState) => {
    // Only sync when project or currentPageIndex changes
    if (state.project !== prevState.project || state.currentPageIndex !== prevState.currentPageIndex) {
      syncLayersFromStore()
    }
  })

  // Initial sync
  syncLayersFromStore()
}

/**
 * Stop the store subscription.
 */
export function stopStoreSubscription(): void {
  if (_storeUnsubscribe) {
    _storeUnsubscribe()
    _storeUnsubscribe = null
  }
}

// Lazy reference to the app for texture generation in placeholder
let app: import('pixi.js').Application | null = null

export function setLayerRendererApp(appInstance: import('pixi.js').Application): void {
  app = appInstance
}
