import { describe, it, expect } from 'vitest'
import type { Project, Page, CanvasItem, EffectTrack } from '../types'

describe('Project type shape', () => {
  const createValidProject = (): Project => ({
    schemaVersion: '1.0.0',
    metadata: {
      name: 'Test Project',
      resolution: { width: 1920, height: 1080 },
      fps: 24,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    pages: [],
    presets: [],
  })

  it('should conform to Project type with valid data', () => {
    const project = createValidProject()
    expect(project.schemaVersion).toBe('1.0.0')
    expect(project.metadata.name).toBe('Test Project')
    expect(project.metadata.resolution.width).toBe(1920)
    expect(project.metadata.resolution.height).toBe(1080)
    expect(project.metadata.fps).toBe(24)
    expect(project.pages).toEqual([])
    expect(project.presets).toEqual([])
  })

  it('should accept pages in Project', () => {
    const page: Page = {
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
    }

    const project = { ...createValidProject(), pages: [page] }
    expect(project.pages).toHaveLength(1)
    expect(project.pages[0].id).toBe('page-1')
    expect(project.pages[0].layers.background.type).toBe('background')
  })

  it('should accept CanvasItem in a layer', () => {
    const item: CanvasItem = {
      id: 'item-1',
      name: 'Character A',
      imagePath: 'assets/char_a.png',
      baseTransform: {
        x: 100,
        y: 200,
        width: 300,
        height: 400,
        rotation: 0,
        opacity: 1,
      },
      displayOrder: 1,
      timeline: [],
    }

    expect(item.baseTransform.x).toBe(100)
    expect(item.baseTransform.opacity).toBe(1)
    expect(item.timeline).toEqual([])
  })

  it('should accept EffectTrack with duration', () => {
    const track: EffectTrack = {
      effectId: 'fade',
      startTime: 1000,
      duration: 2000,
      params: { from: 0, to: 1 },
      enabled: true,
    }

    expect(track.effectId).toBe('fade')
    expect(track.duration).toBe(2000)
    expect(track.enabled).toBe(true)
  })

  it('should accept EffectTrack with null duration (continuous)', () => {
    const track: EffectTrack = {
      effectId: 'wobble',
      startTime: 0,
      duration: null,
      params: { amplitude: 5, frequency: 3 },
      enabled: true,
    }

    expect(track.duration).toBeNull()
  })
})
