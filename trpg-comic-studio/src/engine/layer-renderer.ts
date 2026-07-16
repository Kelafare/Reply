import { Container, Sprite, Texture, Graphics } from 'pixi.js'
import { getStageContainer } from './canvas-app'
import { useEditorStore } from '../store/editor-store'
import type { Project, Layer as LayerData, CanvasItem } from '../core/types'

// ---- 容器引用 ----

let backgroundContainer: Container | null = null
let characterContainer: Container | null = null
let bubbleContainer: Container | null = null

/** 元素 ID → Sprite 映射，用于高效查找 */
const itemSpriteMap = new Map<string, Sprite>()

// ---- 初始化 ----

/**
 * 创建三层图层容器并添加到舞台。
 */
export function createLayerContainers(): {
  background: Container
  character: Container
  bubble: Container
} {
  const stage = getStageContainer()
  if (!stage) {
    throw new Error('[图层渲染] 未找到舞台容器，请先调用 initCanvasApp()')
  }

  // 如果重新初始化则移除旧容器
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

  // z-order：背景（底部）→ 人物（中间）→ 气泡（顶部）
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
 * 根据类型获取图层容器。
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

// ---- Store → PixiJS 同步 ----

let prevProjectRef: Project | null = null

/**
 * 从 Store 的 Project 全量同步到 PixiJS 图层容器。
 * 在 project 发生变化时调用。
 */
export function syncLayersFromStore(): void {
  const project = useEditorStore.getState().project
  if (!project) {
    clearAllLayers()
    prevProjectRef = null
    return
  }

  // 如果容器不存在则初始化
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
 * 将单个图层数据同步到对应的 PixiJS Container。
 */
function syncLayer(layerData: LayerData, container: Container): void {
  // 同步可见性和锁定状态
  container.visible = layerData.visible
  container.eventMode = layerData.locked ? 'none' : 'static'

  // 跟踪 Store 中存在哪些元素 ID
  const storeItemIds = new Set(layerData.items.map((item) => item.id))

  // 移除不再存在于 Store 中的 Sprite
  for (const [id, sprite] of itemSpriteMap) {
    if (!storeItemIds.has(id) && sprite.parent === container) {
      container.removeChild(sprite)
      sprite.destroy({ texture: true })
      itemSpriteMap.delete(id)
    }
  }

  // 为当前元素创建或更新 Sprite
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

// ---- 元素 Sprite 管理 ----

/**
 * 为 CanvasItem 创建 PixiJS Sprite。
 * 如果图片加载失败则回退到占位矩形。
 */
function createItemSprite(item: CanvasItem): Sprite {
  let sprite: Sprite

  try {
    // 尝试从纹理缓存加载，失败则用占位图
    if (Texture.from(item.imagePath).width > 0) {
      sprite = new Sprite(Texture.from(item.imagePath))
    } else {
      sprite = createPlaceholderSprite(item)
    }
  } catch {
    console.warn(`[图层渲染] 图片加载失败：${item.imagePath}，使用占位图形`)
    sprite = createPlaceholderSprite(item)
  }

  sprite.label = item.id
  sprite.eventMode = 'static'
  sprite.cursor = 'move'

  return sprite
}

/**
 * 为缺失图片创建带交叉线的占位矩形。
 */
function createPlaceholderSprite(item: CanvasItem): Sprite {
  const graphics = new Graphics()
  const w = item.baseTransform.width || 200
  const h = item.baseTransform.height || 200

  // 填充矩形
  graphics.rect(0, 0, w, h)
  graphics.fill({ color: 0x333344 })
  graphics.stroke({ width: 2, color: 0x585b70 })

  // 交叉线表示缺失
  graphics.moveTo(0, 0)
  graphics.lineTo(w, h)
  graphics.stroke({ width: 2, color: 0x585b70 })
  graphics.moveTo(w, 0)
  graphics.lineTo(0, h)
  graphics.stroke({ width: 2, color: 0x585b70 })

  // 从 Graphics 生成纹理
  const texture = app?.renderer.generateTexture(graphics)
  const sprite = new Sprite(texture || Texture.WHITE)
  sprite.width = w
  sprite.height = h

  return sprite
}

/**
 * 将 CanvasItem 的 baseTransform 应用到 Sprite。
 */
function applyItemTransform(sprite: Sprite, item: CanvasItem): void {
  const t = item.baseTransform
  sprite.x = t.x
  sprite.y = t.y
  sprite.width = t.width
  sprite.height = t.height
  sprite.rotation = (t.rotation * Math.PI) / 180 // 角度转弧度
  sprite.alpha = t.opacity
}

/**
 * 渲染单个 CanvasItem 并将其添加到对应图层容器。
 */
export function renderItem(item: CanvasItem, layerType: string): Sprite | null {
  const container = getLayerContainer(layerType)
  if (!container) {
    console.warn(`[图层渲染] 未找到图层：${layerType}`)
    return null
  }

  // 如果已存在则先移除旧 Sprite
  removeItemSprite(item.id)

  const sprite = createItemSprite(item)
  sprite.zIndex = item.displayOrder
  container.addChild(sprite)
  itemSpriteMap.set(item.id, sprite)

  return sprite
}

/**
 * 移除并销毁指定元素 ID 的 Sprite。
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
 * 清空所有图层的所有 Sprite。
 */
function clearAllLayers(): void {
  for (const [, sprite] of itemSpriteMap) {
    sprite.destroy({ texture: true })
  }
  itemSpriteMap.clear()

  if (backgroundContainer) backgroundContainer.removeChildren()
  if (characterContainer) characterContainer.removeChildren()
  if (bubbleContainer) bubbleContainer.removeChildren()
}

// ---- Store 订阅 ----

let _storeUnsubscribe: (() => void) | null = null

/**
 * 开始订阅 Store 变化并自动同步图层。
 * 应在画布初始化后调用一次。
 */
export function startStoreSubscription(): void {
  if (_storeUnsubscribe) return

  // 首次同步前初始化容器
  if (!backgroundContainer) {
    createLayerContainers()
  }

  _storeUnsubscribe = useEditorStore.subscribe((state, prevState) => {
    // 仅在 project 或 currentPageIndex 变化时同步
    if (state.project !== prevState.project || state.currentPageIndex !== prevState.currentPageIndex) {
      syncLayersFromStore()
    }
  })

  // 初始同步
  syncLayersFromStore()
}

/**
 * 停止 Store 订阅。
 */
export function stopStoreSubscription(): void {
  if (_storeUnsubscribe) {
    _storeUnsubscribe()
    _storeUnsubscribe = null
  }
}

// 延迟引用——用于占位图形纹理生成
let app: import('pixi.js').Application | null = null

export function setLayerRendererApp(appInstance: import('pixi.js').Application): void {
  app = appInstance
}
