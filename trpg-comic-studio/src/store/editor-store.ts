import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Project, Page, LayerType, CanvasItem, EffectTrack } from '../core/types'

// ---- Editor State (the heart of the application) ----

export interface EditorState {
  /** Currently loaded project. null if no project open. */
  project: Project | null

  /** Currently active page index */
  currentPageIndex: number

  /** Currently active layer for new item placement */
  activeLayer: LayerType

  /** Selected item ID on the canvas */
  selectedItemId: string | null

  /** Current playback time in ms (relative to page start) */
  currentTimeMs: number

  /** Is the preview currently playing? */
  isPlaying: boolean

  // Actions
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
