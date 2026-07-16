import { Container, Graphics, Sprite, FederatedPointerEvent } from 'pixi.js'
import { getStageContainer } from './canvas-app'
import { getLayerContainer } from './layer-renderer'
import { useEditorStore } from '../store/editor-store'

// ---- Types ----

interface HandleDef {
  id: string
  type: 'corner' | 'edge' | 'rotate'
  /** Relative position to the item (0..1) */
  relX: number
  relY: number
  cursor: string
}

const HANDLES: HandleDef[] = [
  // Corners
  { id: 'tl', type: 'corner', relX: 0, relY: 0, cursor: 'nwse-resize' },
  { id: 'tr', type: 'corner', relX: 1, relY: 0, cursor: 'nesw-resize' },
  { id: 'bl', type: 'corner', relX: 0, relY: 1, cursor: 'nesw-resize' },
  { id: 'br', type: 'corner', relX: 1, relY: 1, cursor: 'nwse-resize' },
  // Edge midpoints
  { id: 'mt', type: 'edge', relX: 0.5, relY: 0, cursor: 'ns-resize' },
  { id: 'mb', type: 'edge', relX: 0.5, relY: 1, cursor: 'ns-resize' },
  { id: 'ml', type: 'edge', relX: 0, relY: 0.5, cursor: 'ew-resize' },
  { id: 'mr', type: 'edge', relX: 1, relY: 0.5, cursor: 'ew-resize' },
  // Rotation
  { id: 'rot', type: 'rotate', relX: 0.5, relY: -0.15, cursor: 'grab' },
]

const HANDLE_SIZE = 10
const HANDLE_HALF = HANDLE_SIZE / 2

// ---- State ----

let highlightGraphics: Graphics | null = null
let handleGraphics: Map<string, Graphics> = new Map()

let dragState: {
  type: 'move' | 'resize' | 'rotate' | null
  itemId: string | null
  handleId: string | null
  startPointer: { x: number; y: number }
  startTransform: {
    x: number; y: number; width: number; height: number; rotation: number
  }
} = {
  type: null,
  itemId: null,
  handleId: null,
  startPointer: { x: 0, y: 0 },
  startTransform: { x: 0, y: 0, width: 0, height: 0, rotation: 0 },
}

// ---- Init ----

/**
 * Initialize item interaction on all layer containers.
 */
export function initItemInteraction(): void {
  const charLayer = getLayerContainer('character')
  const bubbleLayer = getLayerContainer('bubble')

  if (!charLayer || !bubbleLayer) {
    console.warn('[item-interaction] Layer containers not ready, will retry on first sync')
    return
  }

  // Listen for pointerdown on layer containers (event delegation)
  charLayer.eventMode = 'static'
  charLayer.on('pointerdown', onLayerPointerDown)

  bubbleLayer.eventMode = 'static'
  bubbleLayer.on('pointerdown', onLayerPointerDown)

  // Create highlight overlay on stage
  const stage = getStageContainer()
  if (stage && !highlightGraphics) {
    highlightGraphics = new Graphics()
    highlightGraphics.label = 'selection-highlight'
    stage.addChild(highlightGraphics)
  }

  // Listen to store for selection changes
  useEditorStore.subscribe((state, prevState) => {
    if (state.selectedItemId !== prevState.selectedItemId) {
      updateHighlight()
    }
  })
}

// ---- Selection Highlight ----

/**
 * Convert screen coordinates to world coordinates accounting for stage transform.
 */
function screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
  const stage = getStageContainer()
  if (!stage) return { x: screenX, y: screenY }

  return {
    x: (screenX - stage.position.x) / stage.scale.x,
    y: (screenY - stage.position.y) / stage.scale.y,
  }
}

/**
 * Find the topmost sprite at a given screen position within a layer container.
 */
function hitTestSprite(container: Container, screenX: number, screenY: number): Sprite | null {
  const world = screenToWorld(screenX, screenY)

  // Iterate children from top to bottom
  for (let i = container.children.length - 1; i >= 0; i--) {
    const child = container.children[i]
    if (!(child instanceof Sprite)) continue

    const bounds = child.getBounds()
    if (
      world.x >= bounds.x &&
      world.x <= bounds.x + bounds.width &&
      world.y >= bounds.y &&
      world.y <= bounds.y + bounds.height
    ) {
      return child
    }
  }

  return null
}

/**
 * Handle pointerdown on a layer container (event delegation).
 */
function onLayerPointerDown(event: FederatedPointerEvent): void {
  const container = event.currentTarget as Container
  const screenX = event.globalX
  const screenY = event.globalY

  // Hit test items in this container
  const hit = hitTestSprite(container, screenX, screenY)

  if (hit) {
    // Check if we hit a handle in the currently selected item
    if (hit.label === useEditorStore.getState().selectedItemId) {
      const handleId = hitTestHandle(screenX, screenY, hit)
      if (handleId) {
        startHandleDrag(handleId, hit, event)
        return
      }
    }

    // Select the item
    useEditorStore.getState().selectItem(hit.label)
    startMoveDrag(hit, event)
    return
  }

  // Clicked empty area → deselect
  useEditorStore.getState().selectItem(null)
}

/**
 * Start a move drag operation.
 */
function startMoveDrag(sprite: Sprite, event: FederatedPointerEvent): void {
  const item = findItemById(sprite.label)
  if (!item) return

  dragState = {
    type: 'move',
    itemId: sprite.label,
    handleId: null,
    startPointer: { x: event.globalX, y: event.globalY },
    startTransform: {
      x: item.baseTransform.x,
      y: item.baseTransform.y,
      width: item.baseTransform.width,
      height: item.baseTransform.height,
      rotation: item.baseTransform.rotation,
    },
  }

  const stage = getStageContainer()
  stage?.on('pointermove', onDragMove)
  stage?.on('pointerup', onDragEnd)
  stage?.on('pointerupoutside', onDragEnd)
}

/**
 * Start a handle drag operation.
 */
function startHandleDrag(handleId: string, sprite: Sprite, event: FederatedPointerEvent): void {
  const item = findItemById(sprite.label)
  if (!item) return

  const handle = HANDLES.find((h) => h.id === handleId)
  if (!handle) return

  dragState = {
    type: handle.type === 'rotate' ? 'rotate' : 'resize',
    itemId: sprite.label,
    handleId,
    startPointer: { x: event.globalX, y: event.globalY },
    startTransform: {
      x: item.baseTransform.x,
      y: item.baseTransform.y,
      width: item.baseTransform.width,
      height: item.baseTransform.height,
      rotation: item.baseTransform.rotation,
    },
  }

  const stage = getStageContainer()
  stage?.on('pointermove', onDragMove)
  stage?.on('pointerup', onDragEnd)
  stage?.on('pointerupoutside', onDragEnd)
}

/**
 * Handle pointer move during drag.
 */
function onDragMove(event: FederatedPointerEvent): void {
  if (!dragState.type || !dragState.itemId) return

  const dx = event.globalX - dragState.startPointer.x
  const dy = event.globalY - dragState.startPointer.y

  if (dragState.type === 'move') {
    const item = findItemById(dragState.itemId)
    const sprite = findSpriteById(dragState.itemId)
    if (!item || !sprite) return

    const newX = dragState.startTransform.x + dx
    const newY = dragState.startTransform.y + dy

    // Update sprite position (visual feedback)
    sprite.x = newX
    sprite.y = newY

    // Store the pending position
    _pendingTransform = { x: newX, y: newY }
  }

  if (dragState.type === 'resize') {
    const sprite = findSpriteById(dragState.itemId)
    if (!sprite) return

    const scaleFactor = 1 // Can be adjusted for precision
    const newWidth = Math.max(10, dragState.startTransform.width + dx * scaleFactor)
    const newHeight = Math.max(10, dragState.startTransform.height + dy * scaleFactor)

    sprite.width = newWidth
    sprite.height = newHeight

    _pendingTransform = { width: newWidth, height: newHeight }
  }

  if (dragState.type === 'rotate') {
    const sprite = findSpriteById(dragState.itemId)
    if (!sprite) return

    const centerX = sprite.x + sprite.width / 2
    const centerY = sprite.y + sprite.height / 2

    const startAngle = Math.atan2(
      dragState.startPointer.y - centerY,
      dragState.startPointer.x - centerX,
    )
    const currentAngle = Math.atan2(
      event.globalY - centerY,
      event.globalX - centerX,
    )

    const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI)
    const newRotation = dragState.startTransform.rotation + deltaAngle

    sprite.rotation = (newRotation * Math.PI) / 180

    _pendingTransform = { rotation: newRotation }
  }

  updateHighlight()
}

let _pendingTransform: Record<string, number> = {}

/**
 * Handle pointer up — commit the transform to the Store.
 */
function onDragEnd(): void {
  const stage = getStageContainer()
  stage?.off('pointermove', onDragMove)
  stage?.off('pointerup', onDragEnd)
  stage?.off('pointerupoutside', onDragEnd)

  if (!dragState.type || !dragState.itemId) return

  if (Object.keys(_pendingTransform).length > 0) {
    const state = useEditorStore.getState()
    const project = state.project
    if (!project) return

    // Find page and layer containing this item
    const pageIndex = state.currentPageIndex
    for (const layerType of ['background', 'character', 'bubble'] as const) {
      const items = project.pages[pageIndex].layers[layerType].items
      if (items.some((i) => i.id === dragState.itemId)) {
        state.updateItemTransform(pageIndex, layerType, dragState.itemId, _pendingTransform)
        break
      }
    }
  }

  dragState.type = null
  dragState.itemId = null
  dragState.handleId = null
  _pendingTransform = {}
}

// ---- Handle Hit Testing ----

function hitTestHandle(screenX: number, screenY: number, sprite: Sprite): string | null {
  const world = screenToWorld(screenX, screenY)

  for (const handle of HANDLES) {
    // Handle center position in world space
    const hx = sprite.x + handle.relX * sprite.width
    const hy = sprite.y + handle.relY * sprite.height

    if (
      world.x >= hx - HANDLE_HALF &&
      world.x <= hx + HANDLE_HALF &&
      world.y >= hy - HANDLE_HALF &&
      world.y <= hy + HANDLE_HALF
    ) {
      return handle.id
    }
  }

  return null
}

// ---- Highlight Rendering ----

function updateHighlight(): void {
  if (!highlightGraphics) return

  highlightGraphics.clear()

  const selectedId = useEditorStore.getState().selectedItemId
  if (!selectedId) {
    // Also clear handles
    clearHandles()
    return
  }

  const sprite = findSpriteById(selectedId)
  if (!sprite) {
    clearHandles()
    return
  }

  // Draw dashed selection border
  const x = sprite.x
  const y = sprite.y
  const w = sprite.width
  const h = sprite.height

  // Blue selection border
  highlightGraphics.rect(x, y, w, h)
  highlightGraphics.stroke({ width: 2, color: 0x4a9eff, alpha: 0.9 })

  // Draw handles
  drawHandles(x, y, w, h)
}

function drawHandles(x: number, y: number, w: number, h: number): void {
  clearHandles()

  for (const handle of HANDLES) {
    const g = new Graphics()
    const hx = x + handle.relX * w
    const hy = y + handle.relY * h

    if (handle.type === 'rotate') {
      // Circle handle
      g.circle(hx, hy, HANDLE_HALF + 2)
      g.fill({ color: 0x4a9eff, alpha: 0.8 })
      g.stroke({ width: 1, color: 0xffffff })
    } else {
      // Square handle
      g.rect(hx - HANDLE_HALF, hy - HANDLE_HALF, HANDLE_SIZE, HANDLE_SIZE)
      g.fill({ color: 0xffffff, alpha: 0.9 })
      g.stroke({ width: 1, color: 0x4a9eff })
    }

    g.label = `handle-${handle.id}`
    g.eventMode = 'static'
    g.cursor = handle.cursor

    highlightGraphics?.addChild(g)
    handleGraphics.set(handle.id, g)
  }
}

function clearHandles(): void {
  for (const g of handleGraphics.values()) {
    g.destroy()
  }
  handleGraphics.clear()
}

// ---- Helpers ----

function findItemById(itemId: string) {
  const state = useEditorStore.getState()
  const project = state.project
  if (!project) return null

  const pageIndex = state.currentPageIndex
  for (const layerType of ['background', 'character', 'bubble'] as const) {
    const item = project.pages[pageIndex].layers[layerType].items.find((i) => i.id === itemId)
    if (item) return item
  }
  return null
}

function findSpriteById(itemId: string): Sprite | null {
  for (const layerType of ['background', 'character', 'bubble']) {
    const container = getLayerContainer(layerType)
    if (!container) continue
    for (const child of container.children) {
      if (child instanceof Sprite && child.label === itemId) {
        return child
      }
    }
  }
  return null
}
