import { create } from 'zustand'
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

export const useEditorStore = create<EditorState>((set) => ({
  project: null,
  currentPageIndex: 0,
  activeLayer: 'character',
  selectedItemId: null,
  currentTimeMs: 0,
  isPlaying: false,

  setProject: (project) => set({ project, currentPageIndex: 0, selectedItemId: null }),

  setCurrentPage: (index) => set({ currentPageIndex: index, currentTimeMs: 0 }),

  setActiveLayer: (layer) => set({ activeLayer: layer }),

  selectItem: (itemId) => set({ selectedItemId: itemId }),

  addItem: (pageIndex, layerType, item) =>
    set((state) => {
      if (!state.project) return state
      const pages = [...state.project.pages]
      const layer = pages[pageIndex].layers[layerType]
      layer.items = [...layer.items, item]
      return { project: { ...state.project, pages } }
    }),

  updateItemTransform: (pageIndex, layerType, itemId, transform) =>
    set((state) => {
      if (!state.project) return state
      const pages = [...state.project.pages]
      const items = pages[pageIndex].layers[layerType].items
      const idx = items.findIndex((i) => i.id === itemId)
      if (idx === -1) return state
      items[idx] = { ...items[idx], baseTransform: { ...items[idx].baseTransform, ...transform } }
      return { project: { ...state.project, pages } }
    }),

  removeItem: (pageIndex, layerType, itemId) =>
    set((state) => {
      if (!state.project) return state
      const pages = [...state.project.pages]
      const layer = pages[pageIndex].layers[layerType]
      layer.items = layer.items.filter((i) => i.id !== itemId)
      return {
        project: { ...state.project, pages },
        selectedItemId: state.selectedItemId === itemId ? null : state.selectedItemId,
      }
    }),

  addEffectTrack: (pageIndex, layerType, itemId, track) =>
    set((state) => {
      if (!state.project) return state
      const pages = [...state.project.pages]
      const items = pages[pageIndex].layers[layerType].items
      const idx = items.findIndex((i) => i.id === itemId)
      if (idx === -1) return state
      items[idx] = { ...items[idx], timeline: [...items[idx].timeline, track] }
      return { project: { ...state.project, pages } }
    }),

  updateEffectTrack: (pageIndex, layerType, itemId, trackIndex, updates) =>
    set((state) => {
      if (!state.project) return state
      const pages = [...state.project.pages]
      const items = pages[pageIndex].layers[layerType].items
      const itemIdx = items.findIndex((i) => i.id === itemId)
      if (itemIdx === -1) return state
      const timeline = [...items[itemIdx].timeline]
      if (trackIndex >= timeline.length) return state
      timeline[trackIndex] = { ...timeline[trackIndex], ...updates }
      items[itemIdx] = { ...items[itemIdx], timeline }
      return { project: { ...state.project, pages } }
    }),

  removeEffectTrack: (pageIndex, layerType, itemId, trackIndex) =>
    set((state) => {
      if (!state.project) return state
      const pages = [...state.project.pages]
      const items = pages[pageIndex].layers[layerType].items
      const itemIdx = items.findIndex((i) => i.id === itemId)
      if (itemIdx === -1) return state
      items[itemIdx] = {
        ...items[itemIdx],
        timeline: items[itemIdx].timeline.filter((_, i) => i !== trackIndex),
      }
      return { project: { ...state.project, pages } }
    }),

  setCurrentTime: (timeMs) => set({ currentTimeMs: timeMs }),

  setPlaying: (playing) => set({ isPlaying: playing }),
}))
