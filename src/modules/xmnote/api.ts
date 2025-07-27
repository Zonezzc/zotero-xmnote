// XMnote API 客户端实现

import { NetworkClient, NetworkError, withRetry } from "../../utils/network";
import { logger } from "../../utils/logger";
import { configManager } from "../config/settings";
import type { XMnoteConfig } from "../config/types";
import type {
  BatchImportResult,
  ImportResult,
  XMnoteApiClient,
  XMnoteNote,
} from "./types";

export class XMnoteApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any,
  ) {
    super(message);
    this.name = "XMnoteApiError";
  }
}

export class XMnoteApiClientImpl implements XMnoteApiClient {
  private networkClient: NetworkClient;
  private config: XMnoteConfig;

  constructor(config?: XMnoteConfig) {
    this.config = config || configManager.getXMnoteConfig();
    this.networkClient = new NetworkClient(this.config.timeout);
    logger.info("XMnote API client initialized", this.config);
  }

  // 配置管理
  configure(config: XMnoteConfig): void {
    this.config = config;
    this.networkClient = new NetworkClient(config.timeout);
    logger.info("XMnote API client reconfigured", config);
  }

  // 测试连接
  async testConnection(): Promise<boolean> {
    try {
      const url = this.getApiUrl();
      logger.info(`Testing connection to XMnote API: ${url}`);

      // 发送一个最小的测试请求
      const testNote: XMnoteNote = {
        title: "Connection Test",
        type: 1,
        locationUnit: 1,
      };

      await this.networkClient.post(url, testNote);
      logger.info("Connection test successful");
      return true;
    } catch (error) {
      logger.error("Connection test failed:", error);
      return false;
    }
  }

  // 导入单个笔记
  async importNote(note: XMnoteNote): Promise<ImportResult> {
    try {
      logger.debug("Importing note:", note.title);

      // 详细记录发送的参数
      logger.info(`Sending to XMnote API - Title: ${note.title}`);
      // logger.info(`Full request data:`, JSON.stringify(note, null, 2));

      const url = this.getApiUrl();
      const response = await withRetry(
        () => this.networkClient.post(url, note),
        configManager.getImportOptions().retryCount,
      );

      // 检查响应数据中的错误信息
      logger.debug(`Checking response for note ${note.title}:`, response.data);

      if (response.data && response.data.code && response.data.code !== 200) {
        logger.error(
          `XMnote server error for note ${note.title}:`,
          response.data,
        );
        return {
          success: false,
          statusCode: response.data.code,
          message: response.data.message || "XMnote server error",
          data: response.data,
        };
      }

      logger.info(`Note imported successfully: ${note.title}`);
      return {
        success: true,
        statusCode: response.status,
        message: "Note imported successfully",
        data: response.data,
      };
    } catch (error) {
      logger.error(`Failed to import note: ${note.title}`, error);

      if (error instanceof NetworkError) {
        return {
          success: false,
          statusCode: error.statusCode,
          message: error.message,
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // 批量导入笔记
  async batchImport(notes: XMnoteNote[]): Promise<BatchImportResult> {
    const results: ImportResult[] = [];
    const batchSize = configManager.getImportOptions().batchSize;

    logger.info(
      `Starting batch import of ${notes.length} notes (batch size: ${batchSize})`,
    );

    let successCount = 0;
    let failedCount = 0;

    // 分批处理
    for (let i = 0; i < notes.length; i += batchSize) {
      const batch = notes.slice(i, i + batchSize);
      logger.info(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(notes.length / batchSize)}`,
      );

      // 并行处理当前批次
      const batchPromises = batch.map((note) => this.importNote(note));
      const batchResults = await Promise.all(batchPromises);

      results.push(...batchResults);

      // 统计结果
      batchResults.forEach((result) => {
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }
      });

      // 批次间延迟，避免过于频繁的请求
      if (i + batchSize < notes.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const result: BatchImportResult = {
      total: notes.length,
      success: successCount,
      failed: failedCount,
      results,
    };

    logger.info(
      `Batch import completed: ${successCount} success, ${failedCount} failed`,
    );
    return result;
  }

  // 获取API URL
  private getApiUrl(): string {
    return `http://${this.config.ip}:${this.config.port}/send`;
  }

  // 验证笔记数据
  validateNote(note: XMnoteNote): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 必填字段验证
    if (!note.title || note.title.trim() === "") {
      errors.push("Title is required");
    }

    if (note.type !== 0 && note.type !== 1) {
      errors.push("Type must be 0 (physical book) or 1 (ebook)");
    }

    if (![0, 1, 2].includes(note.locationUnit)) {
      errors.push(
        "LocationUnit must be 0 (progress), 1 (location), or 2 (page)",
      );
    }

    // 类型与位置单位的一致性检查
    if (note.type === 0 && note.locationUnit !== 2) {
      errors.push(
        "Physical books (type 0) must use page numbers (locationUnit 2)",
      );
    }

    if (note.type === 1 && note.locationUnit === 2) {
      errors.push("Ebooks (type 1) cannot use page numbers (locationUnit 2)");
    }

    // 可选字段验证
    if (note.rating !== undefined && (note.rating < 0 || note.rating > 5)) {
      errors.push("Rating must be between 0 and 5");
    }

    if (
      note.readingStatus !== undefined &&
      ![1, 2, 3, 4].includes(note.readingStatus)
    ) {
      errors.push(
        "ReadingStatus must be 1 (want to read), 2 (reading), 3 (read), or 4 (abandoned)",
      );
    }

    // 页码相关验证
    if (note.currentPage !== undefined && note.totalPageCount !== undefined) {
      if (note.currentPage > note.totalPageCount) {
        errors.push("Current page cannot exceed total page count");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// 导出单例实例
let apiClientInstance: XMnoteApiClientImpl | null = null;

export function getXMnoteApiClient(): XMnoteApiClientImpl {
  if (!apiClientInstance) {
    apiClientInstance = new XMnoteApiClientImpl();
  }
  return apiClientInstance;
}

export function resetXMnoteApiClient(): void {
  apiClientInstance = null;
}
