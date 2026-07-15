## 1. 项目脚手架与基础设施

- [x] 1.1 初始化 Electron + electron-vite + React + TypeScript 项目结构
- [x] 1.2 配置 Electron 主进程（窗口管理、preload 安全桥接、IPC 通道常量）
- [x] 1.3 搭建渲染进程 React 入口与顶层布局组件（面板占位区域）
- [x] 1.4 配置 Vite HMR 确保开发热更新可用
- [x] 1.5 创建核心 TypeScript 类型定义文件（project.ts、effects.ts、events.ts）
- [x] 1.6 初始化 Zustand Store 骨架（editor-store、ui-store）
- [x] 1.7 配置 Vitest 测试框架

## 2. PixiJS 画布引擎基础

- [ ] 2.1 封装 PixiJS Application 初始化逻辑（canvas-app.ts，WebGL 模式）
- [ ] 2.2 实现三层图层渲染器（LayerRenderer，底层/中层/顶层 Container）
- [ ] 2.3 实现画布视口控制（缩放 Ctrl+滚轮、平移 空格+拖拽）
- [ ] 2.4 支持从素材库拖入图片到画布指定图层
- [ ] 2.5 实现图片的选中高亮、拖拽移动、角手柄缩放、旋转手柄旋转
- [ ] 2.6 实现属性面板与画布选中同步，编辑 x/y/width/height/rotation/opacity
- [ ] 2.7 实现图层的可见性切换和锁定控制

## 3. 效果插件系统

- [ ] 3.1 定义 EffectPlugin 接口与 ItemTransform 类型
- [ ] 3.2 实现效果注册表（EffectRegistry）与查询 API
- [ ] 3.3 实现效果叠加计算引擎（EffectCompositor——遍历激活效果，叠加 transform delta）
- [ ] 3.4 实现内置效果：平滑移动（MoveEffect）
- [ ] 3.5 实现内置效果：淡化（FadeEffect），含 autoRestore 选项
- [ ] 3.6 实现内置效果：缩放（ScaleEffect）
- [ ] 3.7 实现内置效果：果冻/呼吸（WobbleEffect，hasDuration=false）
- [ ] 3.8 实现内置效果：材质覆盖（MaterialEffect，含 PixiJS ColorMatrixFilter）
- [ ] 3.9 实现内置效果：帧动画（FrameAnimationEffect，帧列表+循环控制）
- [ ] 3.10 实现内置效果：UT 风格文字动画（UTTextEffect，逐字/全显模式）

## 4. 时间线编辑器

- [ ] 4.1 实现时间线面板布局（时间标尺 + 多轨滚动区域）
- [ ] 4.2 实现每个图像 Item 的独立轨道行（标签+层颜色标识）
- [ ] 4.3 实现效果块渲染（按 startTime 定位，按 duration 定宽，重叠时竖向堆叠）
- [ ] 4.4 实现效果块的拖拽移动（水平位移，吸附到 100ms 网格）
- [ ] 4.5 实现效果块的边缘拖拽调整时长
- [ ] 4.6 实现播放头（可拖拽的竖线指示器 + 时间标尺点击跳转）
- [ ] 4.7 实现时间线水平缩放（Ctrl+滚轮，改变时间粒度）
- [ ] 4.8 实现添加效果下拉菜单与右键删除效果

## 5. 播放引擎

- [ ] 5.1 实现播放调度器（PlaybackScheduler——根据播放模式和 displayOrder 计算每个 Item 的激活时间窗口）
- [ ] 5.2 实现帧渲染循环（PixiJS ticker 中调用 EffectCompositor 计算当前帧所有 Item 状态）
- [ ] 5.3 实现播放控制（Play/Pause/Stop/Next Page/Previous Page）
- [ ] 5.4 实现图层播放模式（层内 sequential 逐个出现 vs parallel 同时出现）
- [ ] 5.5 实现静默保持时长（全部 Item 完成后等待 N 秒自动切页）

## 6. 气泡编辑器

- [ ] 6.1 实现气泡容器（PixiJS Container，含 mesh 背景 + text 子节点）
- [ ] 6.2 实现 9 点控制网格（SimpleMesh 或自定义 Graphics 绘制控制点）
- [ ] 6.3 实现控制点拖拽变形（四边中点 + 四角 + 中心）
- [ ] 6.4 实现文本自动重排（监听 mesh 边界变化，更新 Text 的 wordWrapWidth）
- [ ] 6.5 实现气泡尾巴指针（三角形 Graphics，可配置边和偏移）
- [ ] 6.6 实现气泡样式属性面板（背景色、边框色、边框粗细、圆角、内边距）

## 7. 项目管理系统

- [ ] 7.1 实现文件夹式项目创建（创建目录 + project.json 初始化 + assets/ + exports/ 子目录）
- [ ] 7.2 实现项目 JSON 序列化/反序列化（serializer.ts，所有数据模型映射）
- [ ] 7.3 实现 schemaVersion 字段与迁移框架（migrations/ 目录，按版本号链式迁移）
- [ ] 7.4 实现手动保存（Ctrl+S）与另存为（save-as）
- [ ] 7.5 实现自动保存（debounce 30 秒，有修改时触发）
- [ ] 7.6 实现打开已有项目（选择文件夹 → 解析 project.json → 运行迁移 → 加载状态）
- [ ] 7.7 实现撤销/重做（基于 Immer 状态快照的命令历史栈，最大深度 200）
- [ ] 7.8 实现 Ctrl+Z 撤销、Ctrl+Y/Shift+Z 重做快捷键

## 8. 素材库

- [ ] 8.1 实现树形文件管理器 UI 组件（展开/折叠、文件夹图标、文件图标）
- [ ] 8.2 实现多级文件夹创建/删除/重命名
- [ ] 8.3 实现素材导入（拖入图片/音频文件 → 复制到项目 assets/ → 刷新树）
- [ ] 8.4 实现从素材库拖拽到画布放置图片
- [ ] 8.5 实现素材搜索过滤（按名称搜索、按类型筛选 图片/音频/预设）
- [ ] 8.6 实现动画预设保存（序列化 Item timeline 数据 → 存入预设文件）
- [ ] 8.7 实现动画预设复用（拖入画布 → 选择图片绑定 → 继承动画数据）
- [ ] 8.8 实现音频文件预览播放

## 9. Log 查看器

- [ ] 9.1 实现 Log 分屏面板 UI（右侧 30% 宽度，可折叠/展开）
- [ ] 9.2 实现海豹骰 docx 文件解析（主进程 mammoth 解析 → IPC → 渲染进程显示）
- [ ] 9.3 实现富文本渲染（保留原文字体颜色、加粗、斜体、字号）
- [ ] 9.4 实现 Log 文本选中复制（Ctrl+C 保留格式）→ 粘贴到气泡文本框
- [ ] 9.5 实现独立滚动与错误处理（损坏文件提示）

## 10. AI 生图集成

- [ ] 10.1 实现 ComfyUI 进程管理（主进程 spawn/stop ComfyUI，健康检查 API 可用性）
- [ ] 10.2 实现 ComfyUI 工作流 JSON 构造器（传入 prompt、模型参数、ControlNet/IP-Adapter 节点）
- [ ] 10.3 实现生成任务提交与轮询（POST workflow → 轮询 job status → 下载输出图）
- [ ] 10.4 实现 AI 生图面板 UI（提示词输入、模型选择、类别选择 角色/背景/道具）
- [ ] 10.5 实现多智能体画风管理（创建/编辑/删除 agent profile，参考图+提示词模板）
- [ ] 10.6 实现 LoRA 训练触发与进度展示（调用 Kohya_ss → 轮询进度 → 显示状态）
- [ ] 10.7 实现 IP-Adapter 快速生图模式（单张参考图 + prompt）
- [ ] 10.8 实现生成结果管理（缩略图列表、保存至素材库、批量删除）
- [ ] 10.9 实现云端 API 降级方案（ComfyUI 不可用时的 DashScope/Replicate 调用）

## 11. 预览与导出

- [ ] 11.1 实现实时预览模式（画布全屏播放，显示播放控件覆盖层）
- [ ] 11.2 实现页面切换逻辑（上一页/下一页/跳转）
- [ ] 11.3 实现导出面板 UI（分辨率预设 + 帧率选择 + 质量/码率设置）
- [ ] 11.4 实现帧序列渲染（逐帧渲染 PixiJS → 提取像素数据 → 管道输入 FFmpeg）
- [ ] 11.5 实现 FFmpeg 视频编码（主进程 spawn ffmpeg，stdin 管道接收帧数据）
- [ ] 11.6 实现导出进度展示与取消功能
- [ ] 11.7 实现导出完成后打开文件所在目录

## 12. UI 完善与体验优化

- [ ] 12.1 实现可拖拽面板布局（面板可调整大小、可拖拽重排）
- [ ] 12.2 实现全局快捷键注册（播放/暂停 空格、保存 Ctrl+S、撤销 Ctrl+Z 等）
- [ ] 12.3 实现工具栏（图层切换、播放控制、Log 开关、导出入口）
- [ ] 12.4 实现操作反馈（loading 状态、错误 toast 提示）
- [ ] 12.5 性能优化（大量图层时的渲染性能、纹理管理、内存释放）
