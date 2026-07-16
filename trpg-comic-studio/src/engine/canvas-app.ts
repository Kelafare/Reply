import { Application, Container } from 'pixi.js'
import { setLayerRendererApp, createLayerContainers, startStoreSubscription } from './layer-renderer'
import { initItemInteraction } from './item-interaction'

let app: Application | null = null
let _stageContainer: Container | null = null

/** 递增的初始化序号，用于防止 Strict Mode 双重挂载导致的竞态 */
let initId = 0

/**
 * 初始化 PixiJS Application 并挂载到指定 DOM 容器。
 * 返回 Application 实例。
 */
export async function initCanvasApp(container: HTMLElement): Promise<Application> {
  const myInitId = ++initId

  // 销毁旧实例（如果有）
  if (app) {
    console.warn('[画布应用] 旧实例存在，先销毁')
    destroyCanvasApp()
  }

  // 确保容器有非零尺寸，否则使用兜底值
  const width = container.clientWidth || 800
  const height = container.clientHeight || 600

  if (container.clientWidth === 0 || container.clientHeight === 0) {
    console.warn(`[画布应用] 容器尺寸为零，使用兜底尺寸：${width}×${height}`)
  }

  const newApp = new Application()

  try {
    await newApp.init({
      width,
      height,
      background: 0x11111b,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })
  } catch (err) {
    console.error('[画布应用] 初始化失败：', err)
    // 显示视觉错误提示
    container.style.backgroundColor = '#11111b'
    const errorEl = container.querySelector('#canvas-error-msg') as HTMLElement | null
    if (errorEl) {
      errorEl.style.display = 'flex'
    }
    throw err
  }

  // 如果初始化期间有更新的调用启动，丢弃当前结果
  if (myInitId !== initId) {
    newApp.destroy(true, { children: true, texture: true })
    console.log('[画布应用] 初始化被取消（已有新实例接管）')
    if (!app) {
      throw new Error('初始化被取消且无有效实例')
    }
    return app
  }

  app = newApp
  container.appendChild(app.canvas)

  console.log(`[画布应用] 画布初始化成功：${width}×${height}`)

  // 创建舞台根容器用于图层分组
  _stageContainer = new Container()
  _stageContainer.label = 'stage-root'
  app.stage.addChild(_stageContainer)

  // 连接图层渲染器和交互系统
  setLayerRendererApp(app)
  createLayerContainers()
  startStoreSubscription()
  initItemInteraction()

  // 处理 WebGL 上下文丢失
  const canvas = app.canvas as HTMLCanvasElement
  canvas.addEventListener('webglcontextlost', (event) => {
    console.warn('[画布应用] WebGL 上下文丢失', event)
  })

  canvas.addEventListener('webglcontextrestored', () => {
    console.log('[画布应用] WebGL 上下文已恢复，重新渲染')
  })

  return app
}

/**
 * 获取当前 PixiJS Application 实例（未初始化时返回 null）。
 */
export function getCanvasApp(): Application | null {
  return app
}

/**
 * 获取舞台根容器，用于图层分组。
 */
export function getStageContainer(): Container | null {
  return _stageContainer
}

/**
 * 调整 PixiJS 渲染器尺寸以匹配容器尺寸。
 * 在窗口大小变化时调用。
 */
export function resizeCanvas(): void {
  if (!app) return
  const parent = app.canvas.parentElement
  if (parent) {
    app.renderer.resize(parent.clientWidth, parent.clientHeight)
  }
}

/**
 * 销毁 PixiJS Application，释放 WebGL 上下文并移除 canvas 元素。
 */
export function destroyCanvasApp(): void {
  if (app) {
    // 从 DOM 中移除 canvas
    const canvas = app.canvas as HTMLCanvasElement
    if (canvas.parentElement) {
      canvas.parentElement.removeChild(canvas)
    }

    // 递归销毁所有舞台子元素
    app.stage.removeFromParent()
    app.destroy(true, { children: true, texture: true })
  }

  // 始终重置状态（即使 app 为 null，确保清理干净）
  app = null
  _stageContainer = null
}
