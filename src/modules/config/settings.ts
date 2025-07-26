// 配置管理模块

import { config as packageConfig } from "../../../package.json";
import { logger } from "../../utils/logger";
import type {
  ImportOptions,
  PluginConfig,
  UIConfig,
  ValidationResult,
  XMnoteConfig,
} from "./types";

export class ConfigManager {
  private static instance: ConfigManager;
  private config: PluginConfig | null = null;

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // 获取默认配置
  private getDefaultConfig(): PluginConfig {
    return {
      xmnoteServer: {
        ip: "192.168.1.100",
        port: 8080,
        timeout: 30000,
      },
      importOptions: {
        includeNotes: true,
        includeAnnotations: true,
        includeMetadata: true,
        includeCurrentPage: true, // 默认包含当前页数（智能检测）
        batchSize: 10,
        retryCount: 3,
        timeoutMs: 30000,
      },
      ui: {
        showProgress: true,
        showNotifications: true,
        language: "zh-CN",
      },
    };
  }

  // 获取配置
  getConfig(): PluginConfig {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config!;
  }

  // 加载配置
  private loadConfig(): void {
    try {
      const defaultConfig = this.getDefaultConfig();
      const prefPrefix = packageConfig.prefsPrefix;

      // 从首选项加载配置
      this.config = {
        xmnoteServer: {
          ip:
            (Zotero.Prefs.get(`${prefPrefix}.xmnote.server.ip`) as string) ||
            defaultConfig.xmnoteServer.ip,
          port:
            (Zotero.Prefs.get(`${prefPrefix}.xmnote.server.port`) as number) ||
            defaultConfig.xmnoteServer.port,
          timeout:
            (Zotero.Prefs.get(
              `${prefPrefix}.xmnote.server.timeout`,
            ) as number) || defaultConfig.xmnoteServer.timeout,
        },
        importOptions: {
          includeNotes:
            (Zotero.Prefs.get(
              `${prefPrefix}.xmnote.import.includeNotes`,
            ) as boolean) ?? defaultConfig.importOptions.includeNotes,
          includeAnnotations:
            (Zotero.Prefs.get(
              `${prefPrefix}.xmnote.import.includeAnnotations`,
            ) as boolean) ?? defaultConfig.importOptions.includeAnnotations,
          includeMetadata:
            (Zotero.Prefs.get(
              `${prefPrefix}.xmnote.import.includeMetadata`,
            ) as boolean) ?? defaultConfig.importOptions.includeMetadata,
          includeCurrentPage:
            (Zotero.Prefs.get(
              `${prefPrefix}.xmnote.import.includeCurrentPage`,
            ) as boolean) ?? defaultConfig.importOptions.includeCurrentPage,
          batchSize:
            (Zotero.Prefs.get(
              `${prefPrefix}.xmnote.import.batchSize`,
            ) as number) || defaultConfig.importOptions.batchSize,
          retryCount:
            (Zotero.Prefs.get(
              `${prefPrefix}.xmnote.import.retryCount`,
            ) as number) || defaultConfig.importOptions.retryCount,
          timeoutMs:
            (Zotero.Prefs.get(
              `${prefPrefix}.xmnote.import.timeoutMs`,
            ) as number) || defaultConfig.importOptions.timeoutMs,
        },
        ui: {
          showProgress:
            (Zotero.Prefs.get(
              `${prefPrefix}.xmnote.ui.showProgress`,
            ) as boolean) ?? defaultConfig.ui.showProgress,
          showNotifications:
            (Zotero.Prefs.get(
              `${prefPrefix}.xmnote.ui.showNotifications`,
            ) as boolean) ?? defaultConfig.ui.showNotifications,
          language: ((Zotero.Prefs.get(
            `${prefPrefix}.xmnote.ui.language`,
          ) as string) || defaultConfig.ui.language) as "en-US" | "zh-CN",
        },
      };

      logger.info("Configuration loaded successfully");
    } catch (error) {
      logger.error("Failed to load configuration, using defaults:", error);
      this.config = this.getDefaultConfig();
    }
  }

  // 保存配置
  saveConfig(config: PluginConfig): void {
    try {
      const prefPrefix = packageConfig.prefsPrefix;

      // 保存到首选项
      Zotero.Prefs.set(
        `${prefPrefix}.xmnote.server.ip`,
        config.xmnoteServer.ip,
      );
      Zotero.Prefs.set(
        `${prefPrefix}.xmnote.server.port`,
        config.xmnoteServer.port,
      );
      Zotero.Prefs.set(
        `${prefPrefix}.xmnote.server.timeout`,
        config.xmnoteServer.timeout || 30000,
      );

      Zotero.Prefs.set(
        `${prefPrefix}.xmnote.import.includeNotes`,
        config.importOptions.includeNotes,
      );
      Zotero.Prefs.set(
        `${prefPrefix}.xmnote.import.includeAnnotations`,
        config.importOptions.includeAnnotations,
      );
      Zotero.Prefs.set(
        `${prefPrefix}.xmnote.import.includeMetadata`,
        config.importOptions.includeMetadata,
      );
      Zotero.Prefs.set(
        `${prefPrefix}.xmnote.import.includeCurrentPage`,
        config.importOptions.includeCurrentPage,
      );
      Zotero.Prefs.set(
        `${prefPrefix}.xmnote.import.batchSize`,
        config.importOptions.batchSize,
      );
      Zotero.Prefs.set(
        `${prefPrefix}.xmnote.import.retryCount`,
        config.importOptions.retryCount,
      );
      Zotero.Prefs.set(
        `${prefPrefix}.xmnote.import.timeoutMs`,
        config.importOptions.timeoutMs,
      );

      Zotero.Prefs.set(
        `${prefPrefix}.xmnote.ui.showProgress`,
        config.ui.showProgress,
      );
      Zotero.Prefs.set(
        `${prefPrefix}.xmnote.ui.showNotifications`,
        config.ui.showNotifications,
      );
      Zotero.Prefs.set(`${prefPrefix}.xmnote.ui.language`, config.ui.language);

      this.config = config;
      logger.info("Configuration saved successfully");
    } catch (error) {
      logger.error("Failed to save configuration:", error);
      throw new Error("Failed to save configuration");
    }
  }

  // 验证配置
  validateConfig(config: PluginConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证服务器配置
    if (!config.xmnoteServer.ip) {
      errors.push("XMnote server IP is required");
    } else if (!this.isValidIP(config.xmnoteServer.ip)) {
      errors.push("Invalid IP address format");
    }

    if (
      !config.xmnoteServer.port ||
      config.xmnoteServer.port <= 0 ||
      config.xmnoteServer.port > 65535
    ) {
      errors.push("Port must be between 1 and 65535");
    }

    if (config.xmnoteServer.timeout && config.xmnoteServer.timeout < 1000) {
      warnings.push("Timeout less than 1000ms may cause connection issues");
    }

    // 验证导入选项
    if (config.importOptions.batchSize <= 0) {
      errors.push("Batch size must be greater than 0");
    } else if (config.importOptions.batchSize > 100) {
      warnings.push("Large batch size may cause performance issues");
    }

    if (config.importOptions.retryCount < 0) {
      errors.push("Retry count cannot be negative");
    } else if (config.importOptions.retryCount > 10) {
      warnings.push("High retry count may cause long delays");
    }

    if (config.importOptions.timeoutMs < 1000) {
      errors.push("Timeout must be at least 1000ms");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // 测试服务器连接
  async testConnection(config?: XMnoteConfig): Promise<boolean> {
    const serverConfig = config || this.getConfig().xmnoteServer;

    try {
      const url = `http://${serverConfig.ip}:${serverConfig.port}/send`;
      logger.info(`Testing connection to: ${url}`);

      // 创建一个简单的测试请求
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Connection Test",
          type: 1,
          locationUnit: 1,
        }),
        signal: AbortSignal.timeout(serverConfig.timeout || 10000),
      });

      // 连接成功（即使返回错误状态码，也说明服务器可达）
      logger.info(`Connection test result: ${response.status}`);
      return true;
    } catch (error) {
      logger.error("Connection test failed:", error);
      return false;
    }
  }

  // 获取XMnote服务器配置
  getXMnoteConfig(): XMnoteConfig {
    return this.getConfig().xmnoteServer;
  }

  // 更新XMnote服务器配置
  updateXMnoteConfig(config: XMnoteConfig): void {
    const currentConfig = this.getConfig();
    currentConfig.xmnoteServer = config;
    this.saveConfig(currentConfig);
  }

  // 获取导入选项
  getImportOptions(): ImportOptions {
    return this.getConfig().importOptions;
  }

  // 更新导入选项
  updateImportOptions(options: ImportOptions): void {
    const currentConfig = this.getConfig();
    currentConfig.importOptions = options;
    this.saveConfig(currentConfig);
  }

  // 获取UI配置
  getUIConfig(): UIConfig {
    return this.getConfig().ui;
  }

  // 更新UI配置
  updateUIConfig(config: UIConfig): void {
    const currentConfig = this.getConfig();
    currentConfig.ui = config;
    this.saveConfig(currentConfig);
  }

  // 重置为默认配置
  resetToDefaults(): void {
    const defaultConfig = this.getDefaultConfig();
    this.saveConfig(defaultConfig);
    logger.info("Configuration reset to defaults");
  }

  // 验证IP地址格式
  private isValidIP(ip: string): boolean {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return false;
    }

    const parts = ip.split(".");
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
}

// 导出单例实例
export const configManager = ConfigManager.getInstance();
