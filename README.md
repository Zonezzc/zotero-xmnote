# Zotero XMnote 插件

[![Zotero 7-10](https://img.shields.io/badge/Zotero-7--10-CC2936?style=flat-square&logo=zotero&logoColor=white)](https://www.zotero.org/)
[![CI](https://github.com/Zonezzc/zotero-xmnote/actions/workflows/ci.yml/badge.svg)](https://github.com/Zonezzc/zotero-xmnote/actions/workflows/ci.yml)
[![GitHub Release](https://img.shields.io/github/v/release/Zonezzc/zotero-xmnote?style=flat-square)](https://github.com/Zonezzc/zotero-xmnote/releases)
[![License](https://img.shields.io/github/license/Zonezzc/zotero-xmnote?style=flat-square)](LICENSE)

把 Zotero 中的书目、笔记和 PDF 标注发送到「纸间书摘」的 API 导入列表。

> 这是一个单向导出插件，不是双向同步工具。API 返回成功仅表示数据已进入「纸间书摘」的待确认列表，仍需在 App 中手动确认导入。

**语言**：[简体中文](README.md) | [English](README-en.md)

## 功能

- 支持 Zotero 7、8、9、10
- 导出全部条目、选中条目或当前分类
- 在工具菜单、条目右键菜单和分类右键菜单中快速导出
- 导出标题、作者、译者、出版社、出版日期、ISBN、摘要、标签和分类等元数据
- 导出 Zotero 条目笔记与 PDF 标注
- 可选导出当前阅读位置和估算阅读时长
- 支持批量发送、失败重试、进度提示和逐条错误信息
- 支持完整导入 URL、域名、IPv4、IPv6 与 HTTPS
- 连接测试只发送只读 `OPTIONS` 请求，不创建测试书籍
- 发送前校验纸质书/电子书、位置单位、页码、阅读状态和阅读时长等 API 约束

## 兼容性

| Zotero | 菜单实现                         | 验证状态              |
| ------ | -------------------------------- | --------------------- |
| 7      | `zotero-plugin-toolkit` 兼容路径 | 已验证                |
| 8      | 原生 `Zotero.MenuManager`        | 已验证                |
| 9      | 原生 `Zotero.MenuManager`        | 已验证                |
| 10     | 原生 `Zotero.MenuManager`        | 已通过 GitHub CI 验证 |

插件通过能力检测选择菜单 API，不依赖硬编码版本分支。清单声明的支持范围为 Zotero 7–10。

## 安装

1. 打开 [Releases](https://github.com/Zonezzc/zotero-xmnote/releases)。
2. 下载最新的 `zotero-xmnote-plugin.xpi`。
3. 在 Zotero 中打开 **工具 → 插件**。
4. 点击齿轮按钮，选择 **从文件安装插件**。
5. 选择下载的 `.xpi` 文件并按提示重启 Zotero。

[直接下载最新版本](https://github.com/Zonezzc/zotero-xmnote/releases/latest/download/zotero-xmnote-plugin.xpi)

## 快速开始

### 1. 启动纸间书摘 API 服务

在「纸间书摘」中打开 **API 导入** 页面并启动服务。App 会显示类似下面的地址：

```text
http://xmnote.local:8080/send
http://192.168.1.20:8080/send
```

Zotero 与运行「纸间书摘」的设备需要处于可以互相访问的网络中。

### 2. 配置插件

打开 Zotero 的 **设置/首选项 → XMnote**：

- 推荐把 App 显示的完整导入地址粘贴到 **Server Address / URL**。
- 也可以只填写域名或 IP，再单独填写端口。
- 使用完整 URL 时，单独的端口设置会被忽略。
- 点击 **Test Connection (no data sent)** 检查连通性。该操作不会向待导入列表添加数据。

### 3. 发送数据

可以通过以下入口发送：

- **工具菜单**：发送全部条目或当前选中的条目
- **条目右键菜单**：快速发送，或打开带选项的导出窗口
- **分类右键菜单**：发送当前分类下的条目

插件会显示已被 API 接收和发送失败的数量。部分失败不会再被误报为整体成功。

### 4. 在 App 中确认

发送完成后，打开「纸间书摘」的 **API 导入** 列表检查数据。只有在 App 中手动确认后，数据才会进入正式书库。

## 配置说明

### 服务器

| 设置                 | 说明                      | 默认值          |
| -------------------- | ------------------------- | --------------- |
| Server Address / URL | 完整导入 URL，或域名/IP   | `192.168.1.100` |
| Port                 | 仅在未填写完整 URL 时使用 | `8080`          |
| Timeout              | 请求超时时间（毫秒）      | `30000`         |

### 导出内容

| 选项                     | 说明                               | 默认值 |
| ------------------------ | ---------------------------------- | ------ |
| Include Notes            | 包含 Zotero 条目笔记               | 开启   |
| Include Annotations      | 包含 PDF 标注及评论                | 开启   |
| Include Metadata         | 包含书目元数据、标签和分类         | 开启   |
| Include Current Page     | 有可靠总页数和标注页码时发送当前页 | 开启   |
| Include Reading Duration | 根据笔记时间估算每日阅读时长       | 开启   |

阅读时长来自笔记时间的启发式估算，会作为模糊阅读时长发送，不会冒充精确阅读会话。没有可信来源时，插件不会擅自设置阅读状态。

## 数据与行为边界

- 插件只向纸间书摘 `/send` 接口发送数据，无法读取或删除 App 内已有书籍。
- `code=200` 表示请求已被接收并等待 App 确认，不代表最终导入完成。
- 纸质书使用页码；电子书使用进度或位置，插件会在发送前检查组合是否合法。
- 当前页只在存在总页数和有效标注页码时发送，不再默认伪造为第 1 页。
- Zotero 中没有可靠对应来源的购买信息、书评和阅读状态不会被自动猜测。

## 开发

需要 Node.js 20。

```bash
git clone https://github.com/Zonezzc/zotero-xmnote.git
cd zotero-xmnote
npm install

# 开发模式
npm start

# 构建、格式检查和测试
npm run build
npm run lint:check
npm test
```

主要目录：

- `src/modules/xmnote/`：API 类型、URL、校验与客户端
- `src/modules/zotero/`：Zotero 数据提取与转换
- `src/modules/reading/`：估算阅读时长
- `src/modules/ui/`：菜单、对话框与结果提示
- `test/`：API 契约、数据转换、结果语义和版本兼容测试

## 问题反馈

- [GitHub Issues](https://github.com/Zonezzc/zotero-xmnote/issues)
- 邮箱：zonezzc@foxmail.com

提交问题时请附上 Zotero 版本、插件版本、操作系统以及可公开的错误信息。请勿上传私人笔记、服务器地址或其他敏感数据。

## 许可证

本项目采用 [AGPL-3.0-or-later](LICENSE) 许可证。

## 致谢

- [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template)
- [Zotero Plugin Toolkit](https://github.com/windingwind/zotero-plugin-toolkit)
- Zotero 与纸间书摘的开发者和用户
