// XMnote API 相关的类型定义

export interface XMnoteNote {
  title: string; // 必填：书名
  type: 0 | 1; // 必填：书籍类型 (0: 纸质书, 1: 电子书)
  locationUnit: 0 | 1 | 2; // 必填：页码类型 (0: 进度, 1: 位置, 2: 页码)
  bookSummary?: string; // 选填：内容简介
  cover?: string; // 选填：书籍封面
  author?: string; // 选填：作者
  authorIntro?: string; // 选填：作者简介
  translator?: string; // 选填：译者
  publisher?: string; // 选填：出版社
  publishDate?: number; // 选填：出版日期（时间戳，单位秒）
  isbn?: string; // 选填：ISBN
  totalPageCount?: number; // 选填：总页码
  currentPage?: number; // 选填：当前阅读位置
  rating?: number; // 选填：评分 (0.0-5.0)
  readingStatus?: 1 | 2 | 3 | 4; // 选填：阅读状态 (1: 想读, 2: 在读, 3: 已读, 4: 弃读)
  readingStatusChangedDate?: number; // 选填：状态变更日期
  group?: string; // 选填：分组
  tags?: string[]; // 选填：标签
  source?: string; // 选填：来源
  purchaseDate?: number; // 选填：购买日期
  purchasePrice?: number; // 选填：购买价格
  preciseReadingDurations?: PreciseReadingDuration[]; // 选填：精确阅读时长
  fuzzyReadingDurations?: FuzzyReadingDuration[]; // 选填：模糊阅读时长
  entries?: XMnoteEntry[]; // 选填：笔记数组
}

export interface XMnoteEntry {
  page?: number; // 页码/位置/进度
  text?: string; // 原文摘录
  note?: string; // 想法
  chapter?: string; // 章节
  time?: number; // 创建时间（时间戳，单位秒）
}

export interface PreciseReadingDuration {
  startTime: number; // 必填：阅读开始时间
  endTime: number; // 必填：阅读结束时间
  position?: number; // 选填：阅读结束时位置
}

export interface FuzzyReadingDuration {
  date: string; // 必填：阅读日期
  durationSeconds: number; // 必填：阅读时长（秒）
  position?: number; // 选填：阅读位置
}

export interface ImportResult {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: any;
}

export interface BatchImportResult {
  total: number;
  success: number;
  failed: number;
  results: ImportResult[];
}

export interface XMnoteApiClient {
  // 配置管理
  configure(config: import("../config/types").XMnoteConfig): void;

  testConnection(): Promise<boolean>;

  // 数据导入
  importNote(note: XMnoteNote): Promise<ImportResult>;

  batchImport(notes: XMnoteNote[]): Promise<BatchImportResult>;
}
