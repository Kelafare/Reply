import { getStageContainer } from './canvas-app'
import { useUIStore } from '../store/ui-store'

// ---- State ----

let isPanning = false
let isSpaceHeld = false
let panStart = { x: 0, y: 0 }
let stagePosAtPanStart = { x: 0, y: 0 }

// ---- Public API ----

/**
 * Register viewport control event listeners on the canvas view.
 * Must be called after initCanvasApp.
 */
export function registerViewportControls(view: HTMLElement): void {
  // Wheel zoom (Ctrl+Wheel)
  view.addEventListener('wheel', handleWheel, { passive: false })

  // Keyboard: Space for pan mode
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  // Pan via pointer events on the view
  view.addEventListener('pointerdown', handlePointerDown)
  view.addEventListener('pointermove', handlePointerMove)
  view.addEventListener('pointerup', handlePointerUp)
  view.addEventListener('pointerleave', handlePointerUp)
}

/**
 * Unregister viewport event listeners.
 */
export function unregisterViewportControls(view: HTMLElement): void {
  view.removeEventListener('wheel', handleWheel)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  view.removeEventListener('pointerdown', handlePointerDown)
  view.removeEventListener('pointermove', handlePointerMove)
  view.removeEventListener('pointerup', handlePointerUp)
  view.removeEventListener('pointerleave', handlePointerUp)
}

/**
 * Reset the viewport to default (scale 1.0, centered).
 */
export function resetViewport(): void {
  const stage = getStageContainer()
  if (!stage) return

  stage.scale.set(1.0)
  stage.position.set(0, 0)

  // Sync to UI Store
  const uiStore = useUIStore.getState()
  uiStore.setCanvasZoom(1.0)
  uiStore.setCanvasPan(0, 0)
}

// ---- Event Handlers ----

function handleWheel(event: WheelEvent): void {
  // Only zoom with Ctrl held
  if (!event.ctrlKey && !event.metaKey) return

  event.preventDefault()

  const stage = getStageContainer()
  if (!stage) return

  const direction = event.deltaY < 0 ? 1 : -1
  const factor = direction > 0 ? 1.1 : 0.9
  const newZoom = Math.max(0.1, Math.min(5.0, stage.scale.x * factor))

  // Get mouse position relative to the view
  const rect = (event.currentTarget as HTMLElement)?.getBoundingClientRect()
  if (!rect) return

  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  // Calculate new position to zoom centered on cursor
  const worldPos = {
    x: (mouseX - stage.position.x) / stage.scale.x,
    y: (mouseY - stage.position.y) / stage.scale.y,
  }

  stage.scale.set(newZoom)

  stage.position.set(
    mouseX - worldPos.x * newZoom,
    mouseY - worldPos.y * newZoom,
  )

  // Sync to UI Store
  const uiStore = useUIStore.getState()
  uiStore.setCanvasZoom(newZoom)
  uiStore.setCanvasPan(stage.position.x, stage.position.y)
}

function handleKeyDown(event: KeyboardEvent): void {
  // Space for pan mode
  if (event.code === 'Space' && !event.repeat) {
    event.preventDefault()
    isSpaceHeld = true
  }

  // Ctrl+0 to reset viewport
  if ((event.ctrlKey || event.metaKey) && event.code === 'Digit0') {
    event.preventDefault()
    resetViewport()
  }
}

function handleKeyUp(event: KeyboardEvent): void {
  if (event.code === 'Space') {
    isSpaceHeld = false
    if (isPanning) {
      endPan()
    }
  }
}

function handlePointerDown(event: PointerEvent): void {
  if (!isSpaceHeld) return

  const stage = getStageContainer()
  if (!stage) return

  isPanning = true
  panStart = { x: event.clientX, y: event.clientY }
  stagePosAtPanStart = { x: stage.position.x, y: stage.position.y }

  // Set cursor
  const view = event.currentTarget as HTMLElement
  if (view) {
    view.style.cursor = 'grabbing'
  }

  event.preventDefault()
}

function handlePointerMove(event: PointerEvent): void {
  if (!isPanning) {
    // Update cursor based on Space state
    if (isSpaceHeld) {
      const view = event.currentTarget as HTMLElement
      if (view) {
        view.style.cursor = 'grab'
      }
    }
    return
  }

  const stage = getStageContainer()
  if (!stage) return

  const dx = event.clientX - panStart.x
  const dy = event.clientY - panStart.y

  stage.position.set(
    stagePosAtPanStart.x + dx,
    stagePosAtPanStart.y + dy,
  )

  // Sync to UI Store
  const uiStore = useUIStore.getState()
  uiStore.setCanvasPan(stage.position.x, stage.position.y)
}

function handlePointerUp(event: PointerEvent): void {
  if (isPanning) {
    endPan()
  }
}

function endPan(): void {
  isPanning = false

  // Restore default cursor (Space may still be held)
  if (!isSpaceHeld) {
    // Find the view element and reset cursor
    const stage = getStageContainer()
    if (stage && stage.parent) {
      // The canvas element is owned by the Application
    }
  }
}
