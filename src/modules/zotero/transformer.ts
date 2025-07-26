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
    // 根据Zotero条目类型判断
    const physicalTypes = ["book", "bookSection", "manuscript"];
    const digitalTypes = ["computerProgram", "webpage", "blogPost"];

    if (physicalTypes.includes(item.itemType)) {
      return 0; // 纸质书
    } else if (digitalTypes.includes(item.itemType)) {
      return 1; // 电子书
    }

    // 默认为电子书
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
    // 获取PDF附件的总页数
    logger.info(`Checking attachments for item: ${item.title}`);
    
    if (!item.attachments) {
      logger.info(`No attachments found for item: ${item.title}`);
    } else {
      logger.info(`Found ${item.attachments.length} attachments for item: ${item.title}`);
      
      for (const attachment of item.attachments) {
        logger.info(`Attachment: ${attachment.title}, contentType: ${attachment.contentType}, numPages: ${attachment.numPages}`);
        
        if (attachment.contentType === "application/pdf") {
          if (attachment.numPages) {
            xmnoteNote.totalPageCount = attachment.numPages;
            logger.info(`Found PDF with ${attachment.numPages} pages for item: ${item.title}`);
            break; // 使用第一个找到的PDF页数
          } else {
            logger.info(`PDF attachment found but no page count available: ${attachment.title}`);
          }
        }
      }
    }

    // 获取已有笔记或书摘的最大页数作为当前页数
    if (annotations.length > 0) {
      let maxPage = 0;
      
      for (const annotation of annotations) {
        if (annotation.pageLabel) {
          const pageNum = this.extractPageNumber(annotation.pageLabel);
          if (pageNum && pageNum > maxPage) {
            maxPage = pageNum;
          }
        }
      }
      
      if (maxPage > 0) {
        xmnoteNote.currentPage = maxPage;
        logger.debug(`Found max annotation page: ${maxPage} for item: ${item.title}`);
      }
    }

    // 如果没有找到注释页数，但有总页数，则设置当前页数为1
    if (!xmnoteNote.currentPage && xmnoteNote.totalPageCount) {
      xmnoteNote.currentPage = 1;
    }
    
    // 如果还是没有totalPageCount，尝试从currentPage推断或设置默认值
    if (!xmnoteNote.totalPageCount) {
      if (xmnoteNote.currentPage && xmnoteNote.currentPage > 0) {
        // 如果有currentPage，推断totalPageCount至少等于currentPage
        xmnoteNote.totalPageCount = Math.max(xmnoteNote.currentPage, 100); // 默认假设至少100页
        logger.info(`No PDF page count found, estimated totalPageCount: ${xmnoteNote.totalPageCount} based on currentPage: ${xmnoteNote.currentPage}`);
      } else {
        // 如果都没有，设置一个合理的默认值
        xmnoteNote.totalPageCount = 200; // 默认200页
        logger.info(`No PDF page count or annotations found, using default totalPageCount: ${xmnoteNote.totalPageCount}`);
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

    // 默认阅读状态为"想读"
    xmnoteNote.readingStatus = 1;

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
