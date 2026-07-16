import React, { useEffect, useRef } from 'react'
import { initCanvasApp, destroyCanvasApp, resizeCanvas } from '../engine/canvas-app'
import { registerViewportControls, unregisterViewportControls } from '../engine/viewport-controller'
import PropertyPanel from '../features/editor/property-panel'
import { useEditorStore } from '../store/editor-store'
import { useUIStore } from '../store/ui-store'
import type { LayerType } from '../core/types'

/**
 * 应用根组件。
 *
 * 布局结构（上到下、左到右）：
 * ┌────────────────────────────────────────────┐
 * │  工具栏（顶部）                              │
 * ├──────────┬──────────────────┬──────────────┤
 * │  素材库   │  画布视口          │  属性面板      │
 * │          │  (PixiJS)        │              │
 * │          │                  │              │
 * ├──────────┴──────────────────┴──────────────┤
 * │  时间线 / 底部面板                           │
 * └────────────────────────────────────────────┘
 */
const LAYER_OPTIONS: { type: LayerType; label: string }[] = [
  { type: 'background', label: '背景' },
  { type: 'character', label: '人物' },
  { type: 'bubble', label: '气泡' },
]

const App: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  // 从 Store 读取工具栏状态
  const activeLayer = useUIStore((s) => s.activeLayer)
  const setActiveLayer = useUIStore((s) => s.setActiveLayer)
  const project = useEditorStore((s) => s.project)
  const currentPageIndex = useEditorStore((s) => s.currentPageIndex)

  const currentPage = project?.pages[currentPageIndex]

  useEffect(() => {
    if (!canvasContainerRef.current || initializedRef.current) return
    initializedRef.current = true

    initCanvasApp(canvasContainerRef.current).catch((err) => {
      console.error('画布初始化失败：', err)
    })

    // 在画布容器上注册视口控制
    registerViewportControls(canvasContainerRef.current)

    // 监听窗口大小变化
    const handleResize = () => resizeCanvas()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (canvasContainerRef.current) {
        unregisterViewportControls(canvasContainerRef.current)
      }
      destroyCanvasApp()
      initializedRef.current = false
    }
  }, [])

  return (
    <div style={styles.root}>
      {/* 工具栏 */}
      <div style={styles.toolbar}>
        <span style={styles.title}>TRPG 漫画工作室</span>

        {/* 图层快速切换按钮 */}
        <div style={styles.toolbarGroup}>
          {LAYER_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              style={{
                ...styles.toolbarBtn,
                backgroundColor: activeLayer === opt.type ? '#45475a' : 'transparent',
              }}
              onClick={() => setActiveLayer(opt.type)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={styles.toolbarSpacer} />

        {/* 图层可见性/锁定切换 */}
        {currentPage && LAYER_OPTIONS.map((opt) => {
          const layer = currentPage.layers[opt.type]
          const updateLayer = (updates: Partial<typeof layer>) => {
            const store = useEditorStore.getState()
            // Phase 7 将添加专门的图层操作方法
            if (store.project) {
              const pages = [...store.project.pages]
              const pageIdx = store.currentPageIndex
              Object.assign(pages[pageIdx].layers[opt.type], updates)
              store.setProject({ ...store.project, pages })
            }
          }

          return (
            <div key={opt.type} style={styles.toolbarToggleGroup}>
              <button
                style={styles.toolbarIconBtn}
                title={`${opt.label} ${layer.visible ? '可见' : '隐藏'}`}
                onClick={() => updateLayer({ visible: !layer.visible })}
              >
                {layer.visible ? '👁' : '─'}
              </button>
              <button
                style={{
                  ...styles.toolbarIconBtn,
                  color: layer.locked ? '#f38ba8' : '#585b70',
                }}
                title={`${opt.label} ${layer.locked ? '已锁定' : '未锁定'}`}
                onClick={() => updateLayer({ locked: !layer.locked })}
              >
                {layer.locked ? '🔒' : '🔓'}
              </button>
            </div>
          )
        })}
      </div>

      {/* 主内容区域 */}
      <div style={styles.main}>
        {/* 左侧：素材库 */}
        <div style={styles.leftPanel}>
          <div style={styles.placeholderText}>素材库</div>
        </div>

        {/* 中央：画布 */}
        <div style={styles.centerArea}>
          <div style={styles.canvas} ref={canvasContainerRef} id="canvas-container">
            <span id="canvas-error-msg" style={styles.canvasError}>
              画布初始化失败，请检查 WebGL 支持
            </span>
          </div>
        </div>

        {/* 右侧：属性面板 */}
        <div style={styles.rightPanel}>
          <PropertyPanel />
        </div>
      </div>

      {/* 底部：时间线 */}
      <div style={styles.bottomPanel}>
        <div style={styles.placeholderText}>时间线</div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#1e1e2e',
    color: '#cdd6f4',
    fontFamily: 'system-ui, sans-serif',
  },
  toolbar: {
    height: 40,
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    backgroundColor: '#181825',
    borderBottom: '1px solid #313244',
    flexShrink: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: '#cba6f7',
  },
  main: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  leftPanel: {
    width: 220,
    backgroundColor: '#1e1e2e',
    borderRight: '1px solid #313244',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  centerArea: {
    flex: 1,
    display: 'flex',
    position: 'relative',
    backgroundColor: '#11111b',
  },
  canvas: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#11111b',
  },
  canvasError: {
    display: 'none',
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f38ba8',
    fontSize: 14,
    backgroundColor: '#11111b',
  },
  rightPanel: {
    width: 260,
    backgroundColor: '#1e1e2e',
    borderLeft: '1px solid #313244',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bottomPanel: {
    height: 200,
    backgroundColor: '#181825',
    borderTop: '1px solid #313244',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  placeholderText: {
    color: '#585b70',
    fontSize: 14,
  },
  toolbarGroup: {
    display: 'flex',
    gap: 2,
    marginLeft: 24,
  },
  toolbarBtn: {
    background: 'transparent',
    border: '1px solid #45475a',
    borderRadius: 4,
    color: '#cdd6f4',
    fontSize: 12,
    padding: '4px 10px',
    cursor: 'pointer',
  },
  toolbarSpacer: {
    flex: 1,
  },
  toolbarToggleGroup: {
    display: 'flex',
    gap: 2,
    marginLeft: 8,
  },
  toolbarIconBtn: {
    background: 'transparent',
    border: 'none',
    borderRadius: 4,
    color: '#585b70',
    fontSize: 14,
    padding: '4px 6px',
    cursor: 'pointer',
  },
}

export default App
