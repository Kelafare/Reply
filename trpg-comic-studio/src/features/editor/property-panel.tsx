import React, { useState, useCallback, useEffect } from 'react'
import { useEditorStore } from '../../store/editor-store'
import type { CanvasItem, LayerType } from '../../core/types'

// ---- 辅助函数 ----

/** 从 Store 中查找当前选中的元素及其所在位置 */
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

// ---- 组件 ----

const PropertyPanel: React.FC = () => {
  const selectedItemId = useEditorStore((s) => s.selectedItemId)
  const project = useEditorStore((s) => s.project)

  // 本地表单状态
  const [x, setX] = useState('')
  const [y, setY] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [rotation, setRotation] = useState('')
  const [opacity, setOpacity] = useState('')
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  // 从选中元素同步表单字段
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

  /** 将字段值提交到 Store */
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

      // 不透明度从百分比转换到 0-1
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

  // ---- 无选中状态 ----
  if (!selectedItemId) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>属性</div>
        <div style={styles.placeholder}>选择对象以编辑属性</div>
      </div>
    )
  }

  // ---- 有选中状态 ----
  const itemName = findSelectedItem()?.item.name ?? selectedItemId

  return (
    <div style={styles.container}>
      <div style={styles.header}>属性</div>
      <div style={styles.itemName}>{itemName}</div>

      <div style={styles.fields}>
        <FieldRow label="X 坐标" value={x} error={errors['x']} onChange={setX} onBlur={handleBlur('x')} onKeyDown={handleKeyDown('x')} />
        <FieldRow label="Y 坐标" value={y} error={errors['y']} onChange={setY} onBlur={handleBlur('y')} onKeyDown={handleKeyDown('y')} />
        <FieldRow label="宽度" value={width} error={errors['width']} onChange={setWidth} onBlur={handleBlur('width')} onKeyDown={handleKeyDown('width')} />
        <FieldRow label="高度" value={height} error={errors['height']} onChange={setHeight} onBlur={handleBlur('height')} onKeyDown={handleKeyDown('height')} />
        <FieldRow label="旋转角度" value={rotation} error={errors['rotation']} onChange={setRotation} onBlur={handleBlur('rotation')} onKeyDown={handleKeyDown('rotation')} />
        <FieldRow label="不透明度" value={opacity} error={errors['opacity']} onChange={setOpacity} onBlur={handleBlur('opacity')} onKeyDown={handleKeyDown('opacity')} />
      </div>
    </div>
  )
}

// ---- 子组件 ----

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

// ---- 样式 ----

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
