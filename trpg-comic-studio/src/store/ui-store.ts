import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { LayerType } from '../core/types'

// ---- UI 状态（面板、布局、视口） ----

export interface UIState {
  /** Log 面板是否打开（右侧 30% 分屏） */
  isLogPanelOpen: boolean

  /** 工具栏中当前活动图层标签 */
  activeLayer: LayerType

  /** 画布缩放级别（1.0 = 100%） */
  canvasZoom: number

  /** 画布平移偏移量 */
  canvasPanX: number
  canvasPanY: number

  // 操作
  toggleLogPanel: () => void
  setActiveLayer: (layer: LayerType) => void
  setCanvasZoom: (zoom: number) => void
  setCanvasPan: (x: number, y: number) => void
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    isLogPanelOpen: false,
    activeLayer: 'character',
    canvasZoom: 1.0,
    canvasPanX: 0,
    canvasPanY: 0,

    toggleLogPanel: () =>
      set((state) => {
        state.isLogPanelOpen = !state.isLogPanelOpen
      }),

    setActiveLayer: (layer) =>
      set((state) => {
        state.activeLayer = layer
      }),

    setCanvasZoom: (zoom) =>
      set((state) => {
        state.canvasZoom = Math.max(0.1, Math.min(5.0, zoom))
      }),

    setCanvasPan: (x, y) =>
      set((state) => {
        state.canvasPanX = x
        state.canvasPanY = y
      }),
  })),
)
