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

export interface ImportOptions {
  includeNotes: boolean;
  includeAnnotations: boolean;
  includeMetadata: boolean;
  includeCurrentPage: boolean;
  batchSize: number;
  retryCount: number;
  timeoutMs: number;
  punctuationOptions: PunctuationOptions;
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
