## MODIFIED Requirements

### Requirement: Property panel displays selected item data
系统必须在右侧属性面板中显示选中元素的 `baseTransform` 属性，字段标签使用中文。

#### Scenario: Select item shows properties
- **WHEN** 画布上选中一个元素
- **THEN** 属性面板显示带中文标签的输入字段：「X 坐标」「Y 坐标」「宽度」「高度」「旋转角度」「不透明度」
- **AND** 每个字段预填元素当前的 `baseTransform` 值
