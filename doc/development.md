# Zotero-XMnote 插件开发文档

## 项目架构

### 核心模块设计

基于Zotero Plugin Template的架构，本插件将实现以下模块：

```
src/
├── addon.ts                 # 主插件类，管理生命周期
├── hooks.ts                 # 事件钩子处理
├── index.ts                 # 插件入口点
├── modules/
│   ├── xmnote/
│   │   ├── api.ts           # XMnote API客户端
│   │   ├── exporter.ts      # 数据导出核心逻辑
│   │   ├── transformer.ts   # 数据格式转换器
│   │   └── ui.ts           # 用户界面组件
│   ├── zotero/
│   │   ├── database.ts      # Zotero数据库访问
│   │   ├── items.ts         # 条目数据提取
│   │   └── notes.ts         # 笔记数据提取
│   └── config/
│       ├── settings.ts      # 配置管理
│       └── preferences.ts   # 首选项面板
└── utils/
    ├── logger.ts            # 日志记录
    ├── validator.ts         # 数据验证
    └── network.ts           # 网络工具
```

### 技术架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Zotero UI     │    │  Plugin Core    │    │   XMnote API    │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Menu Items  │◄┼────┼►│ UI Handler  │ │    │ │ HTTP Client │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Preferences │◄┼────┼►│ Config Mgr  │ │    │ │ Data Import │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          ▲                        │
          │                        ▼
┌─────────────────┐    ┌─────────────────┐
│ Zotero Database │    │ Data Transformer│
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Items       │◄┼────┼►│ Converter   │ │
│ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Notes       │◄┼────┼►│ Validator   │ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
```

## 开发计划

### 第一阶段：基础框架搭建

1. **配置管理模块**
   - 实现XMnote服务器配置存储
   - 添加首选项面板
   - 实现配置验证和连接测试

2. **API客户端模块**
   - 实现HTTP客户端
   - 封装XMnote API调用
   - 实现错误处理和重试机制

### 第二阶段：数据提取与转换

1. **Zotero数据提取**
   - 实现条目数据提取
   - 实现笔记数据提取
   - 实现附件和注释提取

2. **数据格式转换**
   - 映射Zotero数据结构到XMnote格式
   - 实现富文本格式处理
   - 实现数据验证

### 第三阶段：用户界面与导入功能

1. **用户界面**
   - 添加工具栏按钮
   - 实现进度显示窗口
   - 添加右键菜单选项

2. **导入功能**
   - 实现批量导入
   - 实现增量导入
   - 添加导入日志和结果反馈

### 第四阶段：优化与测试

1. **性能优化**
   - 实现数据分批处理
   - 优化内存使用
   - 实现缓存机制

2. **测试与调试**
   - 单元测试
   - 集成测试
   - 错误处理测试

## 核心API设计

### 1. XMnote API客户端

```typescript
interface XMnoteApiClient {
  // 配置管理
  configure(config: XMnoteConfig): void;
  testConnection(): Promise<boolean>;

  // 数据导入
  importNote(note: XMnoteNote): Promise<ImportResult>;
  batchImport(notes: XMnoteNote[]): Promise<BatchImportResult>;
}

interface XMnoteConfig {
  ip: string;
  port: number;
  timeout?: number;
}

interface XMnoteNote {
  title: string; // 必填：书名
  type: 0 | 1; // 必填：书籍类型
  locationUnit: 0 | 1 | 2; // 必填：页码类型
  bookSummary?: string; // 选填：内容简介
  cover?: string; // 选填：书籍封面
  author?: string; // 选填：作者
  authorIntro?: string; // 选填：作者简介
  translator?: string; // 选填：译者
  publisher?: string; // 选填：出版社
  publishDate?: number; // 选填：出版日期
  isbn?: string; // 选填：ISBN
  totalPageCount?: number; // 选填：总页码
  currentPage?: number; // 选填：当前阅读位置
  rating?: number; // 选填：评分
  readingStatus?: 1 | 2 | 3 | 4; // 选填：阅读状态
  readingStatusChangedDate?: number; // 选填：状态变更日期
  group?: string; // 选填：分组
  tags?: string[]; // 选填：标签
  source?: string; // 选填：来源
  purchaseDate?: number; // 选填：购买日期
  purchasePrice?: number; // 选填：购买价格
  entries?: XMnoteEntry[]; // 选填：笔记数组
}

interface XMnoteEntry {
  page?: number; // 页码/位置/进度
  text?: string; // 原文摘录
  note?: string; // 想法
  chapter?: string; // 章节
  time?: number; // 创建时间
}
```

### 2. Zotero数据提取器

```typescript
interface ZoteroDataExtractor {
  // 获取所有条目
  getAllItems(): ZoteroItem[];

  // 获取指定条目的笔记
  getItemNotes(itemId: number): ZoteroNote[];

  // 获取指定条目的注释
  getItemAnnotations(itemId: number): ZoteroAnnotation[];

  // 获取条目元数据
  getItemMetadata(itemId: number): ZoteroMetadata;
}

interface ZoteroItem {
  id: number;
  title: string;
  itemType: string;
  creators: ZoteroCreator[];
  abstractNote?: string;
  publisher?: string;
  date?: string;
  ISBN?: string;
  tags: ZoteroTag[];
  collections: string[];
}

interface ZoteroNote {
  id: number;
  parentItemID: number;
  title: string;
  note: string;
  dateAdded: Date;
  dateModified: Date;
}

interface ZoteroAnnotation {
  id: number;
  parentItemID: number;
  type: string;
  text: string;
  comment?: string;
  color?: string;
  pageLabel?: string;
  position?: any;
  dateAdded: Date;
}
```

### 3. 数据转换器

```typescript
interface DataTransformer {
  // 转换Zotero条目到XMnote格式
  transformItem(
    item: ZoteroItem,
    notes: ZoteroNote[],
    annotations: ZoteroAnnotation[],
  ): XMnoteNote;

  // 批量转换
  transformItems(items: TransformInput[]): XMnoteNote[];

  // 验证转换结果
  validateNote(note: XMnoteNote): ValidationResult;
}

interface TransformInput {
  item: ZoteroItem;
  notes: ZoteroNote[];
  annotations: ZoteroAnnotation[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### 4. 配置管理器

```typescript
interface ConfigManager {
  // 获取配置
  getConfig(): PluginConfig;

  // 保存配置
  saveConfig(config: PluginConfig): void;

  // 验证配置
  validateConfig(config: PluginConfig): ValidationResult;

  // 测试连接
  testConnection(config: XMnoteConfig): Promise<boolean>;
}

interface PluginConfig {
  xmnoteServer: XMnoteConfig;
  importOptions: ImportOptions;
  ui: UIConfig;
}

interface ImportOptions {
  includeNotes: boolean;
  includeAnnotations: boolean;
  includeMetadata: boolean;
  batchSize: number;
  retryCount: number;
  timeoutMs: number;
}

interface UIConfig {
  showProgress: boolean;
  showNotifications: boolean;
  language: "en-US" | "zh-CN";
}
```

## 关键实现细节

### 1. XMnote API集成

基于提供的API文档，实现如下关键功能：

- **端点**：`http://ip:port/send`
- **方法**：POST
- **内容类型**：application/json
- **支持跨域**：是

关键字段映射：

- `title`：从Zotero条目标题获取（必填）
- `type`：根据Zotero条目类型判断（1=电子书，0=纸质书）
- `locationUnit`：根据type确定（电子书用位置1，纸质书用页码2）
- `author`：从Zotero creators字段提取
- `publisher`：从Zotero publisher字段获取
- `publishDate`：从Zotero date字段转换为时间戳
- `isbn`：从Zotero ISBN字段获取
- `entries`：合并笔记和注释数据

### 2. 数据提取策略

```typescript
// 条目类型映射
const ITEM_TYPE_MAPPING = {
  book: { type: 0, locationUnit: 2 }, // 纸质书
  document: { type: 1, locationUnit: 1 }, // 电子书
  journalArticle: { type: 1, locationUnit: 1 }, // 期刊文章
  thesis: { type: 1, locationUnit: 1 }, // 论文
};

// 笔记合并策略
const mergeNotesAndAnnotations = (
  notes: ZoteroNote[],
  annotations: ZoteroAnnotation[],
): XMnoteEntry[] => {
  const entries: XMnoteEntry[] = [];

  // 处理笔记
  notes.forEach((note) => {
    entries.push({
      text: extractTextFromNote(note.note),
      note: note.title || "",
      time: Math.floor(note.dateAdded.getTime() / 1000),
    });
  });

  // 处理注释
  annotations.forEach((annotation) => {
    entries.push({
      text: annotation.text,
      note: annotation.comment || "",
      page: parsePageNumber(annotation.pageLabel),
      time: Math.floor(annotation.dateAdded.getTime() / 1000),
    });
  });

  // 按时间排序
  return entries.sort((a, b) => (a.time || 0) - (b.time || 0));
};
```

### 3. 错误处理机制

```typescript
class XMnoteApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any,
  ) {
    super(message);
    this.name = "XMnoteApiError";
  }
}

// 重试机制
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i)),
      );
    }
  }
  throw new Error("Max retries exceeded");
};
```

### 4. 用户界面集成

```typescript
// 工具栏按钮
const addToolbarButton = () => {
  const button = document.createElement("toolbarbutton");
  button.id = "xmnote-export-button";
  button.setAttribute("label", getString("xmnote.export.button"));
  button.setAttribute("tooltiptext", getString("xmnote.export.tooltip"));
  button.addEventListener("command", handleExportCommand);

  const toolbar = document.getElementById("zotero-toolbar");
  toolbar?.appendChild(button);
};

// 右键菜单
const addContextMenu = () => {
  const menuitem = document.createElement("menuitem");
  menuitem.id = "xmnote-export-menuitem";
  menuitem.setAttribute("label", getString("xmnote.export.menu"));
  menuitem.addEventListener("command", handleExportCommand);

  const popup = document.getElementById("zotero-itemmenu");
  popup?.appendChild(menuitem);
};
```

## 开发环境配置

### 依赖安装

```bash
npm install
```

### 开发调试

```bash
npm start  # 启动开发服务器
```

### 代码检查

```bash
npm run lint:check  # 检查代码格式
npm run lint:fix    # 自动修复格式问题
```

### 构建打包

```bash
npm run build      # 生产构建
npm run release    # 版本发布
```

### 测试

```bash
npm test          # 运行测试
```

## 部署与发布

### 插件打包

插件构建后会生成`.xpi`文件，可直接在Zotero中安装。

### 版本管理

使用语义化版本号，通过`npm run release`自动更新版本并发布到GitHub。

### 用户文档

提供详细的安装和使用说明，包括：

- 插件安装方法
- XMnote服务器配置步骤
- 数据导入操作指南
- 常见问题排查

## 测试策略

### 单元测试

- API客户端测试
- 数据转换器测试
- 配置管理测试

### 集成测试

- 端到端导入流程测试
- 错误处理测试
- 性能测试

### 用户验收测试

- 不同Zotero版本兼容性
- 不同操作系统兼容性
- 大量数据导入测试
