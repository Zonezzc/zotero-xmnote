// 配置相关的类型定义

export interface XMnoteConfig {
  ip: string;
  port: number;
  timeout?: number;
}

export interface ImportOptions {
  includeNotes: boolean;
  includeAnnotations: boolean;
  includeMetadata: boolean;
  batchSize: number;
  retryCount: number;
  timeoutMs: number;
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
