# 示例代码管理文档

## 概述

本文档记录了在开发Zotero-XMnote插件过程中对模板示例代码的处理方式。为了避免示例功能干扰插件开发，我们暂时禁用了所有示例功能，但保留了代码以供后续学习和参考。

## 已禁用的示例功能

### 1. hooks.ts 中禁用的功能

#### 1.1 启动时的示例注册

**位置**: `onStartup()` 函数
**禁用的功能**:

- `BasicExampleFactory.registerPrefs()` - 示例首选项注册
- `BasicExampleFactory.registerNotifier()` - 示例通知器注册
- `KeyExampleFactory.registerShortcuts()` - 示例快捷键注册
- `UIExampleFactory.registerExtraColumn()` - 示例额外列注册
- `UIExampleFactory.registerExtraColumnWithCustomCell()` - 示例自定义单元格列注册
- `UIExampleFactory.registerItemPaneCustomInfoRow()` - 示例条目面板自定义信息行
- `UIExampleFactory.registerItemPaneSection()` - 示例条目面板区域
- `UIExampleFactory.registerReaderItemPaneSection()` - 示例阅读器条目面板区域

#### 1.2 主窗口加载时的示例UI

**位置**: `onMainWindowLoad(win)` 函数
**禁用的功能**:

- `UIExampleFactory.registerStyleSheet(win)` - 示例样式表注册
- `UIExampleFactory.registerRightClickMenuItem()` - 示例右键菜单项
- `UIExampleFactory.registerRightClickMenuPopup(win)` - 示例右键菜单弹出
- `UIExampleFactory.registerWindowMenuWithSeparator()` - 示例窗口菜单分隔符
- `PromptExampleFactory.registerNormalCommandExample()` - 示例普通命令
- `PromptExampleFactory.registerAnonymousCommandExample(win)` - 示例匿名命令
- `PromptExampleFactory.registerConditionalCommandExample()` - 示例条件命令
- `addon.hooks.onDialogEvents("dialogExample")` - 示例对话框事件

#### 1.3 事件处理器

**位置**: 各种事件处理函数
**禁用的功能**:

- `onNotify()` 中的 `BasicExampleFactory.exampleNotifierCallback()` - 示例通知回调
- `onShortcuts()` 中的所有快捷键回调函数
- `onDialogEvents()` 中的所有对话框事件处理

### 2. 保留的示例代码文件

以下文件完全保留，未做任何修改：

- `src/modules/examples.ts` - 包含所有示例工厂类的完整实现
- `src/modules/preferenceScript.ts` - 示例首选项脚本
- `addon/content/preferences.xhtml` - 示例首选项界面
- `addon/content/zoteroPane.css` - 示例样式表

## 示例功能详细说明

### BasicExampleFactory 类

- **registerPrefs()** - 注册插件首选项面板
- **registerNotifier()** - 注册Zotero事件通知器
- **exampleNotifierCallback()** - 示例通知回调，显示"Open Tab Detected!"消息

### KeyExampleFactory 类

- **registerShortcuts()** - 注册快捷键 Shift+L 和 Shift+S
- **exampleShortcutLargerCallback()** - 显示"Larger!"消息
- **exampleShortcutSmallerCallback()** - 显示"Smaller!"消息

### UIExampleFactory 类

- **registerStyleSheet()** - 注册CSS样式表，添加"makeItRed"类
- **registerRightClickMenuItem()** - 添加右键菜单项
- **registerRightClickMenuPopup()** - 添加右键菜单弹出
- **registerWindowMenuWithSeparator()** - 在文件菜单添加分隔符和菜单项
- **registerExtraColumn()** - 添加额外的条目列表列
- **registerExtraColumnWithCustomCell()** - 添加带自定义单元格的列
- **registerItemPaneCustomInfoRow()** - 添加条目面板自定义信息行
- **registerItemPaneSection()** - 添加条目面板区域
- **registerReaderItemPaneSection()** - 添加阅读器条目面板区域

### PromptExampleFactory 类

- **registerNormalCommandExample()** - 注册普通命令示例
- **registerAnonymousCommandExample()** - 注册匿名搜索命令
- **registerConditionalCommandExample()** - 注册条件命令示例

### HelperExampleFactory 类

- **dialogExample()** - 显示示例对话框
- **clipboardExample()** - 剪贴板操作示例
- **filePickerExample()** - 文件选择器示例
- **progressWindowExample()** - 进度窗口示例
- **vtableExample()** - 虚拟表格示例

## 恢复示例功能的方法

### 完全恢复

如需恢复所有示例功能，只需要：

1. 在 `src/hooks.ts` 中删除所有注释标记（`//`）
2. 取消注释所有被禁用的函数调用

### 选择性恢复

如需恢复特定功能：

1. 找到对应的注释行
2. 删除行首的 `// ` 注释标记
3. 确保相关的工厂类方法可用

### 示例恢复代码模板

```typescript
// 恢复基础示例功能
BasicExampleFactory.registerPrefs();
BasicExampleFactory.registerNotifier();

// 恢复UI示例功能
UIExampleFactory.registerRightClickMenuItem();
UIExampleFactory.registerWindowMenuWithSeparator();

// 恢复快捷键示例功能
KeyExampleFactory.registerShortcuts();
```

## 开发完成后的清理计划

### 第一阶段：验证功能完整性

1. 确认XMnote插件所有功能正常工作
2. 进行完整的功能测试
3. 确认不再需要示例代码

### 第二阶段：删除示例代码

1. 删除 `src/modules/examples.ts` 文件
2. 从 `src/hooks.ts` 中删除：
   - 示例工厂类的import语句
   - 所有被注释的示例函数调用
   - 相关的事件处理器代码
3. 删除示例相关的资源文件：
   - `addon/content/preferences.xhtml`（如果不用于实际配置）
   - `addon/content/zoteroPane.css`（如果不包含实际样式）

### 第三阶段：清理配置文件

1. 检查并清理 `package.json` 中的示例相关配置
2. 清理本地化文件中的示例字符串
3. 更新项目文档

## 注意事项

1. **保持谨慎**: 在删除示例代码前，确保理解每个示例的功能
2. **逐步删除**: 建议分阶段删除，避免意外破坏插件功能
3. **备份代码**: 删除前创建备份，以防需要参考示例实现
4. **测试验证**: 每次删除后都要进行完整测试

## 当前状态

- ✅ 已禁用所有示例功能的调用
- ✅ 保留了所有示例代码文件
- ✅ 添加了详细的注释说明
- ✅ 插件可以正常启动（无示例功能干扰）
- ⏳ 待开发完成后执行清理计划

## 修改历史

| 日期       | 操作         | 说明                             |
| ---------- | ------------ | -------------------------------- |
| 2025-01-24 | 禁用示例功能 | 注释掉hooks.ts中所有示例功能调用 |
| 2025-01-24 | 创建管理文档 | 记录示例代码管理策略和恢复方法   |
