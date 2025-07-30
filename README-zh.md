# Zotero XMnote 插件

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/Zonezzc/zotero-xmnote?style=flat-square)](https://github.com/Zonezzc/zotero-xmnote/releases)
[![GitHub](https://img.shields.io/github/license/Zonezzc/zotero-xmnote?style=flat-square)](https://github.com/Zonezzc/zotero-xmnote/blob/main/LICENSE)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

一个强大的 Zotero 插件，与 XMnote 服务器无缝集成，实现高效的数据导出和同步。

**语言版本**: [English](README.md) | [简体中文](README-zh.md)

## ✨ 功能特性

- 🔗 **XMnote 集成**: 与 XMnote 服务器无缝连接，实现数据导出
- 📤 **灵活导出选项**: 支持导出全部条目或选定条目，可自定义导出设置
- ⚙️ **可配置服务器设置**: 简单设置 IP、端口、超时时间等参数
- 🖱️ **右键菜单支持**: 通过右键菜单快速访问集合和条目的导出功能
- 🌍 **多语言支持**: 提供中文和英文界面
- 🎛️ **用户友好的首选项**: 直观的配置面板，支持实时连接测试
- 📊 **批量处理**: 可配置批处理大小和重试机制，适用于大型数据集
- 🔒 **可靠传输**: 内置错误处理和连接验证机制

## 📥 安装方法

### 方法一：从 GitHub Releases 下载（推荐）

1. 访问 [Releases 页面](https://github.com/Zonezzc/zotero-xmnote/releases)
2. 下载最新的 `zotero-xmnote-plugin.xpi` 文件
3. 在 Zotero 中，点击 **工具** → **插件**
4. 点击齿轮图标 ⚙️ → **从文件安装插件**
5. 选择下载的 `.xpi` 文件
6. 重启 Zotero

### 方法二：直接下载

- **直接链接**: [下载 v1.4.1](https://github.com/Zonezzc/zotero-xmnote/releases/download/v1.4.1/zotero-xmnote-plugin.xpi)
- **文件大小**: 54KB
- **SHA256**: `336dedda19d30e72c731c5c0bb661c613309416bcbb08bc386ce4f41458f243e`

## ⚙️ 配置设置

### 初始设置

1. 打开 Zotero 首选项：**编辑** → **首选项**（macOS 用户：**Zotero** → **首选项**）
2. 点击 **XMnote** 标签页
3. 配置服务器设置：

### 服务器设置

| 设置项           | 描述                  | 默认值          | 范围        |
| ---------------- | --------------------- | --------------- | ----------- |
| **IP 地址**      | XMnote 服务器 IP 地址 | `192.168.1.100` | 有效 IP     |
| **端口**         | XMnote 服务器端口     | `8080`          | 1-65535     |
| **超时（毫秒）** | 连接超时时间（毫秒）  | `30000`         | 1000-300000 |

### 导入选项

| 选项           | 描述               | 默认值  |
| -------------- | ------------------ | ------- |
| **包含笔记**   | 导出条目笔记       | ✅ 启用 |
| **包含标注**   | 导出 PDF 标注      | ✅ 启用 |
| **包含元数据** | 导出条目元数据     | ✅ 启用 |
| **批处理大小** | 每批处理的条目数   | `10`    |
| **重试次数**   | 失败请求的重试次数 | `3`     |

### 连接测试

1. 配置服务器设置后，点击 **测试连接**
2. 状态指示器将显示：
   - 🟢 **已连接**: 服务器可访问
   - 🔴 **失败**: 连接失败（请检查设置）
   - 🟡 **测试中**: 连接进行中

## 🚀 使用方法

### 导出全部条目

1. 点击 **工具** → **XMnote** → **导出全部条目**
2. 插件将把您图书馆中的所有条目导出到配置的 XMnote 服务器
3. 进度将在弹出窗口中显示

### 导出选定条目

1. 在 Zotero 图书馆中选择一个或多个条目
2. 点击 **工具** → **XMnote** → **导出选定条目**
3. 仅选定的条目将被导出

### 右键菜单操作

**对于集合：**

1. 在图书馆面板中右键点击任意集合
2. 从右键菜单中选择 **导出到 XMnote**
3. 集合中的所有条目将被导出

**对于条目：**

1. 在中央面板中右键点击任意条目
2. 从右键菜单中选择 **导出到 XMnote**
3. 选定的条目将被导出

## 🔧 技术详情

### 系统要求

- **Zotero 版本**: 7.0 或更高版本
- **操作系统**: Windows、macOS、Linux
- **网络**: 能够访问 XMnote 服务器（局域网或互联网）

### 插件信息

- **插件 ID**: `zotero-xmnote`
- **版本**: 1.0.0
- **许可证**: AGPL-3.0-or-later
- **架构**: 事件驱动、模块化设计

### 数据格式

插件以结构化格式导出 Zotero 条目，包括：

- **书目元数据**（标题、作者、出版详情）
- **条目笔记**（如果启用）
- **PDF 标注**（如果启用且可用）
- **标签和集合**信息
- **文件附件**元数据

## 🛠️ 开发

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/Zonezzc/zotero-xmnote.git
cd zotero-xmnote

# 安装依赖
npm install

# 开发构建（热重载）
npm start

# 生产构建
npm run build
```

### 项目结构

- `src/` - TypeScript 源代码
- `addon/` - 静态插件文件（清单、首选项界面、本地化）
- `releases/` - 发布包和文档

## 🤝 贡献

欢迎贡献！请随时提交问题、功能请求或拉取请求。

### 开发设置

1. Fork 此仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 进行更改并彻底测试
4. 提交更改：`git commit -am 'Add your feature'`
5. 推送到分支：`git push origin feature/your-feature`
6. 提交拉取请求

## 📞 支持

- **问题反馈**: [GitHub Issues](https://github.com/Zonezzc/zotero-xmnote/issues)
- **项目文档**: [项目 Wiki](https://github.com/Zonezzc/zotero-xmnote/wiki)
- **邮箱**: zonezzc@foxmail.com

## 📄 许可证

本项目采用 AGPL-3.0-or-later 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 基于 [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template) 构建
- 由 [Zotero Plugin Toolkit](https://github.com/windingwind/zotero-plugin-toolkit) 提供支持
- 感谢 Zotero 开发团队提供出色的扩展性框架

---

⭐ **如果这个插件对您有帮助，请考虑在 GitHub 上给它加星！**
