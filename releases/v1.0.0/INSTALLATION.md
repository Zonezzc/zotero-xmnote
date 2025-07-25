# Zotero XMnote Plugin 安装指南

## 📋 系统要求

- **Zotero 版本**：6.999 或更高版本（建议使用 Zotero 7.x）
- **操作系统**：Windows, macOS, Linux
- **网络**：需要网络连接以访问 XMnote API

## 📦 下载插件

从以下位置下载插件文件：

- 文件名：`zotero-xmnode-plugin.xpi`
- 文件大小：约 56KB

## 🔧 安装步骤

### 方法一：通过插件管理器安装（推荐）

1. **打开 Zotero**
    - 启动 Zotero 应用程序

2. **进入插件管理器**
    - 点击菜单 `Tools` → `Add-ons`
    - 或使用快捷键 `Ctrl+Shift+A` (Windows/Linux) 或 `Cmd+Shift+A` (macOS)

3. **安装插件**
    - 点击右上角的 ⚙️ (齿轮) 按钮
    - 选择 `Install Add-on From File...`
    - 浏览并选择下载的 `zotero-xmnode-plugin.xpi` 文件
    - 点击 `Open`

4. **确认安装**
    - Zotero 会显示插件信息和权限要求
    - 点击 `Install Now` 确认安装

5. **重启 Zotero**
    - 关闭并重新启动 Zotero 以激活插件

### 方法二：拖拽安装

1. **定位插件文件**
    - 在文件管理器中找到下载的 `zotero-xmnode-plugin.xpi` 文件

2. **拖拽安装**
    - 直接将 `.xpi` 文件拖拽到 Zotero 主窗口中
    - Zotero 会自动识别并提示安装

3. **确认安装**
    - 点击 `Install Now`
    - 重启 Zotero

## ✅ 验证安装

安装成功后，你应该能看到：

1. **菜单项**
    - `Tools` 菜单中出现 `Export to XMnote` 选项

2. **右键菜单**
    - 在条目上右键时出现 XMnote 导出选项
    - 在分类上右键时出现分类导出选项

3. **配置面板**
    - `Edit` → `Preferences` → `XMnote` 标签页

4. **插件列表**
    - `Tools` → `Add-ons` 中显示 "Zotero Xmnode Plugin"

## ⚙️ 首次配置

### 配置 XMnote 连接

1. **打开配置面板**
    - 点击 `Edit` → `Preferences`
    - 选择 `XMnote` 标签页

2. **填写连接信息**

   ```
   API 地址: http://your-xmnote-server.com/api
   API 密钥: your-api-key (如果需要)
   ```

3. **测试连接**
    - 点击 `Test Connection` 按钮
    - 确认显示 "Connection successful" 消息

4. **保存设置**
    - 点击 `OK` 保存配置

### 配置导出选项

在配置面板中设置默认导出选项：

- ☑️ **Include Notes**: 导出笔记内容
- ☑️ **Include Annotations**: 导出PDF注释
- ☑️ **Include Metadata**: 导出条目元数据

## 🚨 常见安装问题

### 问题1：无法安装插件

**症状**：提示 "Could not install add-on"
**解决方案**：

- 确认 Zotero 版本符合要求（6.999+）
- 检查插件文件是否完整下载
- 尝试重新下载插件文件

### 问题2：安装后无菜单项

**症状**：安装成功但看不到菜单项
**解决方案**：

- 完全重启 Zotero
- 检查插件是否在 `Tools` → `Add-ons` 中显示为已启用
- 如显示为禁用，点击 `Enable` 启用

### 问题3：配置面板打不开

**症状**：点击 Preferences 时出错
**解决方案**：

- 重启 Zotero
- 检查是否有其他插件冲突
- 临时禁用其他插件测试

### 问题4：权限错误

**症状**：提示权限不足或安全限制
**解决方案**：

- 确认以管理员权限运行 Zotero (Windows)
- 检查防火墙和安全软件设置
- 暂时禁用杀毒软件的实时保护

## 🔄 更新插件

当有新版本发布时：

1. **下载新版本**
    - 下载最新的 `.xpi` 文件

2. **卸载旧版本**
    - `Tools` → `Add-ons`
    - 找到 "Zotero Xmnode Plugin"
    - 点击 `Remove`

3. **安装新版本**
    - 按照上述安装步骤安装新版本
    - 重启 Zotero

4. **恢复配置**
    - 重新配置 XMnote 连接信息
    - 检查导出选项设置

## 🗑️ 卸载插件

如需卸载插件：

1. **打开插件管理器**
    - `Tools` → `Add-ons`

2. **卸载插件**
    - 找到 "Zotero Xmnode Plugin"
    - 点击 `Remove`
    - 确认卸载

3. **重启 Zotero**
    - 重启以完成卸载过程

4. **清理配置**（可选）
    - 配置信息会自动清理
    - 如需手动清理，可重置 Zotero 配置文件

## 📞 技术支持

如果遇到安装问题：

1. **查看日志**
    - `Help` → `Debug Output Logging`
    - 启用日志记录后重现问题

2. **联系支持**
    - GitHub Issues: https://github.com/Zonezzc/zotero-xmnote/issues
    - 提供详细的错误信息和系统环境

3. **社区支持**
    - Zotero 论坛相关讨论
    - GitHub Discussions

---

**提示**：建议在重要工作前先备份 Zotero 数据库！
