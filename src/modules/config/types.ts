// 配置相关的类型定义

export interface XMnoteConfig {
  ip: string;
  port: number;
  timeout?: number;
}

export interface PunctuationOptions {
  comma: boolean; // , → ，
  period: boolean; // . → 。
  questionMark: boolean; // ? → ？
  exclamationMark: boolean; // ! → ！
  colon: boolean; // : → ：
  semicolon: boolean; // ; → ；
  parentheses: boolean; // () → （）
  brackets: boolean; // [] → ［］
  braces: boolean; // {} → ｛｝
  doubleQuotes: boolean; // "" → ""
  singleQuotes: boolean; // '' → ''
}

export interface ReadingDurationConfig {
  enabled: boolean;
  maxSessionGap: number; // 最大会话间隔（秒）
  minSessionDuration: number; // 最小会话时长（秒）
  maxSessionDuration: number; // 最大会话时长（秒）
  singleNoteEstimate: number; // 单笔记估算时长（秒）
  readingSpeedFactor: number; // 阅读速度因子
}

export interface ImportOptions {
  includeNotes: boolean;
  includeAnnotations: boolean;
  includeMetadata: boolean;
  includeCurrentPage: boolean;
  includeReadingDuration: boolean;
  batchSize: number;
  retryCount: number;
  timeoutMs: number;
  punctuationOptions: PunctuationOptions;
  readingDuration: ReadingDurationConfig;
}

export interface UIConfig {
  showProgress: boolean;
  showNotifications: boolean;
  language: "en-US" | "zh-CN";
}

export interface PluginConfig {
  xmnoteServer: XMnoteConfig;
  importOptions: ImportOptions;
  ui: UIConfig;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
