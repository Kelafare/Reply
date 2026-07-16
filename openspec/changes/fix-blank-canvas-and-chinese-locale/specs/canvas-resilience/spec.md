## ADDED Requirements

### Requirement: 画布容器非零尺寸保障
系统必须在 PixiJS 初始化前确保画布容器具有非零的宽度和高度。

#### Scenario: Flex 布局中的容器获得实际尺寸
- **WHEN** 渲染进程加载且画布容器位于 flex 布局中
- **THEN** 容器使用绝对定位（`position:absolute; inset:0`）绑定到父元素
- **AND** 父元素设置为 `position:relative`
- **AND** 容器在任何布局时机下都拥有非零像素尺寸

### Requirement: 画布容器深色兜底背景
系统必须在画布容器上设置深色背景色（#11111b），作为 PixiJS 画布渲染前的视觉兜底。

#### Scenario: PixiJS 未初始化时显示深色背景
- **WHEN** 应用窗口打开但 PixiJS 尚未完成初始化
- **THEN** 画布区域显示深色背景（#11111b）而非白色

### Requirement: 画布初始化失败可视化提示
系统必须在 PixiJS 初始化失败时，在画布区域显示中文错误提示文字。

#### Scenario: WebGL 不可用时显示错误提示
- **WHEN** `initCanvasApp()` 抛出异常
- **THEN** 画布容器内显示中文提示：「画布初始化失败，请检查 WebGL 支持」
- **AND** 错误详情输出到浏览器控制台

### Requirement: 画布初始化成功日志
系统必须在 PixiJS 画布成功初始化后，在控制台输出画布实际尺寸。

#### Scenario: 初始化成功后输出尺寸日志
- **WHEN** `initCanvasApp()` 成功完成
- **THEN** 控制台输出格式为「画布初始化成功：<宽度>×<高度>」的日志
