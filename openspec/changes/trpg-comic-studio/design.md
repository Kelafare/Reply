## Context

本应用是一款面向个人使用的桌面端 TRPG Replay 动态漫画创作工具。用户（开发者本人）需要在单一应用中完成从素材准备、漫画排版、动画编排到视频导出的完整工作流。项目从零开始构建，无遗留代码。

**关键约束：**
- 个人使用，无需考虑多用户、权限、分发等
- 追求可扩展性，后续会持续添加新功能
- 需能在开发过程中随时运行查看效果
- Windows 平台优先，预装 ComfyUI + FFmpeg

## Goals / Non-Goals

**Goals:**
- 提供流畅的 PixiJS WebGL 三层图层渲染引擎
- 实现类必剪风格的多轨时间线编辑器，每个图像 Item 独立轨道
- 构建可扩展的效果插件系统，效果可叠加组合
- 支持可变形气泡（Mesh 形变 + 文本自适应重排）
- 集成 ComfyUI 本地引擎进行 AI 生图
- 导出 MP4 视频（FFmpeg 帧序列合成）
- 文件夹式项目结构，JSON 序列化，支持自动保存与撤销

**Non-Goals:**
- 不涉及云端协作/多用户
- 不涉及应用商店分发
- 不优先 macOS 适配
- 不做移动端
- 不做用户权限管理

## Decisions

### D1: 桌面框架 — Electron

**选择**：Electron + electron-vite

**备选**：Tauri（Rust 后端 + Web 前端）

**理由**：
- 需要 Node.js 生态操作本地文件（FFmpeg 管道、ComfyUI 进程管理、docx 解析）
- 个人使用，包体积与内存不是约束条件
- Electron 社区成熟，PixiJS WebGL 兼容性经过充分验证
- Vite HMR 提供极快的开发热更新体验

### D2: 渲染引擎 — PixiJS v8 单一引擎

**选择**：PixiJS v8（WebGL 模式）

**备选**：PixiJS + Fabric.js/Konva.js 双引擎

**理由**：
- 单个 Canvas 库避免两个渲染管线的事件冒泡冲突、坐标同步问题
- PixiJS v8 的 EventSystem 已足够处理复杂的画布交互（选中、拖拽控制点、节点拖拽）
- Mesh API 可满足气泡网格形变需求
- 少一个依赖就少一组潜在 bug

### D3: UI 框架与状态管理 — React + Zustand

**选择**：React（UI 面板层）+ Zustand（状态管理）

**理由**：
- 复杂面板（时间线、属性编辑器、素材库树）天然适合 React 组件化
- Zustand 轻量、TypeScript 友好、无 Provider 包裹
- **关键优势**：Zustand 可在 React 内外同时使用——PixiJS 引擎直接订阅 store 变化而无需通过 React 桥接

**数据流模式**：
```
用户操作 → React Event → Zustand store.set() → PixiJS sub 订阅 → 重新渲染 Canvas
                ↑                                                      │
                └──────────── PixiJS 事件也能直接写 store ──────────────┘
```

### D4: 时间线 UI — 自研（基于 @dnd-kit）

**选择**：自研时间线组件，基于 `@dnd-kit/core` + `@dnd-kit/sortable` 实现拖拽

**理由**：
- 没有现成库能满足"多轨 Item + 效果块拖拽 + 时长调整 + 吸附对齐"的需求
- GSAP 的 Timeline 只做动画编排不做 UI
- 自研可完全控制交互细节（拖拽吸附、涟漪更新、块重叠可视化）

### D5: 效果系统 — 插件架构

**选择**：定义 `EffectPlugin` 接口，所有效果作为插件注册到 Registry

```typescript
interface EffectPlugin {
  id: string;
  name: string;
  hasDuration: boolean;         // 有结束时间 → 可拖拽块；无 → 持续属性
  defaultParams: Record<string, unknown>;
  getTransform(params, progress: number): ItemTransform;
  applyPixiFilter?(item: Container, params, progress: number): void;
  ParamsEditor: React.FC<{ params; onChange }>;
}

interface ItemTransform {
  x?: number; y?: number;
  scaleX?: number; scaleY?: number;
  alpha?: number;
  rotation?: number;
  skewX?: number; skewY?: number;
}
```

**理由**：
- 添加新效果 = 实现接口 + 注册，核心引擎无需改动
- `getTransform` 返回偏移量，由 Compositor 负责叠加，天然支持效果组合
- `applyPixiFilter` 为材质覆盖等需直接操作 PixiJS 对象的效果留扩展点
- 参数编辑面板（React 组件）作为插件的一部分，UI 与逻辑不分离

### D6: 项目存储 — 文件夹结构 + JSON 序列化

**选择**：每个项目一个文件夹 + 入口 `project.json` + 素材外部路径引用

```
MyProject/
├── project.json          ← 项目数据（图层、时间线、动画参数）
├── assets/               ← 内嵌素材副本（用户拖入的图片等）
│   ├── char_01.png
│   └── bg_forest.jpg
└── exports/              ← 导出目录（视频输出）
```

**理由**：
- 文件夹式结构便于素材管理，用户可直接操作文件
- JSON 人类可读，git diff 友好
- 素材外部路径引用（不强制复制），节省磁盘空间
- `project.json` 内置 `schemaVersion` 字段，支持未来数据迁移

### D7: 撤销栈 — 命令模式 + Immer

**选择**：基于 Immer 的不可变状态 + 命令历史栈

**方案**：每次修改前 `store.getState()` 做快照，推入栈中。撤销时从栈取出前一个状态恢复。

**理由**：
- Zustand + Immer 天然产生不可变状态树
- 快照方案实现简单，适合个人工具
- 限制栈深度 200 步防止内存膨胀

### D8: AI 生图 — ComfyUI 本地为主，云端 API 为备

**选择**：主进程通过 HTTP 与本地 ComfyUI 通信，封装工作流 JSON 模板

**理由**：
- 后台静默运行 ComfyUI，用户无感知
- 通过 ComfyUI JSON API 提交工作流并轮询结果
- 工作流模板可热更新（不依赖发版）
- 云端 API（Replicate/DashScope）作为 ComfyUI 不可用时的降级方案

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                          Electron                                   │
│  ┌──────────────────────────┐    ┌─────────────────────────────┐   │
│  │     Main Process (Node)  │    │     Renderer Process          │   │
│  │                          │    │                               │   │
│  │  ┌────────────────────┐  │    │  ┌────────────────────────┐  │   │
│  │  │ ProjectIOManager   │◀─┼─IPC─┼─▶│ React App              │  │   │
│  │  │ • 读/写 project.json│  │    │  │                        │  │   │
│  │  │ • 自动保存(debounce)│  │    │  │  ┌──────────────────┐  │  │   │
│  │  │ • 素材文件复制       │  │    │  │  │ UI Panels (React) │  │  │   │
│  │  └────────────────────┘  │    │  │  │ 时间线/属性/素材库 │  │  │   │
│  │                          │    │  │  └────────┬─────────┘  │  │   │
│  │  ┌────────────────────┐  │    │  │           │读写          │  │   │
│  │  │ ComfyUIBridge      │◀─┼─IPC─┼─▶│  ┌────────┴─────────┐  │  │   │
│  │  │ • 启动/停止 ComfyUI │  │    │  │  │ Zustand Store    │  │  │   │
│  │  │ • 提交工作流任务     │  │    │  │  │ (唯一数据源)      │  │  │   │
│  │  │ • 轮询生成结果       │  │    │  │  └────────┬─────────┘  │  │   │
│  │  └────────────────────┘  │    │  │           │订阅          │  │   │
│  │                          │    │  │  ┌────────┴─────────┐  │  │   │
│  │  ┌────────────────────┐  │    │  │  │ PixiJS Engine    │  │  │   │
│  │  │ FFmpegExporter     │◀─┼─IPC─┼─▶│  │ • 图层渲染        │  │  │   │
│  │  │ • 帧序列 → MP4     │  │    │  │  │ • 效果叠加计算    │  │  │   │
│  │  │ • 帧率/分辨率设置   │  │    │  │  │ • 气泡 Mesh 变形  │  │  │   │
│  │  └────────────────────┘  │    │  │  └──────────────────┘  │  │   │
│  │                          │    │  └────────────────────────┘  │   │
│  │  ┌────────────────────┐  │    │                               │   │
│  │  │ LogParser          │◀─┼─IPC─┼──▶ docx → 结构化 Log 数据     │   │
│  │  │ • mammoth 解析docx │  │    │                               │   │
│  │  └────────────────────┘  │    └─────────────────────────────┘   │
│  └──────────────────────────┘                                      │
└────────────────────────────────────────────────────────────────────┘
```

## Rendering Pipeline

每帧的计算流程（在 PixiJS ticker 中执行）：

```
当前时间 T
    │
    ▼
确定当前 Page → 计算 Item 出现时间（播放逻辑引擎）
    │
    ▼
For each active Item:
    │
    ├─ 获取 baseTransform {x, y, scaleX, scaleY, alpha, rotation}
    │
    ├─ 遍历 Item.timeline 中的激活效果:
    │    for each EffectTrack where startTime ≤ relativeT ≤ startTime+duration:
    │        progress = (relativeT - startTime) / duration
    │        delta += effect.getTransform(params, progress)
    │
    ├─ 叠加所有 delta: finalTransform = baseTransform + Σdelta
    │
    └─ PixiJS 以 finalTransform 渲染 Item
    │
    ▼
合成三层 → 输出帧
```

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| PixiJS v8 API 变动 | 渲染层需跟随升级 | 锁定主版本，封装 Adapter 层隔离 |
| 自研时间线复杂度 | 开发周期延长 | 先实现单轨垂直版，再扩展多轨 |
| ComfyUI 稳定性 | 生图失败影响体验 | 云端 API 作为降级方案 |
| FFmpeg 大视频导出内存 | 可能 OOM | 分页导出 + 流式管道写入 |
| JSON 项目文件膨胀 | 大项目加载慢 | 素材与项目数据分离，JSON 只存引用 |
| 效果叠加顺序差异 | 不同顺序可能产生不同结果 | 效果 Track 严格按数组顺序叠加 |
