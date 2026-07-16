import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Project, Page, LayerType, CanvasItem, EffectTrack } from '../core/types'

// ---- 编辑器状态（应用的核心） ----

export interface EditorState {
  /** 当前加载的项目。null 表示没有打开项目。 */
  project: Project | null

  /** 当前活动页面索引 */
  currentPageIndex: number

  /** 当前用于新建元素的活动图层 */
  activeLayer: LayerType

  /** 画布上选中的元素 ID */
  selectedItemId: string | null

  /** 当前播放时间（毫秒，相对于页面起始） */
  currentTimeMs: number

  /** 预览是否正在播放 */
  isPlaying: boolean

  // 操作
  setProject: (project: Project) => void
  setCurrentPage: (index: number) => void
  setActiveLayer: (layer: LayerType) => void
  selectItem: (itemId: string | null) => void

  addItem: (pageIndex: number, layer: LayerType, item: CanvasItem) => void
  updateItemTransform: (
    pageIndex: number,
    layer: LayerType,
    itemId: string,
    transform: Partial<CanvasItem['baseTransform']>,
  ) => void
  removeItem: (pageIndex: number, layer: LayerType, itemId: string) => void

  addEffectTrack: (
    pageIndex: number,
    layer: LayerType,
    itemId: string,
    track: EffectTrack,
  ) => void
  updateEffectTrack: (
    pageIndex: number,
    layer: LayerType,
    itemId: string,
    trackIndex: number,
    updates: Partial<EffectTrack>,
  ) => void
  removeEffectTrack: (
    pageIndex: number,
    layer: LayerType,
    itemId: string,
    trackIndex: number,
  ) => void

  setCurrentTime: (timeMs: number) => void
  setPlaying: (playing: boolean) => void
}

export const useEditorStore = create<EditorState>()(
  immer((set) => ({
    project: null,
    currentPageIndex: 0,
    activeLayer: 'character',
    selectedItemId: null,
    currentTimeMs: 0,
    isPlaying: false,

    setProject: (project) =>
      set((state) => {
        state.project = project as typeof state.project
        state.currentPageIndex = 0
        state.selectedItemId = null
      }),

    setCurrentPage: (index) =>
      set((state) => {
        state.currentPageIndex = index
        state.currentTimeMs = 0
      }),

    setActiveLayer: (layer) =>
      set((state) => {
        state.activeLayer = layer
      }),

    selectItem: (itemId) =>
      set((state) => {
        state.selectedItemId = itemId
      }),

    addItem: (pageIndex, layerType, item) =>
      set((state) => {
        if (!state.project) return
        state.project.pages[pageIndex].layers[layerType].items.push(item)
      }),

    updateItemTransform: (pageIndex, layerType, itemId, transform) =>
      set((state) => {
        if (!state.project) return
        const items = state.project.pages[pageIndex].layers[layerType].items
        const idx = items.findIndex((i) => i.id === itemId)
        if (idx === -1) return
        Object.assign(items[idx].baseTransform, transform)
      }),

    removeItem: (pageIndex, layerType, itemId) =>
      set((state) => {
        if (!state.project) return
        const layer = state.project.pages[pageIndex].layers[layerType]
        layer.items = layer.items.filter((i) => i.id !== itemId)
        if (state.selectedItemId === itemId) {
          state.selectedItemId = null
        }
      }),

    addEffectTrack: (pageIndex, layerType, itemId, track) =>
      set((state) => {
        if (!state.project) return
        const items = state.project.pages[pageIndex].layers[layerType].items
        const idx = items.findIndex((i) => i.id === itemId)
        if (idx === -1) return
        items[idx].timeline.push(track)
      }),

    updateEffectTrack: (pageIndex, layerType, itemId, trackIndex, updates) =>
      set((state) => {
        if (!state.project) return
        const items = state.project.pages[pageIndex].layers[layerType].items
        const itemIdx = items.findIndex((i) => i.id === itemId)
        if (itemIdx === -1) return
        const timeline = items[itemIdx].timeline
        if (trackIndex >= timeline.length) return
        Object.assign(timeline[trackIndex], updates)
      }),

    removeEffectTrack: (pageIndex, layerType, itemId, trackIndex) =>
      set((state) => {
        if (!state.project) return
        const items = state.project.pages[pageIndex].layers[layerType].items
        const itemIdx = items.findIndex((i) => i.id === itemId)
        if (itemIdx === -1) return
        items[itemIdx].timeline = items[itemIdx].timeline.filter((_, i) => i !== trackIndex)
      }),

    setCurrentTime: (timeMs) =>
      set((state) => {
        state.currentTimeMs = timeMs
      }),

    setPlaying: (playing) =>
      set((state) => {
        state.isPlaying = playing
      }),
  })),
)
