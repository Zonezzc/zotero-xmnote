// XMnote API 客户端实现

import { NetworkClient, NetworkError, withRetry } from "../../utils/network";
import { logger } from "../../utils/logger";
import { configManager } from "../config/settings";
import type { XMnoteConfig } from "../config/types";
import type {
  BatchImportResult,
  ImportResult,
  XMnoteApiResponse,
  XMnoteApiClient,
  XMnoteNote,
} from "./types";
import { buildXMnoteApiUrl } from "./url";

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
  private networkClient: Pick<NetworkClient, "options" | "post">;
  private config: XMnoteConfig;
  private retryCount?: number;

  constructor(
    config?: XMnoteConfig,
    networkClient?: Pick<NetworkClient, "options" | "post">,
    retryCount?: number,
  ) {
    this.config = config || configManager.getXMnoteConfig();
    this.networkClient =
      networkClient || new NetworkClient(this.config.timeout);
    this.retryCount = retryCount;
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

      // OPTIONS is read-only. A 4xx/5xx response still proves reachability.
      await this.networkClient.options(url);
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

      const validation = this.validateNote(note);
      if (!validation.isValid) {
        return {
          success: false,
          message: `Invalid XMnote data: ${validation.errors.join("; ")}`,
        };
      }

      // 详细记录发送的参数
      logger.info(`Sending to XMnote API - Title: ${note.title}`);
      // logger.info(`Full request data:`, JSON.stringify(note, null, 2));

      const url = this.getApiUrl();
      const response = await withRetry(
        () => this.networkClient.post<XMnoteApiResponse>(url, note),
        this.retryCount ?? configManager.getImportOptions().retryCount,
      );

      if (response.data?.code !== 200) {
        const responseCode = response.data?.code;
        logger.error(
          `XMnote server rejected note ${note.title}: code=${responseCode ?? "missing"}, message=${response.data?.message ?? "none"}`,
        );
        return {
          success: false,
          statusCode: responseCode ?? response.status,
          message: response.data?.message || "Invalid XMnote API response",
          data: response.data,
        };
      }

      logger.info(
        `Note accepted by XMnote pending confirmation: ${note.title}`,
      );
      return {
        success: true,
        statusCode: response.data.code,
        message: "Accepted by XMnote; pending confirmation in the app",
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
    return buildXMnoteApiUrl(this.config.ip, this.config.port);
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
    if (
      note.rating !== undefined &&
      (!Number.isFinite(note.rating) || note.rating < 0 || note.rating > 5)
    ) {
      errors.push("Rating must be between 0 and 5");
    }

    if (
      note.readingStatus !== undefined &&
      ![0, 1, 2, 3, 4, 5].includes(note.readingStatus)
    ) {
      errors.push("ReadingStatus must be an integer between 0 and 5");
    }

    if (note.cover !== undefined && this.looksLikeBase64(note.cover)) {
      errors.push("Base64 cover data must use coverBase64, not cover");
    }

    this.validatePageData(note, errors);
    this.validateReadingDurations(note, errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validatePageData(note: XMnoteNote, errors: string[]): void {
    if (
      note.totalPageCount !== undefined &&
      (!Number.isFinite(note.totalPageCount) || note.totalPageCount < 0)
    ) {
      errors.push("Total page count must be a finite non-negative number");
    }

    if (
      note.currentPage !== undefined &&
      (!Number.isFinite(note.currentPage) || note.currentPage < 0)
    ) {
      errors.push("Current page must be a finite non-negative number");
      return;
    }

    if (
      note.currentPage !== undefined &&
      note.locationUnit === 0 &&
      note.currentPage > 100
    ) {
      errors.push("Progress must be between 0 and 100");
    }

    if (
      note.currentPage !== undefined &&
      (note.locationUnit === 1 || note.locationUnit === 2) &&
      note.totalPageCount === undefined
    ) {
      errors.push("Total page count is required for a page or location value");
    }

    if (
      note.currentPage !== undefined &&
      note.totalPageCount !== undefined &&
      Number.isFinite(note.currentPage) &&
      Number.isFinite(note.totalPageCount) &&
      note.currentPage > note.totalPageCount
    ) {
      errors.push("Current page cannot exceed total page count");
    }
  }

  private validateReadingDurations(note: XMnoteNote, errors: string[]): void {
    const now = Date.now();

    note.preciseReadingDurations?.forEach((duration, index) => {
      const start = this.toMilliseconds(duration.startTime);
      const end = this.toMilliseconds(duration.endTime);
      if (start === null || end === null) {
        errors.push(`Precise duration ${index + 1} has an invalid timestamp`);
      } else {
        if (end <= start) {
          errors.push(`Precise duration ${index + 1} must end after it starts`);
        }
        if (end > now) {
          errors.push(`Precise duration ${index + 1} cannot end in the future`);
        }
      }
    });

    note.fuzzyReadingDurations?.forEach((duration, index) => {
      const date = this.toMilliseconds(duration.date);
      if (date === null || date > now) {
        errors.push(`Fuzzy duration ${index + 1} date cannot be in the future`);
      }
      if (
        !Number.isFinite(duration.durationSeconds) ||
        duration.durationSeconds <= 0
      ) {
        errors.push(
          `Fuzzy duration ${index + 1} durationSeconds must be greater than 0`,
        );
      }
    });
  }

  private toMilliseconds(timestamp: number): number | null {
    if (!Number.isFinite(timestamp) || timestamp < 0) {
      return null;
    }
    return timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
  }

  private looksLikeBase64(value: string): boolean {
    const trimmed = value.trim();
    if (/^data:/i.test(trimmed) || /^base64,/i.test(trimmed)) {
      return true;
    }
    const compact = trimmed.replace(/\s/g, "");
    return (
      compact.length >= 8 &&
      compact.length % 4 === 0 &&
      /^[a-zA-Z0-9+/]+={0,2}$/.test(compact)
    );
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
