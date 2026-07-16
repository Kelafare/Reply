## Why

Phase 1 完成了项目脚手架——窗口能打开、布局能显示、类型和 Store 骨架已定义。但画布区域还是一片空白占位文字，用户看不到任何图像渲染。Phase 2 要让 PixiJS 画布引擎真正跑起来，把图片显示到屏幕上，并补齐 Phase 1 遗留的关键缺口（IPC handler、Immer 集成、基础测试），在此基础上为后续效果系统、时间线、播放引擎打下画布交互的根基。

## What Changes

### Phase 1 遗留修补（前置条件）

- **新增主进程 IPC Handler**：为 preload 已定义的 `project:create/open/save`、`dialog:selectDirectory`、`file:copyToAsset` 等频道注册 `ipcMain.handle()`。preload 桥接层定义了大量 API，但主进程目前一个 handler 都没有——调用会静默失败。至少实现 Phase 2 必需的频道：`dialog:selectDirectory` 和 `file:copyToAsset`、`file:readAsset`。
- **Store 集成 Immer**：README 声明的 Zustand + Immer 并未实际使用，当前 editor-store 用手动展开运算符做不可变更。用 Immer 重写 mutating actions，为后续撤销/重做栈做准备。
- **编写基础单元测试**：Vitest 已配置但零测试文件。为核心类型校验和 Store actions 补充基础测试用例。

### Phase 2 核心内容

- **PixiJS Application 封装**（`engine/canvas-app.ts`）：初始化 WebGL 模式的 PixiJS Application，挂载到 `canvas-container` DOM 节点，管理 Application 生命周期（创建/销毁/resize）。
- **三层图层渲染器**（`engine/layer-renderer.ts`）：创建 background / character / bubble 三个 PixiJS Container，按 z-order 叠加，从 Store 读取图层数据驱动创建/更新/删除 Item 的 DisplayObject。
- **画布视口控制**：Ctrl+滚轮缩放、空格+拖拽平移画布视口，变换映射到 PixiJS 的 stage scale/position。
- **素材到画布的拖放**：从左侧素材库拖入图片 → 主进程复制文件到项目 assets/ → Store 创建 CanvasItem → PixiJS 渲染。
- **画布 Item 交互**：点击选中（蓝色边框高亮）、拖拽移动、四角手柄缩放、顶部旋转手柄。
- **属性面板联动**：画布选中 Item → 右侧属性面板同步显示并编辑 x/y/width/height/rotation/opacity，修改后 Store 更新 → PixiJS 重绘。
- **图层控制**：图层可见性开关（toggle 眼睛图标）、锁定控制（toggle 锁图标），PixiJS Container 的 visible 属性联动。

## Capabilities

### New Capabilities

- `pixi-canvas-init`: PixiJS Application 的初始化、生命周期管理、DOM 挂载。WebGL 上下文创建、ticker 启动/停止、自适应 resize。
- `layer-rendering`: 三层图层（background/character/bubble）的 Container 管理。从 Store 读取图层数据并创建对应 PixiJS DisplayObject，支持增量更新（增/删/改 Item）。
- `canvas-viewport`: 画布视口的缩放（Ctrl+滚轮）和平移（空格+拖拽），带边界约束和范围限制。
- `canvas-item-interaction`: Item 的选中（单击）、拖拽移动、手柄缩放/旋转。事件命中检测、坐标变换（世界/本地坐标换算）、交互状态机。
- `property-panel-sync`: 属性面板与画布选中的双向同步。选中 Item → 面板显示属性 → 编辑属性 → Store 更新 → 画布重绘。
- `phase1-patches`: Phase 1 遗留修补——IPC handler 注册、Immer 集成、基础测试。

### Modified Capabilities

<!-- 无——本变更不修改已有 spec，因为当前 openspec/specs/ 目录为空。Phase 2 是首个创建 spec 的变更。 -->

## Impact

- **新增文件**：`src/engine/canvas-app.ts`、`src/engine/layer-renderer.ts`、`src/engine/viewport-controller.ts`、`src/engine/item-interaction.ts`、`src/features/editor/canvas-view.tsx`、`src/features/editor/property-panel.tsx`、`src/main/ipc-handlers/` 下多个 handler 文件。
- **修改文件**：`src/store/editor-store.ts`（Immer 重写）、`src/store/ui-store.ts`（Immer 重写）、`src/renderer/App.tsx`（集成 PixiJS 替换占位 div）、`src/main/index.ts`（注册 IPC handlers）。
- **新增依赖**：PixiJS v8 已在 package.json 中声明，无需额外安装。
- **测试文件**：`src/core/__tests__/types.test.ts`、`src/store/__tests__/editor-store.test.ts`。
