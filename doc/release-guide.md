# Zotero XMnote 插件发布指南

## 📋 概述

本文档介绍 Zotero XMnote 插件的发布流程，包括 GitHub Actions 自动化发布和手动发布操作。

## 🔄 GitHub Actions 自动发布流程

### 触发条件

当推送以 `v` 开头的标签时，会自动触发发布流程：

```bash
git tag v1.6.0
git push origin v1.6.0
```

### 自动化步骤

#### 1. 环境准备

- 运行环境：`ubuntu-latest`
- Node.js 版本：`20`
- 权限：`contents: write`, `issues: write`, `pull-requests: write`

#### 2. 代码检出

```yaml
- name: Checkout
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

#### 3. 依赖安装

```yaml
- name: Install deps
  run: npm install
```

#### 4. 构建插件

```yaml
- name: Build
  run: npm run build
```

- 执行 TypeScript 编译检查
- 生成 `.scaffold/build/` 目录下的构建文件
- 生成 `.xpi` 插件文件

#### 5. 发布到 GitHub

```yaml
- name: Release to GitHub
  run: |
    npm run release
    sleep 1s
```

- 使用 `zotero-plugin-scaffold` 工具
- 自动创建 GitHub Release
- 上传 `.xpi` 文件作为 Release 资产

#### 6. 通知相关 Issue

```yaml
- name: Notify release
  uses: apexskier/github-release-commenter@v1
```

- 在相关 Issue 中自动评论发布信息
- 包含发布标签和链接

## 📦 版本 v1.6.0 发布说明

### 🎯 主要新功能

#### 📂 当前分类导出功能

- **新增**：当前分类导出选项，支持导出当前选中分类下的所有条目
- **智能默认选择**：根据上下文自动选择最合适的导出范围
    - 优先级：选中条目 > 当前分类 > 全部条目
- **动态界面更新**：导出描述文字实时更新，清楚显示将要导出的内容

#### 🔧 技术改进

- **扩展对话框架构**：创建 `ExtendedExportDialog` 类，保持向后兼容
- **分类检测 API**：集成 Zotero 分类检测功能
- **类型系统增强**：支持 "collection" 导出范围的类型定义

### 🎛️ 导出选项说明

| 选项       | 描述             | 优先级 |
|----------|----------------|-----|
| **选定条目** | 导出当前选中的条目      | 最高  |
| **当前分类** | 导出当前选中分类下的所有条目 | 第二  |
| **全部条目** | 导出图书馆中的所有条目    | 默认  |

### 🔄 用户体验改进

- **智能界面**：对话框根据当前上下文自动选择最合适的默认选项
- **实时反馈**：描述文字动态更新，显示将要导出的内容数量
- **无缝集成**：与现有工作流程完全兼容

### 🛠️ 开发者更新

- **模块化设计**：新增 `exportDialogExtended.ts` 模块
- **事件处理优化**：改进 DOM 事件监听和更新机制
- **错误处理增强**：添加更好的类型安全和错误捕获

## 🚀 手动发布操作指南

### 前置条件

1. 确保代码已提交到主分支
2. 更新 `package.json` 中的版本号
3. 测试构建无错误：`npm run build`
4. 通过代码质量检查：`npm run lint:check`

### 发布步骤

#### 方法一：使用 Git 标签（推荐）

```bash
# 1. 确保在主分支
git checkout main
git pull origin main

# 2. 创建标签
git tag v1.6.0

# 3. 推送标签触发自动发布
git push origin v1.6.0

# 4. 等待 GitHub Actions 完成
# 查看进度：https://github.com/Zonezzc/zotero-xmnote/actions
```

#### 方法二：本地构建后手动上传

```bash
# 1. 本地构建
npm run build

# 2. 手动创建 GitHub Release
gh release create v1.6.0 \
  --title "v1.6.0: 当前分类导出与智能选择功能" \
  --notes-file doc/release/v1.6.0-release-notes.md \
  .scaffold/build/zotero-xmnote-plugin.xpi
```

### 验证发布

1. 检查 [GitHub Releases 页面](https://github.com/Zonezzc/zotero-xmnote/releases)
2. 确认 `.xpi` 文件已上传
3. 测试下载和安装

## 📝 发布注意事项

### 版本命名规范

- 遵循语义化版本：`MAJOR.MINOR.PATCH`
- 标签格式：`v1.6.0`
- 发布标题：包含版本号和主要功能

### 发布说明内容

- **主要功能**：列出新增的重要功能
- **改进项目**：性能优化和用户体验改进
- **修复问题**：解决的 Bug 和问题
- **技术细节**：开发者关心的技术更新
- **安装指南**：用户安装和使用说明

### 常见问题

#### Q: GitHub Actions 发布失败怎么办？

A: 检查以下几点：

1. `package.json` 版本号是否更新
2. 构建是否通过：`npm run build`
3. 代码格式是否正确：`npm run lint:check`
4. GitHub Token 权限是否正确

#### Q: 如何更新已发布版本的说明？

A: 有几种方法：

**方法1：GitHub 网页界面**

1. 访问 [GitHub Releases 页面](https://github.com/Zonezzc/zotero-xmnote/releases)
2. 找到对应版本，点击 "Edit release"
3. 修改发布说明后保存

**方法2：命令行工具**

```bash
# 使用文件覆盖发布说明
gh release edit v1.6.0 --notes-file doc/release/v1.6.0-release-notes.md

# 或者直接编辑
gh release edit v1.6.0 --notes "新的发布说明内容"
```

#### Q: 覆盖发布说明后如何恢复？

A: GitHub 不保存发布说明的历史版本，但你可以：

**恢复方法：**

1. **从备份恢复**：使用 `doc/release/` 目录中的备份文件
2. **从 Git 历史恢复**：如果发布说明曾经提交到代码库
3. **重新生成**：使用 `zotero-plugin release` 命令重新生成基础说明

**预防措施：**

- 在 `doc/release/` 目录保留发布说明的备份
- 重要修改前先备份当前说明：

```bash
# 备份当前发布说明
gh release view v1.6.0 --json body -q .body > doc/release/v1.6.0-backup.md
```

#### Q: 如何删除错误的发布？

A: 使用 GitHub CLI：

```bash
gh release delete v1.6.0 --yes
git tag -d v1.6.0
git push origin :refs/tags/v1.6.0
```

## 🔗 相关链接

- [GitHub Actions 工作流](../.github/workflows/release.yml)
- [项目发布页面](https://github.com/Zonezzc/zotero-xmnote/releases)
- [Zotero Plugin Scaffold 文档](https://github.com/windingwind/zotero-plugin-scaffold)
- [语义化版本规范](https://semver.org/lang/zh-CN/)

## 📞 支持

如果在发布过程中遇到问题，请：

1. 检查 [GitHub Actions 日志](https://github.com/Zonezzc/zotero-xmnote/actions)
2. 参考本文档的常见问题部分
3. 在 [GitHub Issues](https://github.com/Zonezzc/zotero-xmnote/issues) 中报告问题

---

**最后更新**：2025-08-21  
**文档版本**：1.0  
**适用插件版本**：v1.6.0+