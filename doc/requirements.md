# Zotero-XMnote 插件需求文档

## 项目概述

开发一个Zotero插件，用于将Zotero中的笔记和评论数据导入到XMnote中，实现两个知识管理工具之间的数据同步。

## 功能需求

### 1. 核心功能

#### 1.1 数据导出

- **笔记导出**：提取Zotero中的所有笔记内容
- **评论导出**：提取Zotero中的所有评论内容
- **注释导出**：提取PDF标注、高亮等注释信息
- **元数据导出**：包含文献信息、标签、分类等元数据

#### 1.2 数据转换

- 将Zotero数据格式转换为XMnote API要求的格式
- 保持数据结构的完整性和关联性
- 支持富文本格式转换
- 处理图片、链接等附件内容

#### 1.3 数据导入

- 通过XMnote API将数据导入到XMnote
- 支持批量导入和增量导入
- 提供导入进度显示
- 错误处理和重试机制

### 2. 配置管理

#### 2.1 XMnote服务器配置

- **IP地址设置**：支持动态IP配置
- **端口设置**：可配置API端口
- **认证信息**：存储API密钥或认证令牌
- **连接测试**：验证XMnote服务器连接状态

#### 2.2 导入选项配置

- **数据范围选择**：可选择导入的数据类型
- **时间范围筛选**：支持按时间筛选数据
- **分类筛选**：支持按Zotero分类筛选
- **覆盖策略**：处理重复数据的策略

### 3. 用户界面

#### 3.1 设置面板

- 集成到Zotero首选项中
- 提供XMnote服务器配置界面
- 提供导入选项配置界面
- 提供连接测试功能

#### 3.2 操作界面

- 在Zotero工具栏添加导入按钮
- 右键菜单集成导入选项
- 进度显示窗口
- 结果反馈界面

### 4. 数据处理

#### 4.1 数据提取

- 遍历Zotero数据库获取相关数据
- 解析笔记内容和格式
- 提取附件和引用关系
- 处理特殊字符和编码

#### 4.2 数据映射

- Zotero条目类型到XMnote类型的映射
- 字段名称和格式的映射
- 标签和分类的映射
- 日期格式的标准化

## 技术需求

### 1. 开发环境

- 基于Zotero Plugin Template
- TypeScript + Node.js
- Zotero Plugin Toolkit
- ESLint + Prettier代码规范

### 2. API集成

- 支持XMnote导入API调用
- HTTP客户端实现
- JSON数据序列化
- 错误处理和重试机制

### 3. 数据存储

- 配置信息的本地存储
- 导入历史记录
- 缓存机制优化性能

### 4. 安全性

- API密钥的安全存储
- HTTPS通信加密
- 输入验证和清理
- 错误信息脱敏

## 性能需求

### 1. 响应性能

- 界面操作响应时间 < 200ms
- API调用超时时间可配置
- 支持大量数据的分批处理

### 2. 稳定性

- 异常情况的优雅处理
- 网络中断的自动重连
- 数据完整性验证
- 内存使用优化

## 兼容性需求

### 1. Zotero版本

- 支持Zotero 6.0+
- 兼容Windows、macOS、Linux

### 2. XMnote版本

- 根据API文档确定支持的版本
- 向前兼容考虑

## 用户体验需求

### 1. 易用性

- 简洁明了的配置界面
- 清晰的操作流程指引
- 友好的错误提示信息
- 多语言支持（中英文）

### 2. 可靠性

- 导入进度实时显示
- 详细的操作日志
- 数据备份和恢复选项
- 操作撤销功能

## 交付需求

### 1. 代码交付

- 完整的插件源代码
- 详细的代码文档
- 单元测试和集成测试
- 构建和发布脚本

### 2. 文档交付

- 用户使用手册
- 开发者文档
- API接口文档
- 故障排除指南

### 3. 部署交付

- 可安装的插件包
- 自动更新机制
- 版本发布说明
- 技术支持文档

  🎮 用户使用方式

  方式1：工具菜单
  - 点击 "Tools" → "Export to XMnote"
  - 可以选择导出范围（全部或预选条目）

  方式2：右键菜单（新增）
  - 在条目上右键 → "Quick Export to XMnote" （快速导出）
  - 在条目上右键 → "Export to XMnote..." （打开对话框）
  - 在分类上右键 → "Export Collection to XMnote..."

  方式3：预选条目
  - 先选中想要导出的条目
  - 通过任何方式打开导出对话框
  - 自动检测并默认选择"Selected Items"

  插件现在已经支持完整的选择性导出功能！用户可以根据需要选择导出所有条目或特定条目，并且有多种便捷的触发方式。
