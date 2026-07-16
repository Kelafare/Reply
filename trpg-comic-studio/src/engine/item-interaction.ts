import { Container, Graphics, Sprite, FederatedPointerEvent } from 'pixi.js'
import { getStageContainer } from './canvas-app'
import { getLayerContainer } from './layer-renderer'
import { useEditorStore } from '../store/editor-store'

// ---- 类型 ----

/** 交互手柄定义 */
interface HandleDef {
  id: string
  type: 'corner' | 'edge' | 'rotate'
  /** 相对于元素的归一化位置（0..1） */
  relX: number
  relY: number
  cursor: string
}

/** 八个缩放手柄 + 一个旋转手柄 */
const HANDLES: HandleDef[] = [
  // 四角
  { id: 'tl', type: 'corner', relX: 0, relY: 0, cursor: 'nwse-resize' },
  { id: 'tr', type: 'corner', relX: 1, relY: 0, cursor: 'nesw-resize' },
  { id: 'bl', type: 'corner', relX: 0, relY: 1, cursor: 'nesw-resize' },
  { id: 'br', type: 'corner', relX: 1, relY: 1, cursor: 'nwse-resize' },
  // 四边中点
  { id: 'mt', type: 'edge', relX: 0.5, relY: 0, cursor: 'ns-resize' },
  { id: 'mb', type: 'edge', relX: 0.5, relY: 1, cursor: 'ns-resize' },
  { id: 'ml', type: 'edge', relX: 0, relY: 0.5, cursor: 'ew-resize' },
  { id: 'mr', type: 'edge', relX: 1, relY: 0.5, cursor: 'ew-resize' },
  // 旋转手柄（顶部居中偏上）
  { id: 'rot', type: 'rotate', relX: 0.5, relY: -0.15, cursor: 'grab' },
]

const HANDLE_SIZE = 10
const HANDLE_HALF = HANDLE_SIZE / 2

// ---- 状态 ----

let highlightGraphics: Graphics | null = null
let handleGraphics: Map<string, Graphics> = new Map()

/** 拖拽状态机 */
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

// ---- 初始化 ----

/**
 * 在所有图层容器上初始化元素交互。
 */
export function initItemInteraction(): void {
  const charLayer = getLayerContainer('character')
  const bubbleLayer = getLayerContainer('bubble')

  if (!charLayer || !bubbleLayer) {
    console.warn('[元素交互] 图层容器未就绪，将在首次同步时重试')
    return
  }

  // 在图层容器上监听 pointerdown（事件委托）
  charLayer.eventMode = 'static'
  charLayer.on('pointerdown', onLayerPointerDown)

  bubbleLayer.eventMode = 'static'
  bubbleLayer.on('pointerdown', onLayerPointerDown)

  // 在舞台上创建选中高亮覆盖层
  const stage = getStageContainer()
  if (stage && !highlightGraphics) {
    highlightGraphics = new Graphics()
    highlightGraphics.label = 'selection-highlight'
    stage.addChild(highlightGraphics)
  }

  // 监听 Store 中的选中变化
  useEditorStore.subscribe((state, prevState) => {
    if (state.selectedItemId !== prevState.selectedItemId) {
      updateHighlight()
    }
  })
}

// ---- 选中高亮 ----

/**
 * 将屏幕坐标转换为世界坐标（考虑舞台的缩放和平移）。
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
 * 在图层容器内查找给定屏幕位置最上层的 Sprite。
 */
function hitTestSprite(container: Container, screenX: number, screenY: number): Sprite | null {
  const world = screenToWorld(screenX, screenY)

  // 从上层向下遍历
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
 * 处理图层容器上的 pointerdown 事件（事件委托模式）。
 */
function onLayerPointerDown(event: FederatedPointerEvent): void {
  const container = event.currentTarget as Container
  const screenX = event.globalX
  const screenY = event.globalY

  // 在该容器内做命中检测
  const hit = hitTestSprite(container, screenX, screenY)

  if (hit) {
    // 检查是否命中了当前选中元素的手柄
    if (hit.label === useEditorStore.getState().selectedItemId) {
      const handleId = hitTestHandle(screenX, screenY, hit)
      if (handleId) {
        startHandleDrag(handleId, hit, event)
        return
      }
    }

    // 选中该元素
    useEditorStore.getState().selectItem(hit.label)
    startMoveDrag(hit, event)
    return
  }

  // 点击空白区域 → 取消选中
  useEditorStore.getState().selectItem(null)
}

/**
 * 开始移动拖拽。
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
 * 开始手柄拖拽。
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
 * 处理拖拽过程中的指针移动。
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

    // 更新 Sprite 位置（视觉反馈）
    sprite.x = newX
    sprite.y = newY

    // 暂存待提交的位置
    _pendingTransform = { x: newX, y: newY }
  }

  if (dragState.type === 'resize') {
    const sprite = findSpriteById(dragState.itemId)
    if (!sprite) return

    const newWidth = Math.max(10, dragState.startTransform.width + dx)
    const newHeight = Math.max(10, dragState.startTransform.height + dy)

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

/** 待提交的变换数据 */
let _pendingTransform: Record<string, number> = {}

/**
 * 处理指针释放——将变换提交到 Store。
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

    // 查找包含此元素的页面和图层
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

// ---- 手柄命中检测 ----

/** 检测给定屏幕位置是否命中某个手柄 */
function hitTestHandle(screenX: number, screenY: number, sprite: Sprite): string | null {
  const world = screenToWorld(screenX, screenY)

  for (const handle of HANDLES) {
    // 手柄在世界空间中的中心位置
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

// ---- 高亮渲染 ----

/** 更新选中高亮和手柄图形 */
function updateHighlight(): void {
  if (!highlightGraphics) return

  highlightGraphics.clear()

  const selectedId = useEditorStore.getState().selectedItemId
  if (!selectedId) {
    clearHandles()
    return
  }

  const sprite = findSpriteById(selectedId)
  if (!sprite) {
    clearHandles()
    return
  }

  // 绘制蓝色选中边框
  const x = sprite.x
  const y = sprite.y
  const w = sprite.width
  const h = sprite.height

  highlightGraphics.rect(x, y, w, h)
  highlightGraphics.stroke({ width: 2, color: 0x4a9eff, alpha: 0.9 })

  // 绘制交互手柄
  drawHandles(x, y, w, h)
}

/** 绘制选中元素的交互手柄 */
function drawHandles(x: number, y: number, w: number, h: number): void {
  clearHandles()

  for (const handle of HANDLES) {
    const g = new Graphics()
    const hx = x + handle.relX * w
    const hy = y + handle.relY * h

    if (handle.type === 'rotate') {
      // 圆形旋转手柄
      g.circle(hx, hy, HANDLE_HALF + 2)
      g.fill({ color: 0x4a9eff, alpha: 0.8 })
      g.stroke({ width: 1, color: 0xffffff })
    } else {
      // 方形缩放手柄
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

/** 清除所有手柄图形 */
function clearHandles(): void {
  for (const g of handleGraphics.values()) {
    g.destroy()
  }
  handleGraphics.clear()
}

// ---- 辅助函数 ----

/** 根据 ID 在 Store 中查找 CanvasItem */
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

/** 在所有图层中查找指定 ID 的 Sprite */
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
