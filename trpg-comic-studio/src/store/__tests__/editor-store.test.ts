import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '../editor-store'
import type { Project, CanvasItem } from '../../core/types'

const createEmptyProject = (): Project => ({
  schemaVersion: '1.0.0',
  metadata: {
    name: 'Test Project',
    resolution: { width: 1920, height: 1080 },
    fps: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  pages: [
    {
      id: 'page-1',
      name: 'Page 1',
      layers: {
        background: { type: 'background', visible: true, locked: false, items: [] },
        character: { type: 'character', visible: true, locked: false, items: [] },
        bubble: { type: 'bubble', visible: true, locked: false, items: [] },
      },
      playbackConfig: {
        layerMode: 'sequential',
        quietHoldMs: 2000,
      },
      logText: '',
    },
  ],
  presets: [],
})

const createTestItem = (id: string, overrides?: Partial<CanvasItem>): CanvasItem => ({
  id,
  name: `Item ${id}`,
  imagePath: 'assets/test.png',
  baseTransform: {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 1,
  },
  displayOrder: 1,
  timeline: [],
  ...overrides,
})

describe('editor-store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useEditorStore.setState({
      project: null,
      currentPageIndex: 0,
      activeLayer: 'character',
      selectedItemId: null,
      currentTimeMs: 0,
      isPlaying: false,
    })
  })

  describe('setProject', () => {
    it('should set the project and reset page/selection', () => {
      const project = createEmptyProject()
      useEditorStore.getState().setProject(project)
      const state = useEditorStore.getState()
      expect(state.project).not.toBeNull()
      expect(state.project!.metadata.name).toBe('Test Project')
      expect(state.currentPageIndex).toBe(0)
      expect(state.selectedItemId).toBeNull()
    })
  })

  describe('addItem', () => {
    it('should add a CanvasItem to the specified layer', () => {
      const project = createEmptyProject()
      useEditorStore.getState().setProject(project)

      const item = createTestItem('item-1', { name: 'My Character' })
      useEditorStore.getState().addItem(0, 'character', item)

      const state = useEditorStore.getState()
      const items = state.project!.pages[0].layers.character.items
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe('item-1')
      expect(items[0].name).toBe('My Character')
    })

    it('should not throw when project is null', () => {
      const item = createTestItem('item-1')
      expect(() => {
        useEditorStore.getState().addItem(0, 'character', item)
      }).not.toThrow()
    })
  })

  describe('removeItem', () => {
    it('should remove a CanvasItem from the layer', () => {
      const project = createEmptyProject()
      useEditorStore.getState().setProject(project)

      const item = createTestItem('item-1')
      useEditorStore.getState().addItem(0, 'character', item)
      expect(useEditorStore.getState().project!.pages[0].layers.character.items).toHaveLength(1)

      useEditorStore.getState().removeItem(0, 'character', 'item-1')
      expect(useEditorStore.getState().project!.pages[0].layers.character.items).toHaveLength(0)
    })

    it('should clear selectedItemId when removing the selected item', () => {
      const project = createEmptyProject()
      useEditorStore.getState().setProject(project)

      const item = createTestItem('item-1')
      useEditorStore.getState().addItem(0, 'character', item)
      useEditorStore.getState().selectItem('item-1')
      expect(useEditorStore.getState().selectedItemId).toBe('item-1')

      useEditorStore.getState().removeItem(0, 'character', 'item-1')
      expect(useEditorStore.getState().selectedItemId).toBeNull()
    })
  })

  describe('updateItemTransform', () => {
    it('should update the baseTransform of an item', () => {
      const project = createEmptyProject()
      useEditorStore.getState().setProject(project)

      const item = createTestItem('item-1')
      useEditorStore.getState().addItem(0, 'character', item)

      useEditorStore.getState().updateItemTransform(0, 'character', 'item-1', {
        x: 150,
        y: 250,
        opacity: 0.5,
      })

      const items = useEditorStore.getState().project!.pages[0].layers.character.items
      expect(items[0].baseTransform.x).toBe(150)
      expect(items[0].baseTransform.y).toBe(250)
      expect(items[0].baseTransform.opacity).toBe(0.5)
      // Untouched properties should remain unchanged
      expect(items[0].baseTransform.width).toBe(100)
    })

    it('should not throw for non-existent item', () => {
      const project = createEmptyProject()
      useEditorStore.getState().setProject(project)

      expect(() => {
        useEditorStore.getState().updateItemTransform(0, 'character', 'nonexistent', { x: 100 })
      }).not.toThrow()
    })
  })

  describe('selectItem', () => {
    it('should set selectedItemId', () => {
      useEditorStore.getState().selectItem('item-1')
      expect(useEditorStore.getState().selectedItemId).toBe('item-1')
    })

    it('should clear selectedItemId with null', () => {
      useEditorStore.getState().selectItem('item-1')
      useEditorStore.getState().selectItem(null)
      expect(useEditorStore.getState().selectedItemId).toBeNull()
    })
  })
})
