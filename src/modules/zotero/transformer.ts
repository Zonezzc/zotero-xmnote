// 数据转换器：将Zotero数据转换为XMnote格式

import { logger } from "../../utils/logger";
import { configManager } from "../config/settings";
import { getXMnoteApiClient } from "../xmnote/api";
import type {
  DataTransformer,
  TransformInput,
  ZoteroAnnotation,
  ZoteroItem,
  ZoteroNote,
} from "./types";
import type { XMnoteEntry, XMnoteNote } from "../xmnote/types";
import type { ValidationResult } from "../config/types";

export class DataTransformerImpl implements DataTransformer {
  // 转换单个Zotero条目到XMnote格式
  transformItem(
    item: ZoteroItem,
    notes: ZoteroNote[],
    annotations: ZoteroAnnotation[],
  ): XMnoteNote {
    logger.debug(`Transforming item: ${item.title}`);

    // 基本字段转换
    const xmnoteNote: XMnoteNote = {
      title: item.title || "Untitled",
      type: this.determineBookType(item),
      locationUnit: this.determineLocationUnit(item),
    };

    // 添加PDF页数信息
    this.addPdfPageInfo(item, annotations, xmnoteNote);

    // 根据配置决定是否包含当前页数
    this.setCurrentPage(item, annotations, xmnoteNote);

    // 元数据转换
    this.transformMetadata(item, xmnoteNote);

    // 笔记和注释转换
    const entries = this.transformEntries(notes, annotations);
    if (entries.length > 0) {
      xmnoteNote.entries = entries;
    }

    logger.debug(
      `Transformed item ${item.title} with ${entries.length} entries`,
    );
    return xmnoteNote;
  }

  // 批量转换
  transformItems(items: TransformInput[]): XMnoteNote[] {
    logger.info(`Starting batch transformation of ${items.length} items`);

    const results: XMnoteNote[] = [];
    const config = configManager.getImportOptions();

    for (const input of items) {
      try {
        // 根据配置过滤数据
        const filteredNotes = config.includeNotes ? input.notes : [];
        const filteredAnnotations = config.includeAnnotations
          ? input.annotations
          : [];

        const transformedNote = this.transformItem(
          input.item,
          filteredNotes,
          filteredAnnotations,
        );

        results.push(transformedNote);
      } catch (error) {
        logger.error(`Failed to transform item ${input.item.title}:`, error);
      }
    }

    logger.info(
      `Completed batch transformation: ${results.length} items processed`,
    );
    return results;
  }

  // 验证转换结果
  validateNote(note: XMnoteNote): ValidationResult {
    const apiClient = getXMnoteApiClient();
    const validation = apiClient.validateNote(note);

    return {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: [],
    };
  }

  // 确定书籍类型
  private determineBookType(item: ZoteroItem): 0 | 1 {
    logger.info(
      `Determining book type for item: ${item.title}, itemType: ${item.itemType}`,
    );

    // 优先检查是否有PDF附件，有PDF则认为是电子书
    if (item.attachments && item.attachments.length > 0) {
      logger.info(
        `Found ${item.attachments.length} attachments for item: ${item.title}`,
      );
      const hasPdf = item.attachments.some((attachment) => {
        logger.info(
          `Attachment: ${attachment.title}, contentType: ${attachment.contentType}`,
        );
        return attachment.contentType === "application/pdf";
      });
      if (hasPdf) {
        logger.info(
          `Found PDF attachment, identifying as ebook (type: 1) for item: ${item.title}`,
        );
        return 1; // 有PDF附件，识别为电子书
      } else {
        logger.info(`No PDF attachments found for item: ${item.title}`);
      }
    } else {
      logger.info(`No attachments found for item: ${item.title}`);
    }

    // 根据Zotero条目类型判断
    const physicalTypes = ["book", "bookSection", "manuscript"];
    const digitalTypes = ["computerProgram", "webpage", "blogPost"];

    if (physicalTypes.includes(item.itemType)) {
      logger.info(
        `ItemType '${item.itemType}' is physical type, identifying as physical book (type: 0) for item: ${item.title}`,
      );
      return 0; // 纸质书
    } else if (digitalTypes.includes(item.itemType)) {
      logger.info(
        `ItemType '${item.itemType}' is digital type, identifying as ebook (type: 1) for item: ${item.title}`,
      );
      return 1; // 电子书
    }

    // 默认为电子书
    logger.info(
      `ItemType '${item.itemType}' not recognized, defaulting to ebook (type: 1) for item: ${item.title}`,
    );
    return 1;
  }

  // 确定位置单位
  private determineLocationUnit(item: ZoteroItem): 0 | 1 | 2 {
    const bookType = this.determineBookType(item);

    if (bookType === 0) {
      // 纸质书使用页码
      return 2;
    } else {
      // 电子书使用位置
      return 1;
    }
  }

  // 添加PDF页数信息
  private addPdfPageInfo(
    item: ZoteroItem,
    annotations: ZoteroAnnotation[],
    xmnoteNote: XMnoteNote,
  ): void {
    // 优先从Zotero主条目字段获取页数信息
    logger.info(`Checking page count for item: ${item.title}`);

    // 1. 检查Zotero条目本身的页数字段
    const pageFields = [
      "numPages", // 页数
      "pages", // 页码范围
      "totalPages", // 总页数
      "numberOfPages", // 页数（某些条目类型）
    ];

    for (const field of pageFields) {
      const fieldValue = (item as any)[field];
      if (fieldValue) {
        let pageCount: number | null = null;

        if (typeof fieldValue === "number") {
          pageCount = fieldValue;
        } else if (typeof fieldValue === "string") {
          // 处理页码范围格式，如 "1-233", "pp. 1-233" 等
          const pageMatch = fieldValue.match(/(\d+)[-–](\d+)/);
          if (pageMatch) {
            const startPage = parseInt(pageMatch[1], 10);
            const endPage = parseInt(pageMatch[2], 10);
            pageCount = endPage - startPage + 1;
          } else {
            // 尝试提取单个数字
            const numberMatch = fieldValue.match(/\d+/);
            if (numberMatch) {
              pageCount = parseInt(numberMatch[0], 10);
            }
          }
        }

        if (pageCount && pageCount > 0) {
          xmnoteNote.totalPageCount = pageCount;
          logger.info(
            `Found page count from field '${field}': ${pageCount} for item: ${item.title}`,
          );
          break; // 找到后跳出循环，但继续执行currentPage逻辑
        }
      }
    }

    // 2. 如果主条目字段没有页数信息，再检查PDF附件
    if (!xmnoteNote.totalPageCount) {
      logger.info(
        `No page count in item fields, checking attachments for item: ${item.title}`,
      );

      if (!item.attachments) {
        logger.info(`No attachments found for item: ${item.title}`);
      } else {
        logger.info(
          `Found ${item.attachments.length} attachments for item: ${item.title}`,
        );

        for (const attachment of item.attachments) {
          logger.info(
            `Attachment: ${attachment.title}, contentType: ${attachment.contentType}, numPages: ${attachment.numPages}`,
          );

          if (attachment.contentType === "application/pdf") {
            if (attachment.numPages) {
              xmnoteNote.totalPageCount = attachment.numPages;
              logger.info(
                `Found PDF with ${attachment.numPages} pages for item: ${item.title}`,
              );
              break; // 使用第一个找到的PDF页数，但继续执行currentPage逻辑
            } else {
              logger.info(
                `PDF attachment found but no page count available: ${attachment.title}`,
              );
            }
          }
        }
      }
    }
  }

  // 设置当前页数
  private setCurrentPage(
    item: ZoteroItem,
    annotations: ZoteroAnnotation[],
    xmnoteNote: XMnoteNote,
  ): void {
    const config = configManager.getImportOptions();
    if (config.includeCurrentPage) {
      logger.info(`Including current page as per configuration`);

      // 检查是否有totalPageCount
      if (xmnoteNote.totalPageCount && xmnoteNote.totalPageCount > 0) {
        logger.info(
          `totalPageCount available (${xmnoteNote.totalPageCount}), proceeding with currentPage calculation`,
        );

        // 获取已有笔记或书摘的最大页数作为当前页数
        let maxPage = 0;
        if (annotations.length > 0) {
          for (const annotation of annotations) {
            if (annotation.pageLabel) {
              const pageNum = this.extractPageNumber(annotation.pageLabel);
              if (pageNum && pageNum > maxPage) {
                maxPage = pageNum;
              }
            }
          }
        }

        // 设置currentPage：有笔记则用最大页数，没有笔记则默认为1
        if (maxPage > 0) {
          xmnoteNote.currentPage = maxPage;
          logger.info(
            `Found max annotation page: ${maxPage} for item: ${item.title}`,
          );
        } else {
          xmnoteNote.currentPage = 1;
          logger.info(
            `No annotations found, set currentPage to 1 as default for item: ${item.title}`,
          );
        }
      } else {
        // 没有totalPageCount，清除currentPage和totalPageCount字段
        logger.warn(
          `No totalPageCount found for item: ${item.title}, removing both currentPage and totalPageCount fields to avoid import failure`,
        );
        delete xmnoteNote.currentPage;
        delete xmnoteNote.totalPageCount;
      }
    } else {
      logger.info(`Skipping current page as per configuration`);

      // 不包含currentPage时，删除totalPageCount以确保成对出现
      if (xmnoteNote.totalPageCount) {
        logger.info(
          `Removing totalPageCount since currentPage is not included for item: ${item.title}`,
        );
        delete xmnoteNote.totalPageCount;
      }
    }
  }

  // 转换元数据
  private transformMetadata(item: ZoteroItem, xmnoteNote: XMnoteNote): void {
    const config = configManager.getImportOptions();

    if (!config.includeMetadata) {
      return;
    }

    // 作者信息
    if (item.creators && item.creators.length > 0) {
      const authors = item.creators
        .filter((creator) => creator.creatorType === "author")
        .map((creator) => {
          if (creator.name) {
            return creator.name;
          } else if (creator.firstName && creator.lastName) {
            return `${creator.firstName} ${creator.lastName}`;
          } else if (creator.lastName) {
            return creator.lastName;
          }
          return "";
        })
        .filter((name) => name.length > 0);

      if (authors.length > 0) {
        xmnoteNote.author = authors.join(", ");
      }

      // 译者信息
      const translators = item.creators
        .filter((creator) => creator.creatorType === "translator")
        .map((creator) => {
          if (creator.name) {
            return creator.name;
          } else if (creator.firstName && creator.lastName) {
            return `${creator.firstName} ${creator.lastName}`;
          } else if (creator.lastName) {
            return creator.lastName;
          }
          return "";
        })
        .filter((name) => name.length > 0);

      if (translators.length > 0) {
        xmnoteNote.translator = translators.join(", ");
      }
    }

    // 出版信息
    if (item.publisher) {
      xmnoteNote.publisher = item.publisher;
    }

    if (item.date) {
      // 尝试解析日期
      const publishDate = this.parseDate(item.date);
      if (publishDate) {
        xmnoteNote.publishDate = Math.floor(publishDate.getTime() / 1000);
      }
    }

    // ISBN
    if (item.ISBN) {
      xmnoteNote.isbn = item.ISBN;
    }

    // 摘要
    if (item.abstractNote) {
      xmnoteNote.bookSummary = item.abstractNote;
    }

    // 标签
    if (item.tags && item.tags.length > 0) {
      xmnoteNote.tags = item.tags.map((tag) => tag.tag);
    }

    // 分组（使用第一个分类）
    if (item.collections && item.collections.length > 0) {
      xmnoteNote.group = item.collections[0];
    }

    // 来源
    xmnoteNote.source = "Zotero";

    // 默认阅读状态为"在读"
    xmnoteNote.readingStatus = 2;

    if (item.dateAdded) {
      xmnoteNote.readingStatusChangedDate = Math.floor(
        item.dateAdded.getTime() / 1000,
      );
    }
  }

  // 转换笔记和注释为条目
  private transformEntries(
    notes: ZoteroNote[],
    annotations: ZoteroAnnotation[],
  ): XMnoteEntry[] {
    const entries: XMnoteEntry[] = [];

    // 转换笔记
    for (const note of notes) {
      const entry: XMnoteEntry = {
        note: this.cleanHtmlContent(note.note),
        time: Math.floor(note.dateAdded.getTime() / 1000),
      };

      // 如果笔记有标题且与内容不同，将标题作为章节
      if (note.title && note.title !== "Note") {
        entry.chapter = note.title;
      }

      entries.push(entry);
    }

    // 转换注释
    for (const annotation of annotations) {
      const entry: XMnoteEntry = {
        time: Math.floor(annotation.dateAdded.getTime() / 1000),
      };

      // 页码信息
      if (annotation.pageLabel) {
        const pageNum = this.extractPageNumber(annotation.pageLabel);
        if (pageNum) {
          entry.page = pageNum;
        }
      }

      // 原文摘录
      if (annotation.text) {
        entry.text = annotation.text.trim();
      }

      // 评论作为想法
      if (annotation.comment) {
        entry.note = annotation.comment.trim();
      }

      // 如果既没有原文也没有评论，跳过这个注释
      if (!entry.text && !entry.note) {
        continue;
      }

      entries.push(entry);
    }

    // 按时间排序
    entries.sort((a, b) => (a.time || 0) - (b.time || 0));

    return entries;
  }

  // 清理HTML内容
  private cleanHtmlContent(html: string): string {
    if (!html) return "";

    // 移除HTML标签
    let cleaned = html.replace(/<[^>]*>/g, "");

    // 解码HTML实体
    cleaned = cleaned
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");

    // 清理多余的空白字符
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    return cleaned;
  }

  // 提取页码数字
  private extractPageNumber(pageLabel: string): number | undefined {
    if (!pageLabel) return undefined;

    // 尝试提取数字
    const match = pageLabel.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }

    return undefined;
  }

  // 解析日期字符串
  private parseDate(dateString: string): Date | null {
    if (!dateString) return null;

    try {
      // 尝试各种日期格式
      const formats = [
        // ISO 格式
        /^\d{4}-\d{2}-\d{2}$/,
        // 年份格式
        /^\d{4}$/,
        // 年月格式
        /^\d{4}-\d{2}$/,
      ];

      for (const format of formats) {
        if (format.test(dateString)) {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }

      // 尝试直接解析
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }

      return null;
    } catch (error) {
      logger.warn(`Failed to parse date: ${dateString}`, error);
      return null;
    }
  }

  // 生成条目的唯一标识符
  generateEntryId(item: ZoteroItem, entryIndex: number): string {
    return `zotero-${item.id}-entry-${entryIndex}`;
  }

  // 预览转换结果
  previewTransformation(
    item: ZoteroItem,
    notes: ZoteroNote[],
    annotations: ZoteroAnnotation[],
  ): {
    note: XMnoteNote;
    stats: {
      originalNotes: number;
      originalAnnotations: number;
      transformedEntries: number;
      metadata: string[];
    };
  } {
    const transformedNote = this.transformItem(item, notes, annotations);

    const metadata: string[] = [];
    if (transformedNote.author) metadata.push("author");
    if (transformedNote.publisher) metadata.push("publisher");
    if (transformedNote.publishDate) metadata.push("publishDate");
    if (transformedNote.isbn) metadata.push("isbn");
    if (transformedNote.bookSummary) metadata.push("bookSummary");
    if (transformedNote.tags) metadata.push("tags");
    if (transformedNote.group) metadata.push("group");

    return {
      note: transformedNote,
      stats: {
        originalNotes: notes.length,
        originalAnnotations: annotations.length,
        transformedEntries: transformedNote.entries?.length || 0,
        metadata,
      },
    };
  }
}

// 导出单例实例
let transformerInstance: DataTransformerImpl | null = null;

export function getDataTransformer(): DataTransformerImpl {
  if (!transformerInstance) {
    transformerInstance = new DataTransformerImpl();
  }
  return transformerInstance;
}
