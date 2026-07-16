import { Application, Container } from 'pixi.js'
import { setLayerRendererApp, createLayerContainers, startStoreSubscription } from './layer-renderer'
import { initItemInteraction } from './item-interaction'

let app: Application | null = null
let _stageContainer: Container | null = null

/**
 * Initialize the PixiJS Application and mount it to the given DOM container.
 * Returns the Application instance.
 */
export async function initCanvasApp(container: HTMLElement): Promise<Application> {
  if (app) {
    console.warn('[canvas-app] PixiJS Application already initialized, destroying old instance')
    destroyCanvasApp()
  }

  app = new Application()

  await app.init({
    resizeTo: container,
    background: 0x11111b,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })

  container.appendChild(app.canvas)

  // Stage container wrapper for layer grouping
  _stageContainer = new Container()
  _stageContainer.label = 'stage-root'
  app.stage.addChild(_stageContainer)

  // Wire up layer renderer and interaction
  setLayerRendererApp(app)
  createLayerContainers()
  startStoreSubscription()
  initItemInteraction()

  // Handle WebGL context loss
  const canvas = app.canvas as HTMLCanvasElement
  canvas.addEventListener('webglcontextlost', (event) => {
    console.warn('[canvas-app] WebGL context lost', event)
  })

  canvas.addEventListener('webglcontextrestored', () => {
    console.log('[canvas-app] WebGL context restored, re-render triggered')
  })

  return app
}

/**
 * Get the current PixiJS Application instance (may be null if not initialized).
 */
export function getCanvasApp(): Application | null {
  return app
}

/**
 * Get the root stage container for layer grouping.
 */
export function getStageContainer(): Container | null {
  return _stageContainer
}

/**
 * Resize the PixiJS renderer to match the container dimensions.
 * Called on window resize.
 */
export function resizeCanvas(): void {
  if (!app) return
  const parent = app.canvas.parentElement
  if (parent) {
    app.renderer.resize(parent.clientWidth, parent.clientHeight)
  }
}

/**
 * Destroy the PixiJS Application, releasing the WebGL context and removing the canvas.
 */
export function destroyCanvasApp(): void {
  if (app) {
    // Remove canvas from DOM
    const canvas = app.canvas as HTMLCanvasElement
    if (canvas.parentElement) {
      canvas.parentElement.removeChild(canvas)
    }

    // Destroy all stage children recursively
    app.stage.removeFromParent()
    app.destroy(true, { children: true, texture: true })

    app = null
    _stageContainer = null
  }
}
