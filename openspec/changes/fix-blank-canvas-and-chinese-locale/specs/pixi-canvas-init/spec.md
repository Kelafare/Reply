## MODIFIED Requirements

### Requirement: PixiJS Application initialization
系统必须在 WebGL 模式下初始化 PixiJS Application，在初始化前确保容器尺寸有效，并在成功或失败时提供明确的视觉和日志反馈。

#### Scenario: Application starts successfully
- **WHEN** 渲染进程加载且 `initCanvasApp()` 被调用并传入有效 DOM 容器
- **THEN** 创建 WebGL 渲染器的 PixiJS Application 实例
- **AND** Application 的 canvas 元素附加到容器中
- **AND** 控制台输出「画布初始化成功：<宽>×<高>」

#### Scenario: 容器尺寸为零时仍能初始化
- **WHEN** 初始化时容器的 clientWidth 或 clientHeight 为 0
- **THEN** 系统使用兜底尺寸 800×600 继续创建 Application
- **AND** 控制台输出警告提示使用了兜底尺寸

#### Scenario: 初始化失败时显示视觉提示
- **WHEN** `initCanvasApp()` 由于 WebGL 不可用或其他原因失败
- **THEN** 画布容器背景设为 #11111b
- **AND** 容器内显示中文错误提示文字
- **AND** 控制台输出错误详情
