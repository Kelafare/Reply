# Reply — TRPG Comic Studio

为 TRPG（桌上角色扮演游戏）跑团 Replay 创作者打造的**动态漫画桌面应用**，将动态漫画编辑、时间线动画、AI 素材生成、视频导出整合到同一个创作环境中，替代「剪辑软件 + AI 生图工具 + 排版工具」的割裂工作流。

## 核心特性（规划）

- **三层图层制作面**：漫画框层 / 人物层 / 对话气泡层，支持图片插入、变换与混合模式
- **时间线动画系统**：每个图像独立轨道，效果块可拖拽、可叠加组合出复合动画
- **效果插件架构**：内置平滑移动、淡化、缩放、果冻/呼吸、材质覆盖、帧动画、UT 风格文字动画，支持扩展
- **可变形对话气泡**：9 点 Mesh 网格形变 + 气泡内文本自动重排
- **Log 分屏查看器**：解析海豹骰 docx 格式跑团记录，保留富文本格式
- **素材库**：树形文件管理器，多级分类、动画预设保存与复用
- **AI 素材生成**：ComfyUI 本地引擎（主）+ 云端 API（备），LoRA 微调保持角色一致性
- **预览与导出**：实时播放动态漫画，FFmpeg 一键导出 MP4

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 桌面框架 | Electron + electron-vite |
| UI | React 19 + TypeScript |
| 画布渲染 | PixiJS v8（WebGL） |
| 状态管理 | Zustand + Immer |
| 拖拽交互 | dnd-kit |
| 测试 | Vitest |
| 外部依赖 | ComfyUI（AI 生图）、FFmpeg（视频编码）、mammoth（docx 解析） |

## 目录结构

```text
Reply/
├── docs/                    # 产品说明、开发计划、技术架构文档
├── openspec/                # OpenSpec 变更提案与规格（proposal / design / tasks）
└── trpg-comic-studio/       # 应用主体
    └── src/
        ├── main/            # Electron 主进程（窗口管理）
        ├── preload/         # 安全桥接层
        ├── renderer/        # React 渲染进程入口与顶层布局
        ├── shared/          # 主/渲染进程共享的 IPC 通道常量
        ├── store/           # Zustand 状态（editor-store / ui-store）
        ├── core/            # 核心类型定义、效果系统、播放引擎、项目管理
        ├── engine/          # PixiJS 画布引擎
        └── features/        # 编辑器功能模块（时间线、素材库、Log、导出等）
```

## 环境要求

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 20.x | Electron 43 运行基础 |
| npm | >= 10.x | 包管理 |
| Git | 任意 | 版本控制 |
| OS | Windows 10+ / macOS 12+ / Linux | Electron 支持 |
| FFmpeg | >= 5.0（可选，导出时需要） | 视频编码 |

## 快速启动

### 1. 克隆 & 安装

```bash
git clone <repo-url>
cd Reply/trpg-comic-studio
npm install
```

首次 `npm install` 会自动下载 Electron 二进制文件（约 200MB），请耐心等待。

### 2. 启动开发模式

```bash
npm run dev
```

这会同时启动两个东西：
- **Vite Dev Server** — `http://localhost:5173`（渲染进程 HMR 热更新）
- **Electron 窗口** — TRPG Comic Studio 桌面窗口（主进程）

修改代码后渲染进程会自动刷新，主进程修改需手动重启。

### 3. 构建生产版本

```bash
npm run build     # 编译到 out/ 目录
npm run preview   # 预览构建结果
```

### 4. 运行测试

```bash
npm test          # 运行所有测试（Vitest）
npm run test:ui   # 带 UI 界面的测试运行器
```

## 验证 Phase 2（PixiJS 画布引擎）

启动 `npm run dev` 后，你应在 Electron 窗口中看到：

| 区域 | 预期效果 |
|------|----------|
| **顶部工具栏** | 标题 "TRPG Comic Studio" + 图层切换按钮（背景/人物/气泡）+ 👁/🔒 按钮 |
| **左侧面板** | "素材库" 占位文字 |
| **中央画布** | 深色背景（#11111b），PixiJS WebGL 画布 |
| **右侧面板** | 属性面板，无选中时显示"选择对象以编辑属性" |
| **底部面板** | "时间线" 占位文字 |
| **视口操作** | Ctrl+滚轮缩放（10%-500%）、空格+拖拽平移、Ctrl+0 重置 |
| **图层切换** | 点击工具栏按钮切换当前编辑图层 |
| **可见性/锁定** | 点击 👁 切换图层可见、点击 🔒 切换图层锁定 |

当前画布为空是因为还没有素材导入功能（Phase 8）。画布已就绪，等待后续阶段添加内容。

## 故障排除

### Electron 窗口不出现

1. 确认 Electron 二进制下载完成：
   ```bash
   npx electron --version
   ```
   应输出 Electron 版本号（如 `v43.1.1`）

2. 如果是首次安装，手动触发 Electron 下载：
   ```bash
   node node_modules/electron/install.js
   ```

3. Linux 用户需要安装系统依赖：
   ```bash
   sudo apt-get install -y libnss3 libgbm1 libasound2 libgtk-3-0 libxss1 libxkbcommon0
   ```

### `npm run dev` 构建成功但 Electron 启动失败

检查构建输出确认三个 bundle 都编译成功（main / preload / renderer）。

如遇 `electron.app` 相关错误，尝试：
```bash
# 清理重装
rm -rf node_modules out
npm install
npm run build
npm run dev
```

### 测试失败

```bash
npx vitest run --reporter verbose   # 查看详细输出
```

### Vite Dev Server 端口冲突

设置环境变量修改端口：
```bash
# Windows PowerShell
$env:ELECTRON_RENDERER_URL="http://localhost:3000"
npm run dev
```

## 开发

```bash
cd trpg-comic-studio
npm install
npm run dev        # 启动开发模式（Vite HMR）
npm run build      # 构建
npm test           # 运行测试
```

## 开发进度

开发遵循 [openspec/changes/trpg-comic-studio/tasks.md](openspec/changes/trpg-comic-studio/tasks.md) 的 12 个阶段：

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| 1 | 项目脚手架与基础设施 | ✅ 已完成 |
| 2 | PixiJS 画布引擎基础 | ✅ 已完成 |
| 3 | 效果插件系统 | ⬜ 未开始 |
| 4 | 时间线编辑器 | ⬜ 未开始 |
| 5 | 播放引擎 | ⬜ 未开始 |
| 6 | 气泡编辑器 | ⬜ 未开始 |
| 7 | 项目管理系统 | ⬜ 未开始 |
| 8 | 素材库 | ⬜ 未开始 |
| 9 | Log 查看器 | ⬜ 未开始 |
| 10 | AI 生图集成 | ⬜ 未开始 |
| 11 | 预览与导出 | ⬜ 未开始 |
| 12 | UI 完善与体验优化 | ⬜ 未开始 |

**当前已实现**：

- Electron + electron-vite + React + TypeScript 项目结构，Vite HMR 可用
- 主进程窗口管理、preload 安全桥接、IPC 通道常量定义
- 主进程 IPC Handler（dialog、file-manager、project-io 桩）
- 渲染进程顶层布局（工具栏含图层切换/可见性/锁定按钮 / 素材库 / 画布 / 属性面板 / 时间线）
- 核心 TypeScript 类型定义（项目、页面、图层、画布 Item、效果轨道等数据模型）
- Zustand Store + Immer 中间件（editor-store：项目/页面/图层/选中/播放状态；ui-store：界面状态）
- Vitest 测试框架 + 核心类型与 Store 单元测试（14 个测试用例全部通过）
- PixiJS v8 WebGL 画布引擎（Application 生命周期、WebGL 上下文丢失恢复）
- 三层图层渲染器（background/character/bubble Container，Store 订阅自动同步）
- 画布视口控制（Ctrl+滚轮缩放 10%-500%、空格+拖拽平移、Ctrl+0 重置）
- Item 交互系统（点击选中/拖拽移动/角手柄缩放/旋转手柄/手柄高亮）
- 属性面板双向同步（选中 Item → 显示属性 → 编辑提交 → Store 更新 → 画布重绘）

## 相关文档

- [产品说明](docs/产品说明.md)
- [开发计划](docs/开发计划.md)
- [技术栈与架构设计](docs/技术栈与架构设计.md)
- [OpenSpec 提案](openspec/changes/trpg-comic-studio/proposal.md)

## License

MIT
