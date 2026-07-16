## Context

当前项目处于 Phase 1 完成、Phase 2 即将开始的状态。渲染进程有一个五区布局骨架（工具栏/素材库/画布/属性面板/时间线），但画布区域仍是一个显示占位文字的 `<div>`。PixiJS v8 已在 `package.json` 中声明但从未初始化。

**现有约束：**
- 所有数据模型已定义在 `core/types/project.ts`
- Zustand Store 已定义完整的 actions 接口，但实现使用手动展开运算符（缺 Immer）
- preload 已定义 `electronAPI` 桥接对象，但主进程零 IPC handler 实现
- 架构文档已规定 Zustand 是 React ↔ PixiJS 的唯一数据桥
- 目标分辨率 1920×1080，24/30/60 fps

## Goals / Non-Goals

**Goals:**
- PixiJS Application 在 `canvas-container` DOM 节点中正确初始化 WebGL 模式
- 三层图层（background / character / bubble）作为 PixiJS Container 渲染
- 画布视口支持缩放和平移（编辑器基础操作）
- 图片 Item 可在画布上选中、移动、缩放、旋转
- Store ↔ 画布 ↔ 属性面板三向数据同步
- Phase 1 遗留修补：IPC handler、Immer、基础测试

**Non-Goals:**
- 效果系统（EffectPlugin / Compositor）— 属于 Phase 3
- 时间线编辑器 — 属于 Phase 4
- 播放引擎 — 属于 Phase 5
- 气泡 Mesh 形变 — 属于 Phase 6
- 完整的素材库 UI — 属于 Phase 8
- 撤销/重做栈 — 属于 Phase 7，但 Immer 集成已在 Phase 2 做好铺垫

## Decisions

### 1. PixiJS Application 生命周期管理

**决定：** 单例模式，`engine/canvas-app.ts` 暴露 `getCanvasApp()` / `initCanvasApp(container: HTMLElement)` / `destroyCanvasApp()`。

**为什么不用 React Context？** PixiJS Application 不是一个 React 组件，它的生命周期（WebGL 上下文创建/销毁）需要手动管理。放在 React 树之外的单例避免重复创建。Zustand 订阅回调负责同步数据，不需要 React 渲染周期介入。

**替代方案考虑：** React ref + useEffect 挂载——对于简单场景可行，但后续效果系统和帧循环需要在 React render 之外高频更新 PixiJS，单例模式更适合高频场景。

### 2. 图层到 PixiJS 的映射

**决定：** 一个 `PIXI.Container` 对应一个 `Layer`。三层按 z-order 叠加：

```
stage
├── backgroundContainer (z: 0)
├── characterContainer  (z: 1)
└── bubbleContainer     (z: 2)
```

每个 Container 的 `visible` 属性直接联动 `Layer.visible`；`eventMode` 联动 `Layer.locked`（锁定 = eventMode = 'none'）。

Item 在 layer 内部的渲染顺序由 `displayOrder` 决定，通过 `container.sortableChildren = true` + 设置 `sprite.zIndex`。

### 3. Store → PixiJS 数据同步方式

**决定：** Zustand `subscribe` 回调 + 差分更新。

```typescript
// layer-renderer.ts
useEditorStore.subscribe((state, prevState) => {
  if (state.project === prevState.project) return
  syncLayersFromStore(state.project)
})
```

不在 ticker 中每帧读取 Store（浪费），而是在 Store 变化时主动同步。PixiJS ticker 仅用于：视口动画平滑过渡、后续 Phase 3/5 的效果计算和帧渲染。

**为什么不用轮询？** 编辑器场景大部分时间处于静止状态（用户在看、在思考），轮询每帧检查 Store 是 CPU 浪费。

### 4. 交互系统设计

**决定：** 全部使用 PixiJS v8 EventSystem（`FederatedPointerEvent`），不混用 DOM 事件。

- 选中：`pointerdown` on sprite → 命中检测 → 设置选中态 → Store.selectItem(id)
- 移动：选中后 `pointermove` → delta 换算到世界坐标 → 暂存变换 → `pointerup` 时提交到 Store
- 缩放/旋转手柄：覆盖在选中 Item 四角和顶部的额外 Graphics 对象，各自处理 drag 事件

**为什么不用 DOM overlay？** 混用 DOM 和 Canvas 事件需要坐标系统同步、事件冒泡协调，架构文档明确列为反模式。PixiJS v8 的 EventSystem 足以处理这些交互。

**坐标换算逻辑：**
```
世界坐标 = (屏幕坐标 - stage.position) / stage.scale
```

### 5. 视口控制

**决定：** 通过修改 `stage.scale` 和 `stage.position` 实现视口变换。

- 缩放：`stage.scale.set(zoom)` 限制在 [0.1, 5.0]
- 平移：`stage.position.set(panX, panY)`
- 缩放中心点：以鼠标位置为锚点计算新的 stage.position，实现"指哪缩哪"

快捷键映射：
| 操作 | 快捷键 |
|------|--------|
| 缩放 | Ctrl + 滚轮 |
| 平移 | 空格 + 鼠标拖拽 |
| 重置视图 | Ctrl + 0 |

**为什么不用 PixiJS 的 Viewport 插件？** PixiJS v8 生态的 viewport 插件尚不稳定。手动实现只涉及 scale + position 两个属性，复杂度可控。

### 6. IPC Handler 注册模式

**决定：** 按领域拆分文件，在 `main/index.ts` 的 `app.whenReady()` 中统一 import 注册。

```
src/main/
├── index.ts                    # 窗口管理 + import handlers
└── ipc-handlers/
    ├── project-io.ts           # project:create/open/save/saveAs
    ├── dialog.ts               # dialog:selectDirectory
    └── file-manager.ts         # file:copyToAsset, file:readAsset
```

Phase 2 只实现实际需要的 handler（`dialog:selectDirectory`、`file:copyToAsset`、`file:readAsset`），其余 handler 留空桩（console.warn 提示未实现）。

### 7. Immer 集成方式

**决定：** 使用 Zustand 的 `immer` 中间件，最小侵入改写现有 Store。

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export const useEditorStore = create<EditorState>()(
  immer((set) => ({
    // ...
    addItem: (pageIndex, layerType, item) =>
      set((state) => {
        state.project.pages[pageIndex].layers[layerType].items.push(item)
      }),
  }))
)
```

Immer 允许在 `set` 回调中直接修改 state 代理对象，框架自动生成不可变副本。这为 Phase 7 的撤销/重做（快照历史栈）铺路——每个 `set` 之前的 state 可以推入历史栈。

### 8. 属性面板架构

**决定：** 属性面板是纯 React 组件，监听 Store 的 `selectedItemId` 派生当前选中 Item 的数据。

数据流是单向的：
```
用户编辑属性 → Store.updateItemTransform() → PixiJS 订阅回调 → Canvas 重绘
                                              → React 组件自动 re-render（Zustand selector）
```

不需要"从 PixiJS 回读属性到面板"——PixiJS 只是 Store 的视觉投影。

## Risks / Trade-offs

- **[风险] PixiJS v8 API 不稳定** → 锁定 `^8.6.6` 版本，所有 PixiJS 调用封装在 `engine/` 目录内，未来迁移时只需改一个目录。
- **[风险] WebGL 上下文丢失**（GPU 驱动崩溃、休眠恢复）→ `canvas-app.ts` 监听 `webglcontextlost` 事件，自动重建 Application 并从 Store 恢复状态。
- **[取舍] 视口控制手写而非用插件** → 初期简单，后续若需要 minimap、缩略图导航等功能可能需要重构。接受这个技术债，因为 Phase 2 的视口需求明确且有限。
- **[风险] 大量 Item 时重新同步整个图层** → 当前 Store 订阅方式是"project 变了就全量同步"。Phase 2 不优化（Item 数量预期 < 50），在 Phase 12 性能优化阶段改为细粒度订阅。
- **[取舍] IPC handler 只实现 Phase 2 需要的子集** → 其他频道留空桩，调用时会 console.warn。避免一次性写大量未测试的代码。

## Open Questions

- 素材库 UI（Phase 8）未实现时，Phase 2 如何测试"从素材库拖入图片"？→ 使用本地文件选择对话框作为临时入口（通过 `electronAPI.selectDirectory`）。
