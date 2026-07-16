## 1. 画布容器尺寸修复

- [ ] 1.1 将 `App.tsx` 中 `centerArea` 样式添加 `position: 'relative'`
- [ ] 1.2 将 `canvas` 样式从 `width:'100%'; height:'100%'` 改为 `position:'absolute'; inset:0`，并添加 `backgroundColor: '#11111b'` 兜底
- [ ] 1.3 在 `canvas-container` div 内预置错误提示 `<span>`，默认 `display:'none'`，语义为「画布初始化失败，请检查 WebGL 支持」

## 2. PixiJS 初始化容错增强

- [ ] 2.1 修改 `canvas-app.ts` 的 `initCanvasApp`——初始化前检查容器 `clientWidth` 和 `clientHeight`，若为零则使用兜底尺寸 800×600
- [ ] 2.2 初始化成功后输出 `console.log('画布初始化成功：<宽>×<高>')`
- [ ] 2.3 初始化失败时（`catch` 块），将容器背景设为 `#11111b`，显示预置的错误提示 span
- [ ] 2.4 初始化失败时输出 `console.error('画布初始化失败：', err)`
- [ ] 2.5 将 `canvas-app.ts` 中所有 `console.warn/log/error` 的前缀改为中文：`[画布应用]`

## 3. 全面中文化

- [ ] 3.1 修改 `index.html` 的 `<title>` 为「TRPG 漫画工作室」，`lang` 已为 `zh-CN` 保持不变
- [ ] 3.2 修改 `App.tsx` 工具栏标题为「TRPG 漫画工作室」
- [ ] 3.3 修改 `App.tsx` 中所有注释为中文
- [ ] 3.4 修改 `property-panel.tsx` 字段标签为中文：「X 坐标」「Y 坐标」「宽度」「高度」「旋转角度」「不透明度」
- [ ] 3.5 修改 `property-panel.tsx` 中所有注释和提示文字为中文
- [ ] 3.6 修改 `layer-renderer.ts` 中所有 `console.warn/log` 消息为中文，前缀改为 `[图层渲染]`
- [ ] 3.7 修改 `layer-renderer.ts` 中所有注释为中文
- [ ] 3.8 修改 `viewport-controller.ts` 中所有注释为中文
- [ ] 3.9 修改 `item-interaction.ts` 中所有注释为中文
- [ ] 3.10 修改 `canvas-app.ts` 中所有注释为中文
- [ ] 3.11 修改 `editor-store.ts` 中所有注释为中文
- [ ] 3.12 修改 `ui-store.ts` 中所有注释为中文
- [ ] 3.13 修改 IPC handler 文件中所有注释和日志为中文

## 4. 验证

- [ ] 4.1 运行 `npm run build` 确认三 bundle 构建成功
- [ ] 4.2 运行 `npm test` 确认 14 个测试全部通过
- [ ] 4.3 运行 `npm run dev`，确认画布区域显示深色背景（#11111b）而非白色
- [ ] 4.4 确认控制台输出中文日志「画布初始化成功」
- [ ] 4.5 确认工具栏显示「TRPG 漫画工作室」
- [ ] 4.6 确认属性面板无选中时显示「选择对象以编辑属性」
