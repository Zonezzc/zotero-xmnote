# 书籍按笔记数量排序功能

## 功能概述

XMnote 插件现在支持在导入时按笔记内容量智能排序，**先导入笔记少的书籍，最后导入笔记最多的书籍**。这种策略让您能够先处理简单的内容，把最有价值、内容最丰富的资料留到最后细品。

## 排序选项

### 排序类型 (sortBy)

- **`totalContent`** (默认): 按笔记数 + 注释数的总和排序
- **`noteCount`**: 仅按笔记数量排序
- **`annotationCount`**: 仅按注释数量排序
- **`title`**: 按书名字母顺序排序
- **`dateAdded`**: 按添加到 Zotero 的时间排序
- **`none`**: 不排序，保持原始顺序

### 排序方向 (sortOrder)

- **`asc`** (默认): 升序，笔记少的先导入，笔记多的最后导入
- **`desc`**: 降序，内容最多的排在前面（立即导入重点内容）

## 使用场景

### 1. 渐进式学习

先从简单内容开始，逐步深入到复杂的核心文献：

```
排序: totalContent (升序，默认)
结果: 笔记少的书籍先导入，重点资料最后导入
```

### 2. 时间管理

把最有价值的内容留到精力最充沛的时候处理：

```
排序: noteCount (升序)
结果: 简单材料先处理，重点笔记书籍留到最后
```

### 3. 研究优先级

确保最重要的研究资料能得到充分关注：

```
排序: annotationCount (升序)
结果: 高亮标注最多的 PDF 最后导入（重点关注）
```

### 4. 立即访问重点内容（降序模式）

如果需要立即访问最重要的内容：

```
排序: totalContent (降序)
结果: 内容最丰富的资料立即导入
```

## 技术实现

### 数据统计

在数据提取阶段，插件会自动统计每个条目的：

- 笔记数量 (`noteCount`)
- 注释数量 (`annotationCount`)
- 总内容量 (`totalContent = noteCount + annotationCount`)

### 排序逻辑

```typescript
// 默认配置：笔记少的书籍先导入，笔记多的最后导入
{
  sortBy: "totalContent",
  sortOrder: "asc"
}
```

### 日志信息

导出过程中会显示排序结果：

```
Sorting 50 items by totalContent in asc order
First item (imported first): "简单入门书" (1 note, 2 annotations)
Last item (imported last): "深度学习" (15 notes, 47 annotations)

Items imported first (less content):
  1. "简单入门书": 3 total (1 notes + 2 annotations)
  2. "基础教程": 5 total (2 notes + 3 annotations)
  3. "快速指南": 8 total (3 notes + 5 annotations)

Items imported last (more content):
  48. "机器学习实战": 38 total (12 notes + 26 annotations)
  49. "Python数据分析": 45 total (18 notes + 27 annotations)
  50. "深度学习": 62 total (15 notes + 47 annotations)
```

## 性能考虑

- 排序在数据提取后进行，不影响 Zotero 数据库查询性能
- 笔记和注释统计只在需要时计算
- 大型库（>1000 条目）的排序时间通常 < 100ms

## 兼容性

- 保持与现有导出功能完全兼容
- 如果不指定排序选项，默认按内容量升序排列（笔记少的先导入）
- 可通过 `sortBy: "none"` 禁用排序功能
- 可通过 `sortOrder: "desc"` 改为降序（立即导入重点内容）

## 开发者接口

```typescript
// 在代码中使用排序功能
const exportOptions: ExportOptions = {
  sortBy: "totalContent", // 排序类型
  sortOrder: "asc", // 排序方向（默认：笔记少的先导入）
  includeNotes: true, // 包含笔记
  includeAnnotations: true, // 包含注释
};

await exporter.export(exportOptions);
```

## 未来增强

计划中的改进包括：

- 按内容质量排序（基于笔记长度）
- 按最后修改时间排序
- 自定义权重配置（笔记权重 vs 注释权重）
- 用户界面中的排序选项设置
