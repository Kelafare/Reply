import { getStageContainer } from './canvas-app'
import { useUIStore } from '../store/ui-store'

// ---- 状态 ----

let isPanning = false
let isSpaceHeld = false
let panStart = { x: 0, y: 0 }
let stagePosAtPanStart = { x: 0, y: 0 }

// ---- 公开 API ----

/**
 * 在画布视图上注册视口控制事件监听。
 * 必须在 initCanvasApp 之后调用。
 */
export function registerViewportControls(view: HTMLElement): void {
  // 滚轮缩放（Ctrl+滚轮）
  view.addEventListener('wheel', handleWheel, { passive: false })

  // 键盘：空格进入平移模式
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  // 在视图上的指针平移事件
  view.addEventListener('pointerdown', handlePointerDown)
  view.addEventListener('pointermove', handlePointerMove)
  view.addEventListener('pointerup', handlePointerUp)
  view.addEventListener('pointerleave', handlePointerUp)
}

/**
 * 注销视口事件监听。
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
 * 重置视口到默认状态（缩放 1.0，居中）。
 */
export function resetViewport(): void {
  const stage = getStageContainer()
  if (!stage) return

  stage.scale.set(1.0)
  stage.position.set(0, 0)

  // 同步到 UI Store
  const uiStore = useUIStore.getState()
  uiStore.setCanvasZoom(1.0)
  uiStore.setCanvasPan(0, 0)
}

// ---- 事件处理 ----

/** 处理滚轮缩放（Ctrl+滚轮） */
function handleWheel(event: WheelEvent): void {
  // 仅 Ctrl 按下时缩放
  if (!event.ctrlKey && !event.metaKey) return

  event.preventDefault()

  const stage = getStageContainer()
  if (!stage) return

  const direction = event.deltaY < 0 ? 1 : -1
  const factor = direction > 0 ? 1.1 : 0.9
  const newZoom = Math.max(0.1, Math.min(5.0, stage.scale.x * factor))

  // 获取鼠标相对于视图的位置
  const rect = (event.currentTarget as HTMLElement)?.getBoundingClientRect()
  if (!rect) return

  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  // 计算以光标为中心的新位置
  const worldPos = {
    x: (mouseX - stage.position.x) / stage.scale.x,
    y: (mouseY - stage.position.y) / stage.scale.y,
  }

  stage.scale.set(newZoom)

  stage.position.set(
    mouseX - worldPos.x * newZoom,
    mouseY - worldPos.y * newZoom,
  )

  // 同步到 UI Store
  const uiStore = useUIStore.getState()
  uiStore.setCanvasZoom(newZoom)
  uiStore.setCanvasPan(stage.position.x, stage.position.y)
}

/** 处理键盘按下 */
function handleKeyDown(event: KeyboardEvent): void {
  // 空格进入平移模式
  if (event.code === 'Space' && !event.repeat) {
    event.preventDefault()
    isSpaceHeld = true
  }

  // Ctrl+0 重置视口
  if ((event.ctrlKey || event.metaKey) && event.code === 'Digit0') {
    event.preventDefault()
    resetViewport()
  }
}

/** 处理键盘释放 */
function handleKeyUp(event: KeyboardEvent): void {
  if (event.code === 'Space') {
    isSpaceHeld = false
    if (isPanning) {
      endPan()
    }
  }
}

/** 处理指针按下——开始平移 */
function handlePointerDown(event: PointerEvent): void {
  if (!isSpaceHeld) return

  const stage = getStageContainer()
  if (!stage) return

  isPanning = true
  panStart = { x: event.clientX, y: event.clientY }
  stagePosAtPanStart = { x: stage.position.x, y: stage.position.y }

  // 设置抓取光标
  const view = event.currentTarget as HTMLElement
  if (view) {
    view.style.cursor = 'grabbing'
  }

  event.preventDefault()
}

/** 处理指针移动——执行平移 */
function handlePointerMove(event: PointerEvent): void {
  if (!isPanning) {
    // 根据空格状态更新光标
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

  // 同步到 UI Store
  const uiStore = useUIStore.getState()
  uiStore.setCanvasPan(stage.position.x, stage.position.y)
}

/** 处理指针释放——结束平移 */
function handlePointerUp(_event: PointerEvent): void {
  if (isPanning) {
    endPan()
  }
}

/** 结束平移操作 */
function endPan(): void {
  isPanning = false
}
