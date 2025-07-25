# 特定条目导出功能设计方案

## 概述

设计一个允许用户选择特定Zotero条目进行导出到XMnote的功能，提供灵活的条目选择方式和直观的用户界面。

## 用户需求分析

### 核心需求

- 用户希望能够选择特定的一个或多个Zotero条目进行导出
- 需要提供多种选择条目的方式
- 保持现有的导出选项（包含笔记、注释、元数据）
- 提供清晰的条目预览和确认界面

### 使用场景

1. **单条目导出**: 用户正在阅读某本书，希望立即将其导出到XMnote
2. **批量选择导出**: 用户希望导出某个项目相关的多个文献
3. **分类导出**: 用户希望按标签、分类或时间范围导出特定条目
4. **右键快速导出**: 在条目列表中直接右键导出选中条目

## 功能设计方案

### 方案1：增强现有对话框 (推荐)

#### 触发方式

1. **工具菜单**: 保留现有的"Export to XMnote"入口，打开增强版对话框
2. **右键菜单**: 在条目列表中添加"Export to XMnote"右键菜单项
3. **快捷键**: 支持键盘快捷键快速导出选中条目

#### 界面设计

```
┌─────────────────────────────────────────────────────────┐
│                Export to XMnote                        │
├─────────────────────────────────────────────────────────┤
│ Export Scope                                            │
│ ○ All Items (current:全部导出)                         │
│ ● Selected Items (if items are pre-selected)           │
│ ○ Custom Selection                                      │
├─────────────────────────────────────────────────────────┤
│ [Custom Selection Panel - shown when selected]         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Search: [________________] [🔍]                     │ │
│ │ Filters: [Type▼] [Collection▼] [Tags▼] [Date▼]     │ │
│ │                                                     │ │
│ │ Available Items:                    Selected:       │ │
│ │ ┌─────────────────────────┐ ┌─────────────────────┐ │ │
│ │ │☐ Book Title 1          │ │☑ Selected Book 1   │ │ │
│ │ │☐ Article Title 2       │ │☑ Selected Book 2   │ │ │
│ │ │☐ Chapter Title 3       │ │                     │ │ │
│ │ │...                     │ │                     │ │ │
│ │ └─────────────────────────┘ └─────────────────────┘ │ │
│ │ [Select All] [Clear All]        [Remove Selected]  │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Export Options                                          │
│ ☑ Include Notes                                         │
│ ☑ Include Annotations                                   │
│ ☑ Include Metadata                                      │
├─────────────────────────────────────────────────────────┤
│ Preview: 3 items selected, estimated 15 notes,         │
│ 42 annotations to export                                │
├─────────────────────────────────────────────────────────┤
│              [Preview] [Export] [Cancel]                │
└─────────────────────────────────────────────────────────┘
```

#### 核心组件

1. **ExportScopeSelector**: 导出范围选择器
    - All Items: 导出所有条目
    - Selected Items: 导出预选条目（如果有的话）
    - Custom Selection: 自定义选择

2. **ItemSelector**: 条目选择器
    - 搜索框：支持标题、作者、关键词搜索
    - 筛选器：按类型、分类、标签、日期筛选
    - 双列表选择：左侧可选，右侧已选
    - 批量操作：全选、清空、移除

3. **ItemPreview**: 条目预览
    - 显示选中条目数量
    - 预估导出的笔记和注释数量
    - 显示预计导出数据大小

### 方案2：右键快速导出

#### 实现方式

在Zotero条目列表的右键菜单中添加快速导出选项：

```
Right-click menu:
├─ Edit Item
├─ Show File
├─ Export Item...
├─ Create Bibliography...
├─ ────────────────────
├─ Export to XMnote      (新增)
│  ├─ Quick Export       (使用默认设置)
│  └─ Export with Options... (打开配置对话框)
└─ ────────────────────
```

#### 快速导出流程

1. 用户右键选中的条目
2. 点击"Quick Export"
3. 使用上次保存的导出设置（或默认设置）
4. 直接开始导出，显示进度

### 方案3：分类导出入口

#### Collection级别导出

在Zotero的分类（Collection）上右键添加导出选项：

```
Collection右键菜单:
├─ New Collection
├─ Edit...
├─ Export Collection...
├─ ────────────────────
├─ Export to XMnote     (新增)
└─ ────────────────────
```

## 技术实现方案

### 数据结构

```typescript
interface SelectiveExportOptions extends ExportOptions {
  exportScope: "all" | "selected" | "custom";
  selectedItemIds?: number[];
  searchQuery?: string;
  filters?: {
    itemTypes?: string[];
    collections?: string[];
    tags?: string[];
    dateRange?: {
      from?: Date;
      to?: Date;
    };
  };
}

interface ItemSelectionData {
  available: ZoteroItem[];
  selected: ZoteroItem[];
  searchQuery: string;
  filters: FilterState;
}
```

### 核心类设计

```typescript
// 条目选择器
class ItemSelector {
  private items: ZoteroItem[] = [];
  private selectedItems: Set<number> = new Set();
  private filters: FilterState = {};

  async loadItems(query?: string, filters?: FilterState): Promise<ZoteroItem[]>;

  selectItem(itemId: number): void;

  deselectItem(itemId: number): void;

  getSelectedItems(): ZoteroItem[];

  applyFilters(filters: FilterState): void;

  search(query: string): void;
}

// 增强的导出对话框
class SelectiveExportDialog extends ExportDialog {
  private itemSelector: ItemSelector;
  private exportScope: "all" | "selected" | "custom" = "all";

  static async showForItems(preSelectedItems?: ZoteroItem[]): Promise<void>;

  private async setupItemSelector(): Promise<void>;

  private handleScopeChange(scope: string): void;

  private async updatePreview(): Promise<void>;
}

// 右键菜单处理器
class ContextMenuHandler {
  static registerItemContextMenu(): void;

  static registerCollectionContextMenu(): void;

  static async handleQuickExport(items: ZoteroItem[]): Promise<void>;

  static async handleExportWithOptions(items: ZoteroItem[]): Promise<void>;
}
```

### 用户体验设计

#### 智能默认选择

1. **有预选条目时**: 默认选择"Selected Items"
2. **从右键菜单进入**: 自动选择触发的条目
3. **从Collection进入**: 自动筛选该Collection的条目
4. **记忆用户偏好**: 保存上次使用的导出范围和选项

#### 性能优化

1. **分页加载**: 大量条目时分页显示
2. **虚拟滚动**: 支持大列表的流畅滚动
3. **延迟搜索**: 搜索输入防抖处理
4. **缓存筛选结果**: 避免重复查询

#### 用户反馈

1. **实时预览**: 显示选中条目的统计信息
2. **进度指示**: 清晰的导出进度显示
3. **错误处理**: 友好的错误提示和恢复建议
4. **操作确认**: 重要操作前的确认提示

## 实现优先级

### Phase 1: 基础功能 (高优先级)

- [ ] 增强现有导出对话框，添加导出范围选择
- [ ] 实现基础的条目选择器
- [ ] 添加右键菜单快速导出

### Phase 2: 高级功能 (中优先级)

- [ ] 实现搜索和筛选功能
- [ ] 添加条目预览和统计
- [ ] 支持Collection级别导出

### Phase 3: 优化功能 (低优先级)

- [ ] 性能优化和虚拟滚动
- [ ] 高级筛选选项
- [ ] 导出模板和批量配置

## 配置存储

```typescript
interface SelectiveExportConfig {
   defaultExportScope: "all" | "selected" | "custom";
  rememberLastSelection: boolean;
  enableQuickExport: boolean;
  defaultFilters: FilterState;
  itemsPerPage: number;
}
```

## 国际化支持

需要添加的本地化字符串：

- 导出范围选择标签
- 搜索和筛选界面文本
- 右键菜单项文本
- 状态和错误消息

## 总结

这个设计方案提供了三种主要的条目选择方式：

1. **增强对话框**: 提供完整的选择和配置功能
2. **右键快速导出**: 提供便捷的快速操作
3. **分类导出**: 支持整个Collection的批量导出

通过这种设计，用户可以根据不同的使用场景选择最合适的导出方式，既保持了原有功能的简单性，又提供了强大的条目选择能力。
