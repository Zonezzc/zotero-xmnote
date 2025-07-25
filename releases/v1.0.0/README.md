# Zotero XMnote Plugin v1.0.0

## 📖 插件简介

Zotero XMnote Plugin 是一个专为 Zotero 用户设计的插件，可以将 Zotero 中的文献、笔记和注释同步导出到 XMnote
知识管理系统中，实现跨平台的知识管理和研究工作流整合。

## ✨ 主要功能

### 🎯 选择性导出

- **全量导出**：导出 Zotero 中的所有文献条目
- **选择性导出**：仅导出用户选中的特定条目
- **分类导出**：导出整个 Collection 中的所有条目

### 🚀 多种导出方式

- **工具菜单导出**：通过 Tools → Export to XMnote 打开完整配置对话框
- **右键快速导出**：在条目上右键选择 "Quick Export to XMnote" 快速导出
- **右键配置导出**：在条目上右键选择 "Export to XMnote..." 打开配置对话框
- **分类批量导出**：在 Collection 上右键选择 "Export Collection to XMnote..."

### 📋 灵活的导出选项

- **包含笔记**：导出条目相关的所有笔记内容
- **包含注释**：导出 PDF 阅读时添加的高亮和注释
- **包含元数据**：导出标题、作者、日期等基本信息

### 🔧 智能化体验

- **智能默认选择**：根据用户操作上下文自动选择合适的导出范围
- **实时进度显示**：详细的导出进度追踪和状态反馈
- **错误处理**：完善的错误提示和恢复建议
- **批量处理**：支持大量条目的批量导出处理

## 📦 安装方法

### 方法1：手动安装（推荐）

1. 下载 `zotero-xmnode-plugin.xpi` 文件
2. 打开 Zotero
3. 点击 `Tools` → `Add-ons`
4. 点击右上角的 ⚙️ 按钮
5. 选择 `Install Add-on From File...`
6. 选择下载的 `.xpi` 文件
7. 重启 Zotero

### 方法2：拖拽安装

1. 下载 `zotero-xmnode-plugin.xpi` 文件
2. 直接拖拽到 Zotero 窗口中
3. 点击 `Install Now`
4. 重启 Zotero

## ⚙️ 配置说明

### 首次使用配置

1. 安装插件后，前往 `Edit` → `Preferences` → `XMnote`
2. 配置 XMnote API 连接信息：
    - **API 地址**：输入你的 XMnote 服务器地址
    - **认证信息**：根据需要配置 API 密钥或认证参数
3. 点击 `Test Connection` 验证连接
4. 保存配置

### 导入选项配置

- **Include Notes**：是否导出条目相关的笔记
- **Include Annotations**：是否导出 PDF 注释和高亮
- **Include Metadata**：是否导出条目元数据

## 🎮 使用方法

### 导出全部条目

1. 点击 `Tools` → `Export to XMnote`
2. 选择导出范围为 "All Items"
3. 配置导出选项
4. 点击 `Export`

### 导出选中条目

1. 在 Zotero 中选中想要导出的条目
2. 方法A：右键选择 `Quick Export to XMnote`（使用默认设置）
3. 方法B：右键选择 `Export to XMnote...`（打开配置对话框）
4. 方法C：`Tools` → `Export to XMnote`，系统会自动选择 "Selected Items"

### 导出整个分类

1. 在左侧分类列表中选择要导出的 Collection
2. 右键选择 `Export Collection to XMnote...`
3. 配置导出选项并确认导出

## 🔍 技术特性

- **TypeScript 开发**：类型安全，代码质量高
- **模块化架构**：清晰的代码组织和维护性
- **完善的错误处理**：详细的日志记录和错误恢复
- **批量处理优化**：支持大量数据的高效处理
- **用户体验优化**：智能化的交互设计

## 🐛 已知问题

- 大量条目（>1000）导出时可能需要较长时间，请耐心等待
- 网络连接不稳定时可能导致部分条目导出失败

## 🆘 故障排除

### 连接测试失败

1. 检查 XMnote 服务器地址是否正确
2. 确认网络连接正常
3. 检查防火墙设置
4. 验证 API 认证信息

### 导出失败

1. 查看 Zotero 错误日志：`Help` → `Debug Output Logging`
2. 检查网络连接稳定性
3. 尝试减少批量导出的数量
4. 重启 Zotero 后重试

### 性能问题

- 建议单次导出条目数量不超过 500 个
- 在网络较慢时适当调整批量大小
- 避免在导出过程中进行其他大量 I/O 操作

## 📝 更新日志

### v1.0.0 (2025-07-24)

- ✨ **新功能**：完整的选择性导出功能
- ✨ **新功能**：多种导出触发方式（工具菜单、右键菜单）
- ✨ **新功能**：分类级别的批量导出
- ✨ **新功能**：智能导出范围识别
- ✨ **新功能**：实时进度显示和状态反馈
- 🔧 **改进**：优化用户界面和交互体验
- 🔧 **改进**：完善的错误处理和日志记录
- 🐛 **修复**：解决各种UI显示和功能问题

## 🤝 支持与反馈

如果你在使用过程中遇到问题或有功能建议，欢迎：

1. 查看文档：[项目文档](../doc/)
2. 提交 Issue：[GitHub Issues](https://github.com/Zonezzc/zotero-xmnote/issues)
3. 参与讨论：[GitHub Discussions](https://github.com/Zonezzc/zotero-xmnote/discussions)

## 📄 许可证

本项目采用开源许可证，详见项目根目录的 LICENSE 文件。

## 🙏 致谢

- 感谢 Zotero 团队提供的优秀平台
- 感谢 XMnote 团队的 API 支持
- 感谢所有测试用户的反馈和建议

---

**注意**：本插件仍在积极开发中，欢迎提供反馈和建议！
