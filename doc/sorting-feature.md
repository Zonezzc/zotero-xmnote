# 书籍按笔记数量排序功能

## 功能概述

XMnote 插件现在支持在导入时按笔记内容量智能排序，优先导入笔记和注释最多的书籍。这让您能够优先处理内容最丰富的资料。

## 排序选项

### 排序类型 (sortBy)

- **`totalContent`** (默认): 按笔记数 + 注释数的总和排序
- **`noteCount`**: 仅按笔记数量排序
- **`annotationCount`**: 仅按注释数量排序
- **`title`**: 按书名字母顺序排序
- **`dateAdded`**: 按添加到 Zotero 的时间排序
- **`none`**: 不排序，保持原始顺序

### 排序方向 (sortOrder)

- **`desc`** (默认): 降序，内容最多的排在前面
- **`asc`**: 升序，内容最少的排在前面

## 使用场景

### 1. 学术研究
优先导入您已经深度阅读和标注的核心文献：
```
排序: totalContent (降序)
结果: 注释最多的论文和书籍优先导入
```

### 2. 读书笔记整理
重点关注您记录了大量笔记的书籍：
```
排序: noteCount (降序) 
结果: 笔记最多的书籍优先处理
```

### 3. PDF 高亮复习
专注于您做了大量高亮标注的材料：
```
排序: annotationCount (降序)
结果: 高亮标注最多的 PDF 优先导入
```

## 技术实现

### 数据统计
在数据提取阶段，插件会自动统计每个条目的：
- 笔记数量 (`noteCount`)
- 注释数量 (`annotationCount`) 
- 总内容量 (`totalContent = noteCount + annotationCount`)

### 排序逻辑
```typescript
// 默认配置：内容丰富的书籍优先
{
  sortBy: "totalContent",
  sortOrder: "desc"
}
```

### 日志信息
导出过程中会显示排序结果：
```
Sorting 50 items by totalContent in desc order
First item: "深度学习" (15 notes, 47 annotations)
Top items by content:
  1. "深度学习": 62 total (15 notes + 47 annotations)
  2. "机器学习实战": 38 total (12 notes + 26 annotations)
  3. "Python数据分析": 28 total (8 notes + 20 annotations)
```

## 性能考虑

- 排序在数据提取后进行，不影响 Zotero 数据库查询性能
- 笔记和注释统计只在需要时计算
- 大型库（>1000 条目）的排序时间通常 < 100ms

## 兼容性

- 保持与现有导出功能完全兼容
- 如果不指定排序选项，默认按内容量降序排列
- 可通过 `sortBy: "none"` 禁用排序功能

## 开发者接口

```typescript
// 在代码中使用排序功能
const exportOptions: ExportOptions = {
  sortBy: "totalContent",     // 排序类型
  sortOrder: "desc",          // 排序方向
  includeNotes: true,         // 包含笔记
  includeAnnotations: true    // 包含注释
};

await exporter.export(exportOptions);
```

## 未来增强

计划中的改进包括：
- 按内容质量排序（基于笔记长度）
- 按最后修改时间排序
- 自定义权重配置（笔记权重 vs 注释权重）
- 用户界面中的排序选项设置