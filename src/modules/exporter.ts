// 数据导出器：协调Zotero数据提取和XMnote导入

import { logger } from "../utils/logger";
import { configManager } from "./config/settings";
import { getZoteroDataExtractor } from "./zotero/extractor";
import { getDataTransformer } from "./zotero/transformer";
import { getXMnoteApiClient } from "./xmnote/api";
import type { TransformInput, ZoteroItem } from "./zotero/types";
import type { BatchImportResult, XMnoteNote } from "./xmnote/types";

export interface ExportOptions {
  // 筛选选项
  itemTypes?: string[];
  selectedItems?: number[];
  tags?: string[];
  collections?: string[];
  dateAfter?: Date;
  dateBefore?: Date;

  // 导出选项
  includeNotes?: boolean;
  includeAnnotations?: boolean;
  includeMetadata?: boolean;

  // 排序选项
  sortBy?:
    | "noteCount"
    | "annotationCount"
    | "totalContent"
    | "title"
    | "dateAdded"
    | "none";
  sortOrder?: "desc" | "asc";

  // 处理选项
  batchSize?: number;
  dryRun?: boolean;
  onProgress?: (progress: ExportProgress) => void;
}

export interface SelectiveExportOptions extends ExportOptions {
  exportScope: "all" | "selected" | "custom";
  selectedItems?: number[];
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

export interface ExportProgress {
  phase: "extracting" | "transforming" | "importing" | "completed" | "error";
  current: number;
  total: number;
  item?: string;
  message?: string;
  errors?: string[];
}

export interface ExportResult {
  success: boolean;
  totalItems: number;
  processedItems: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  summary: string;
  details: BatchImportResult | null;
}

export class DataExporter {
  private extractor = getZoteroDataExtractor();
  private transformer = getDataTransformer();
  private apiClient = getXMnoteApiClient();

  // 执行完整的导出流程
  async export(options: ExportOptions = {}): Promise<ExportResult> {
    const startTime = Date.now();
    logger.info("Starting data export process");

    try {
      // 阶段1：提取数据
      const progress: ExportProgress = {
        phase: "extracting",
        current: 0,
        total: 0,
        message: "Extracting data from Zotero...",
      };
      options.onProgress?.(progress);

      const items = await this.extractData(options);

      progress.total = items.length;
      progress.message = `Found ${items.length} items to process`;
      options.onProgress?.(progress);

      if (items.length === 0) {
        return {
          success: true,
          totalItems: 0,
          processedItems: 0,
          successfulImports: 0,
          failedImports: 0,
          errors: [],
          summary: "No items found matching the criteria",
          details: null,
        };
      }

      // 阶段2：转换数据
      progress.phase = "transforming";
      progress.current = 0;
      progress.message = "Transforming data to XMnote format...";
      options.onProgress?.(progress);

      const xmnoteNotes = await this.transformData(items, options, progress);

      // 阶段3：导入数据（如果不是干运行）
      let importResult: BatchImportResult | null = null;

      if (!options.dryRun) {
        progress.phase = "importing";
        progress.current = 0;
        progress.total = xmnoteNotes.length;
        progress.message = "Importing data to XMnote...";
        options.onProgress?.(progress);

        importResult = await this.importData(xmnoteNotes, options, progress);
      }

      // 完成
      progress.phase = "completed";
      progress.current = progress.total;
      progress.message = "Export completed successfully";
      options.onProgress?.(progress);

      const duration = Date.now() - startTime;
      const summary = this.generateSummary(
        items.length,
        xmnoteNotes.length,
        importResult,
        duration,
        options.dryRun,
      );

      logger.info(`Export completed in ${duration}ms: ${summary}`);

      return {
        success: true,
        totalItems: items.length,
        processedItems: xmnoteNotes.length,
        successfulImports: importResult?.success || 0,
        failedImports: importResult?.failed || 0,
        errors: [],
        summary,
        details: importResult,
      };
    } catch (error) {
      logger.error("Export process failed:", error);

      const errorProgress: ExportProgress = {
        phase: "error",
        current: 0,
        total: 0,
        message: error instanceof Error ? error.message : "Unknown error",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
      options.onProgress?.(errorProgress);

      return {
        success: false,
        totalItems: 0,
        processedItems: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        summary: "Export failed",
        details: null,
      };
    }
  }

  // 预览导出结果
  async preview(options: ExportOptions = {}): Promise<{
    items: ZoteroItem[];
    preview: {
      item: ZoteroItem;
      transformedNote: XMnoteNote;
      stats: any;
    }[];
  }> {
    const items = await this.extractData(options);
    const preview = [];

    // 只预览前3个条目
    const previewItems = items.slice(0, 3);

    for (const item of previewItems) {
      const notes = this.extractor.getItemNotes(item.id);
      const annotations = this.extractor.getItemAnnotations(item.id);

      const result = this.transformer.previewTransformation(
        item,
        notes,
        annotations,
      );

      preview.push({
        item,
        transformedNote: result.note,
        stats: result.stats,
      });
    }

    return { items, preview };
  }

  // 提取数据
  private async extractData(options: ExportOptions): Promise<ZoteroItem[]> {
    logger.info("Extracting data from Zotero");

    let items: ZoteroItem[];

    if (options.selectedItems && options.selectedItems.length > 0) {
      // 处理指定的条目 - 使用完整的提取方法包含附件信息
      items = [];
      for (const itemId of options.selectedItems) {
        try {
          // 获取Zotero原始项目对象
          const zoteroItem = Zotero.Items.get(itemId);
          if (zoteroItem && zoteroItem.isRegularItem() && !zoteroItem.deleted) {
            // 使用完整的extractItem方法来获取包含附件的完整数据
            const extractedItem = (this.extractor as any).extractItem(
              zoteroItem,
            );
            if (extractedItem) {
              items.push(extractedItem);
              logger.info(
                `[EXTRACT FIX] Extracted item with ${extractedItem.attachments?.length || 0} attachments: ${extractedItem.title}`,
              );
            }
          }
        } catch (error) {
          logger.warn(`Failed to extract item ${itemId}:`, error);
        }
      }
    } else {
      // 获取所有条目
      items = await this.extractor.getAllItems();
    }

    // 应用筛选条件
    if (
      options.itemTypes ||
      options.tags ||
      options.collections ||
      options.dateAfter ||
      options.dateBefore
    ) {
      items = this.extractor.filterItems(items, {
        itemTypes: options.itemTypes,
        tags: options.tags,
        collections: options.collections,
        dateAfter: options.dateAfter,
        dateBefore: options.dateBefore,
      });
    }

    // 应用排序（默认按笔记数量降序排列）
    items = this.sortItems(items, options);

    logger.info(`Extracted and sorted ${items.length} items from Zotero`);
    return items;
  }

  // 对项目进行排序
  private sortItems(items: ZoteroItem[], options: ExportOptions): ZoteroItem[] {
    const sortBy = options.sortBy || "totalContent"; // 默认按总内容量排序
    const sortOrder = options.sortOrder || "desc"; // 默认降序

    if (sortBy === "none") {
      return items;
    }

    logger.info(
      `Sorting ${items.length} items by ${sortBy} in ${sortOrder} order`,
    );

    const sortedItems = [...items].sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case "noteCount":
          compareValue = (a.noteCount || 0) - (b.noteCount || 0);
          break;

        case "annotationCount":
          compareValue = (a.annotationCount || 0) - (b.annotationCount || 0);
          break;

        case "totalContent": {
          // 综合内容量：笔记数 + 注释数
          const aTotal = (a.noteCount || 0) + (a.annotationCount || 0);
          const bTotal = (b.noteCount || 0) + (b.annotationCount || 0);
          compareValue = aTotal - bTotal;
          break;
        }

        case "title":
          compareValue = a.title.localeCompare(b.title);
          break;

        case "dateAdded":
          if (!a.dateAdded && !b.dateAdded) compareValue = 0;
          else if (!a.dateAdded) compareValue = -1;
          else if (!b.dateAdded) compareValue = 1;
          else compareValue = a.dateAdded.getTime() - b.dateAdded.getTime();
          break;

        default:
          compareValue = 0;
      }

      // 应用排序顺序
      return sortOrder === "desc" ? -compareValue : compareValue;
    });

    // 记录排序结果的一些统计信息
    if (sortedItems.length > 0) {
      const first = sortedItems[0];
      const last = sortedItems[sortedItems.length - 1];

      logger.info(
        `Sorting completed. First item: "${first.title}" (${first.noteCount || 0} notes, ${first.annotationCount || 0} annotations)`,
      );
      logger.info(
        `Last item: "${last.title}" (${last.noteCount || 0} notes, ${last.annotationCount || 0} annotations)`,
      );

      // 显示内容丰富的前5个项目
      const topItems = sortedItems.slice(0, Math.min(5, sortedItems.length));
      logger.info("Top items by content:");
      topItems.forEach((item, index) => {
        const totalContent =
          (item.noteCount || 0) + (item.annotationCount || 0);
        logger.info(
          `  ${index + 1}. "${item.title}": ${totalContent} total (${item.noteCount || 0} notes + ${item.annotationCount || 0} annotations)`,
        );
      });
    }

    return sortedItems;
  }

  // 转换数据
  private async transformData(
    items: ZoteroItem[],
    options: ExportOptions,
    progress: ExportProgress,
  ): Promise<XMnoteNote[]> {
    logger.info(`Transforming ${items.length} items to XMnote format`);

    const transformInputs: TransformInput[] = [];
    const config = configManager.getImportOptions();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      progress.current = i + 1;
      progress.item = item.title;
      options.onProgress?.(progress);

      try {
        const notes =
          (options.includeNotes ?? config.includeNotes)
            ? this.extractor.getItemNotes(item.id)
            : [];

        const annotations =
          (options.includeAnnotations ?? config.includeAnnotations)
            ? this.extractor.getItemAnnotations(item.id)
            : [];

        transformInputs.push({
          item,
          notes,
          annotations,
        });
      } catch (error) {
        logger.warn(`Failed to extract data for item ${item.title}:`, error);
      }
    }

    const xmnoteNotes = this.transformer.transformItems(transformInputs);
    logger.info(`Transformed ${xmnoteNotes.length} items successfully`);

    return xmnoteNotes;
  }

  // 导入数据
  private async importData(
    notes: XMnoteNote[],
    options: ExportOptions,
    progress: ExportProgress,
  ): Promise<BatchImportResult> {
    logger.info(`Importing ${notes.length} notes to XMnote`);

    // 导出流程中不进行连接测试，避免创建测试数据
    // 连接测试仅在配置面板中使用

    // 执行批量导入
    const batchSize =
      options.batchSize || configManager.getImportOptions().batchSize;
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < notes.length; i += batchSize) {
      const batch = notes.slice(i, i + batchSize);

      try {
        const batchResult = await this.apiClient.batchImport(batch);
        results.push(...batchResult.results);
        successCount += batchResult.success;
        failedCount += batchResult.failed;

        // 更新进度
        progress.current = Math.min(i + batchSize, notes.length);
        progress.message = `Imported ${progress.current}/${notes.length} items`;
        options.onProgress?.(progress);

        // 批次间延迟
        if (i + batchSize < notes.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        logger.error(
          `Batch import failed for items ${i}-${i + batch.length - 1}:`,
          error,
        );
        failedCount += batch.length;

        // 为失败的批次添加错误结果
        batch.forEach((note) => {
          results.push({
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
          });
        });
      }
    }

    return {
      total: notes.length,
      success: successCount,
      failed: failedCount,
      results,
    };
  }

  // 生成摘要
  private generateSummary(
    totalItems: number,
    processedItems: number,
    importResult: BatchImportResult | null,
    duration: number,
    dryRun?: boolean,
  ): string {
    const parts = [];

    parts.push(`Processed ${processedItems}/${totalItems} items`);

    if (dryRun) {
      parts.push("(dry run - no data imported)");
    } else if (importResult) {
      parts.push(`Imported ${importResult.success} successfully`);
      if (importResult.failed > 0) {
        parts.push(`${importResult.failed} failed`);

        // 添加详细的错误信息
        const failedResults = importResult.results.filter((r) => !r.success);
        if (failedResults.length > 0) {
          const errorMessages = failedResults
            .map((r) => r.message)
            .filter((msg) => msg);
          if (errorMessages.length > 0) {
            // 获取第一个错误信息作为主要错误展示
            const primaryError = errorMessages[0];
            parts.push(`Error: ${primaryError}`);

            // 如果有多个不同的错误，显示错误种类数
            const uniqueErrors = [...new Set(errorMessages)];
            if (uniqueErrors.length > 1) {
              parts.push(`(${uniqueErrors.length} different error types)`);
            }
          }
        }
      }
    }

    parts.push(`in ${(duration / 1000).toFixed(1)}s`);

    return parts.join(", ");
  }

  // 获取支持的条目类型
  getSupportedItemTypes(): string[] {
    return [
      "book",
      "bookSection",
      "journalArticle",
      "thesis",
      "report",
      "webpage",
      "blogPost",
      "manuscript",
      "computerProgram",
    ];
  }

  // 获取可用的标签
  async getAvailableTags(): Promise<string[]> {
    try {
      const items = await this.extractor.getAllItems();
      const tags = new Set<string>();

      items.forEach((item) => {
        item.tags.forEach((tag) => {
          tags.add(tag.tag);
        });
      });

      return Array.from(tags).sort();
    } catch (error) {
      logger.error("Failed to get available tags:", error);
      return [];
    }
  }

  // 获取可用的分类
  async getAvailableCollections(): Promise<string[]> {
    try {
      const items = await this.extractor.getAllItems();
      const collections = new Set<string>();

      items.forEach((item) => {
        item.collections.forEach((collection) => {
          collections.add(collection);
        });
      });

      return Array.from(collections).sort();
    } catch (error) {
      logger.error("Failed to get available collections:", error);
      return [];
    }
  }
}

// 导出单例实例
let exporterInstance: DataExporter | null = null;

export function getDataExporter(): DataExporter {
  if (!exporterInstance) {
    exporterInstance = new DataExporter();
  }
  return exporterInstance;
}
