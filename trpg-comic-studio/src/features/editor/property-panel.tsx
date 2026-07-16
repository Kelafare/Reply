import React, { useState, useCallback, useEffect } from 'react'
import { useEditorStore } from '../../store/editor-store'
import type { CanvasItem, LayerType } from '../../core/types'

// ---- Helper ----

function findSelectedItem(): {
  item: CanvasItem
  pageIndex: number
  layerType: LayerType
} | null {
  const state = useEditorStore.getState()
  const project = state.project
  if (!project || !state.selectedItemId) return null

  const pageIndex = state.currentPageIndex
  const layerTypes: LayerType[] = ['background', 'character', 'bubble']

  for (const layerType of layerTypes) {
    const items = project.pages[pageIndex].layers[layerType].items
    const item = items.find((i) => i.id === state.selectedItemId)
    if (item) {
      return { item, pageIndex, layerType }
    }
  }
  return null
}

// ---- Component ----

const PropertyPanel: React.FC = () => {
  const selectedItemId = useEditorStore((s) => s.selectedItemId)
  const project = useEditorStore((s) => s.project)

  // Local form state
  const [x, setX] = useState('')
  const [y, setY] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [rotation, setRotation] = useState('')
  const [opacity, setOpacity] = useState('')
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  // Sync form fields from selected item
  useEffect(() => {
    const selected = findSelectedItem()
    if (selected) {
      const t = selected.item.baseTransform
      setX(String(Math.round(t.x * 100) / 100))
      setY(String(Math.round(t.y * 100) / 100))
      setWidth(String(Math.round(t.width * 100) / 100))
      setHeight(String(Math.round(t.height * 100) / 100))
      setRotation(String(Math.round(t.rotation * 100) / 100))
      setOpacity(String(Math.round(t.opacity * 100)))
      setErrors({})
    }
  }, [selectedItemId, project])

  const commitTransform = useCallback(
    (field: string, value: string) => {
      const num = parseFloat(value)
      if (isNaN(num)) {
        setErrors((prev) => ({ ...prev, [field]: true }))
        return
      }

      setErrors((prev) => ({ ...prev, [field]: false }))

      const selected = findSelectedItem()
      if (!selected) return

      const store = useEditorStore.getState()
      const update: Record<string, number> = { [field]: num }

      // Convert opacity from percentage to 0-1
      if (field === 'opacity') {
        update[field] = num / 100
      }

      store.updateItemTransform(
        selected.pageIndex,
        selected.layerType,
        selected.item.id,
        update,
      )
    },
    [],
  )

  const handleKeyDown = useCallback(
    (field: string) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        commitTransform(field, (e.target as HTMLInputElement).value)
      }
    },
    [commitTransform],
  )

  const handleBlur = useCallback(
    (field: string) => (e: React.FocusEvent<HTMLInputElement>) => {
      commitTransform(field, e.target.value)
    },
    [commitTransform],
  )

  // ---- No selection state ----
  if (!selectedItemId) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>属性</div>
        <div style={styles.placeholder}>选择对象以编辑属性</div>
      </div>
    )
  }

  // ---- Selection state ----
  const itemName = findSelectedItem()?.item.name ?? selectedItemId

  return (
    <div style={styles.container}>
      <div style={styles.header}>属性</div>
      <div style={styles.itemName}>{itemName}</div>

      <div style={styles.fields}>
        <FieldRow label="X" value={x} error={errors['x']} onChange={setX} onBlur={handleBlur('x')} onKeyDown={handleKeyDown('x')} />
        <FieldRow label="Y" value={y} error={errors['y']} onChange={setY} onBlur={handleBlur('y')} onKeyDown={handleKeyDown('y')} />
        <FieldRow label="Width" value={width} error={errors['width']} onChange={setWidth} onBlur={handleBlur('width')} onKeyDown={handleKeyDown('width')} />
        <FieldRow label="Height" value={height} error={errors['height']} onChange={setHeight} onBlur={handleBlur('height')} onKeyDown={handleKeyDown('height')} />
        <FieldRow label="Rotation°" value={rotation} error={errors['rotation']} onChange={setRotation} onBlur={handleBlur('rotation')} onKeyDown={handleKeyDown('rotation')} />
        <FieldRow label="Opacity%" value={opacity} error={errors['opacity']} onChange={setOpacity} onBlur={handleBlur('opacity')} onKeyDown={handleKeyDown('opacity')} />
      </div>
    </div>
  )
}

// ---- Sub-component ----

interface FieldRowProps {
  label: string
  value: string
  error: boolean
  onChange: (v: string) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

const FieldRow: React.FC<FieldRowProps> = ({ label, value, error, onChange, onBlur, onKeyDown }) => (
  <div style={styles.fieldRow}>
    <label style={styles.fieldLabel}>{label}</label>
    <input
      style={{
        ...styles.fieldInput,
        borderColor: error ? '#f38ba8' : '#45475a',
      }}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  </div>
)

// ---- Styles ----

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
    overflow: 'auto',
  },
  header: {
    fontSize: 12,
    fontWeight: 600,
    color: '#a6adc8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '0 12px 8px',
    borderBottom: '1px solid #313244',
    marginBottom: 8,
  },
  placeholder: {
    color: '#585b70',
    fontSize: 13,
    textAlign: 'center',
    padding: '40px 12px',
  },
  itemName: {
    fontSize: 13,
    fontWeight: 500,
    color: '#cdd6f4',
    padding: '0 12px 8px',
    borderBottom: '1px solid #313244',
    marginBottom: 12,
    wordBreak: 'break-all',
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '0 12px',
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#a6adc8',
    width: 70,
    flexShrink: 0,
    textAlign: 'right',
  },
  fieldInput: {
    flex: 1,
    backgroundColor: '#11111b',
    border: '1px solid #45475a',
    borderRadius: 4,
    color: '#cdd6f4',
    fontSize: 12,
    padding: '4px 6px',
    outline: 'none',
    minWidth: 0,
  },
}

export default PropertyPanel
