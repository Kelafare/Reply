import React from 'react'

/**
 * Root application component.
 *
 * Layout structure (top-down, left-right):
 * ┌──────────┬──────────────────┬──────────┐
 * │  Toolbar (top bar)                     │
 * ├──────────┼──────────────────┬──────────┤
 * │  Asset   │  Canvas Viewport  │  Props   │
 * │  Library │  (PixiJS)        │  Panel   │
 * │          │                  │          │
 * ├──────────┴──────────────────┴──────────┤
 * │  Timeline / Bottom Panel               │
 * └────────────────────────────────────────┘
 */
const App: React.FC = () => {
  return (
    <div style={styles.root}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <span style={styles.title}>TRPG Comic Studio</span>
      </div>

      {/* Main content area */}
      <div style={styles.main}>
        {/* Left: Asset Library */}
        <div style={styles.leftPanel}>
          <div style={styles.placeholderText}>素材库</div>
        </div>

        {/* Center: Canvas + optional Log viewer */}
        <div style={styles.centerArea}>
          <div style={styles.canvas} id="canvas-container">
            <div style={styles.placeholderText}>Canvas (PixiJS)</div>
          </div>
        </div>

        {/* Right: Properties / Log */}
        <div style={styles.rightPanel}>
          <div style={styles.placeholderText}>属性面板</div>
        </div>
      </div>

      {/* Bottom: Timeline */}
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
    backgroundColor: '#11111b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
}

export default App
