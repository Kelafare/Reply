import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { LayerType } from '../core/types'

// ---- UI state (panels, layout, viewport) ----

export interface UIState {
  /** Whether the Log panel is open (right side 30% split) */
  isLogPanelOpen: boolean

  /** Currently active layer tab in the toolbar */
  activeLayer: LayerType

  /** Canvas zoom level (1.0 = 100%) */
  canvasZoom: number

  /** Canvas pan offset */
  canvasPanX: number
  canvasPanY: number

  // Actions
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
