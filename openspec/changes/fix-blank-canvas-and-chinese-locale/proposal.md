## 为什么

用户启动应用后看到一片空白——PixiJS 画布未能渲染到屏幕上。同时界面中残留大量英文文本（属性面板标签、标题、占位文字等），用户在中文环境下使用体验割裂。这两个问题必须在 Phase 3 开始前修掉，否则后续效果系统、时间线等功能都无法在可视化环境下验证。

## 变更内容

### 画布空白修复

- **修复 PixiJS 画布容器尺寸为 0 的问题**：`canvas-container` div 依赖 CSS flex 链计算高度（`100vh → flex:1 → flex:1 → height:100%`），但在 PixiJS `init()` 时浏览器可能尚未完成布局，导致容器尺寸为 0×0，WebGL 画布实际不可见。修复方案：给画布容器添加绝对定位 + `inset:0` 替代百分比高度，确保容器始终有非零尺寸。
- **增加画布初始化失败的可视化提示**：当 PixiJS 初始化失败时，在画布区域显示中文错误提示文字，而非静默留白。
- **画布容器添加深色兜底背景**：即使 PixiJS 未初始化，也显示 `#11111b` 深色而非白色。
- **添加 PixiJS 初始化成功日志**：在控制台输出画布尺寸，方便排查问题。

### 全面中文化

- **属性面板标签中文化**：`X/Y/Width/Height/Rotation/Opacity` 改为「X 坐标 / Y 坐标 / 宽度 / 高度 / 旋转角度 / 不透明度」
- **应用标题中文化**：`TRPG Comic Studio` 改为「TRPG 漫画工作室」
- **HTML 页面标题中文化**：`<title>` 改为「TRPG 漫画工作室」
- **所有占位文字中文化**：素材库、时间线等区域
- **工具栏提示中文化**：图层可见/隐藏/锁定状态提示
- **控制台日志中文化**：所有 `console.warn/log/error` 消息改为中文
- **代码注释中文化**：注释文本改为中文（类型定义除外）

## 能力

### 新增能力

- `canvas-resilience`: PixiJS 画布初始化容错——容器尺寸兜底、初始化失败可视化提示、成功日志输出。
- `chinese-locale`: 全面中文化——所有用户可见文本、控制台日志、代码注释使用中文。

### 修改的能力

- `pixi-canvas-init`: 修改画布初始化流程，增加容器尺寸预检查和失败兜底渲染。
- `property-panel-sync`: 修改属性面板标签文案为中文。

## 影响范围

- **修改文件**：`src/renderer/App.tsx`（画布容器样式 + 标题）、`src/engine/canvas-app.ts`（初始化容错 + 日志）、`src/features/editor/property-panel.tsx`（标签中文）、`src/renderer/index.html`（标题）、`src/engine/layer-renderer.ts`（日志中文）、`src/engine/viewport-controller.ts`（日志中文）、`src/engine/item-interaction.ts`（日志中文）
- **不影响**：数据模型、Store 接口、IPC 协议、测试用例
