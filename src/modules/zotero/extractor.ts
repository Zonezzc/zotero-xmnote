// Zotero 数据提取器

import { logger } from "../../utils/logger";
import type {
  ZoteroAnnotation,
  ZoteroCreator,
  ZoteroDataExtractor,
  ZoteroItem,
  ZoteroMetadata,
  ZoteroNote,
  ZoteroTag,
} from "./types";

export class ZoteroDataExtractorImpl implements ZoteroDataExtractor {
  // 获取所有条目
  async getAllItems(): Promise<ZoteroItem[]> {
    try {
      logger.info("Extracting all items from Zotero");

      const search = new Zotero.Search();
      search.addCondition("itemType", "isNot", "attachment");
      search.addCondition("itemType", "isNot", "note");
      const itemIDs = await search.search();
      const items = await Zotero.Items.getAsync(itemIDs);
      const extractedItems: ZoteroItem[] = [];

      for (const item of items) {
        // 只处理常规条目，排除附件和笔记
        if (item.isRegularItem()) {
          const extractedItem = this.extractItem(item);
          if (extractedItem) {
            extractedItems.push(extractedItem);
          }
        }
      }

      logger.info(`Extracted ${extractedItems.length} items from Zotero`);
      return extractedItems;
    } catch (error) {
      logger.error("Failed to extract items from Zotero:", error);
      return [];
    }
  }

  // 获取指定条目的笔记
  getItemNotes(itemId: number): ZoteroNote[] {
    try {
      logger.debug(`Extracting notes for item ${itemId}`);

      const item = Zotero.Items.get(itemId);
      if (!item) {
        logger.warn(`Item ${itemId} not found`);
        return [];
      }

      const noteIds = item.getNotes();
      const notes: ZoteroNote[] = [];

      for (const noteId of noteIds) {
        const noteItem = Zotero.Items.get(noteId);
        if (noteItem && noteItem.isNote()) {
          const extractedNote = this.extractNote(noteItem);
          if (extractedNote) {
            notes.push(extractedNote);
          }
        }
      }

      logger.debug(`Extracted ${notes.length} notes for item ${itemId}`);
      return notes;
    } catch (error) {
      logger.error(`Failed to extract notes for item ${itemId}:`, error);
      return [];
    }
  }

  // 获取指定条目的注释
  getItemAnnotations(itemId: number): ZoteroAnnotation[] {
    try {
      logger.debug(`Extracting annotations for item ${itemId}`);

      const item = Zotero.Items.get(itemId);
      if (!item) {
        logger.warn(`Item ${itemId} not found`);
        return [];
      }

      const attachments = item.getAttachments();
      const annotations: ZoteroAnnotation[] = [];

      for (const attachmentId of attachments) {
        const attachment = Zotero.Items.get(attachmentId);
        if (attachment && attachment.isPDFAttachment()) {
          const annotationItems = attachment.getAnnotations();

          for (const annotationItem of annotationItems) {
            const extractedAnnotation = this.extractAnnotation(annotationItem);
            if (extractedAnnotation) {
              annotations.push(extractedAnnotation);
            }
          }
        }
      }

      logger.debug(
        `Extracted ${annotations.length} annotations for item ${itemId}`,
      );
      return annotations;
    } catch (error) {
      logger.error(`Failed to extract annotations for item ${itemId}:`, error);
      return [];
    }
  }

  // 获取条目元数据
  getItemMetadata(itemId: number): ZoteroMetadata {
    try {
      const item = Zotero.Items.get(itemId);
      if (!item) {
        throw new Error(`Item ${itemId} not found`);
      }

      return {
        itemID: itemId,
        title: item.getField("title") || "",
        creators: this.extractCreators(item),
        publisher: item.getField("publisher") || undefined,
        date: item.getField("date") || undefined,
        ISBN: item.getField("ISBN") || undefined,
        abstractNote: item.getField("abstractNote") || undefined,
        itemType: item.itemType,
        tags: this.extractTags(item),
        collections: this.extractCollections(item),
      };
    } catch (error) {
      logger.error(`Failed to extract metadata for item ${itemId}:`, error);
      throw error;
    }
  }

  // 提取单个条目
  private extractItem(item: any): ZoteroItem | null {
    try {
      return {
        id: item.id,
        title: item.getField("title") || "",
        itemType: item.itemType,
        creators: this.extractCreators(item),
        abstractNote: item.getField("abstractNote") || undefined,
        publisher: item.getField("publisher") || undefined,
        date: item.getField("date") || undefined,
        ISBN: item.getField("ISBN") || undefined,
        tags: this.extractTags(item),
        collections: this.extractCollections(item),
        dateAdded: item.dateAdded ? new Date(item.dateAdded) : undefined,
        dateModified: item.dateModified
          ? new Date(item.dateModified)
          : undefined,
      };
    } catch (error) {
      logger.error(`Failed to extract item ${item.id}:`, error);
      return null;
    }
  }

  // 提取创作者信息
  private extractCreators(item: any): ZoteroCreator[] {
    try {
      const creators = item.getCreators();
      return creators.map((creator: any) => ({
        firstName: creator.firstName || undefined,
        lastName: creator.lastName || undefined,
        name: creator.name || undefined,
        creatorType: creator.creatorType,
      }));
    } catch (error) {
      logger.error("Failed to extract creators:", error);
      return [];
    }
  }

  // 提取标签
  private extractTags(item: any): ZoteroTag[] {
    try {
      const tags = item.getTags();
      return tags.map((tag: any) => ({
        tag: tag.tag,
        type: tag.type,
      }));
    } catch (error) {
      logger.error("Failed to extract tags:", error);
      return [];
    }
  }

  // 提取分类集合
  private extractCollections(item: any): string[] {
    try {
      const collections = item.getCollections();
      return collections.map((collectionId: number) => {
        const collection = Zotero.Collections.get(collectionId);
        return collection ? collection.name : `Collection ${collectionId}`;
      });
    } catch (error) {
      logger.error("Failed to extract collections:", error);
      return [];
    }
  }

  // 提取笔记
  private extractNote(noteItem: any): ZoteroNote | null {
    try {
      return {
        id: noteItem.id,
        parentItemID: noteItem.parentItemID,
        title: noteItem.getField("title") || "",
        note: noteItem.getNote() || "",
        dateAdded: new Date(noteItem.dateAdded),
        dateModified: new Date(noteItem.dateModified),
      };
    } catch (error) {
      logger.error(`Failed to extract note ${noteItem.id}:`, error);
      return null;
    }
  }

  // 提取注释
  private extractAnnotation(annotationItem: any): ZoteroAnnotation | null {
    try {
      const annotationText = annotationItem.annotationText || "";
      const annotationComment = annotationItem.annotationComment || "";

      return {
        id: annotationItem.id,
        parentItemID: annotationItem.parentItemID,
        type: annotationItem.annotationType || "",
        text: annotationText,
        comment: annotationComment || undefined,
        color: annotationItem.annotationColor || undefined,
        pageLabel: annotationItem.annotationPageLabel || undefined,
        position: annotationItem.annotationPosition || undefined,
        dateAdded: new Date(annotationItem.dateAdded),
        dateModified: new Date(annotationItem.dateModified),
      };
    } catch (error) {
      logger.error(`Failed to extract annotation ${annotationItem.id}:`, error);
      return null;
    }
  }

  // 根据条件筛选条目
  filterItems(
    items: ZoteroItem[],
    filter: {
      itemTypes?: string[];
      hasNotes?: boolean;
      hasAnnotations?: boolean;
      tags?: string[];
      collections?: string[];
      dateAfter?: Date;
      dateBefore?: Date;
    },
  ): ZoteroItem[] {
    return items.filter((item) => {
      // 按条目类型筛选
      if (filter.itemTypes && !filter.itemTypes.includes(item.itemType)) {
        return false;
      }

      // 按是否有笔记筛选
      if (filter.hasNotes !== undefined) {
        const hasNotes = this.getItemNotes(item.id).length > 0;
        if (filter.hasNotes !== hasNotes) {
          return false;
        }
      }

      // 按是否有注释筛选
      if (filter.hasAnnotations !== undefined) {
        const hasAnnotations = this.getItemAnnotations(item.id).length > 0;
        if (filter.hasAnnotations !== hasAnnotations) {
          return false;
        }
      }

      // 按标签筛选
      if (filter.tags && filter.tags.length > 0) {
        const itemTags = item.tags.map((tag) => tag.tag);
        const hasMatchingTag = filter.tags.some((tag) =>
          itemTags.includes(tag),
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      // 按分类筛选
      if (filter.collections && filter.collections.length > 0) {
        const hasMatchingCollection = filter.collections.some((collection) =>
          item.collections.includes(collection),
        );
        if (!hasMatchingCollection) {
          return false;
        }
      }

      // 按日期筛选
      if (
        filter.dateAfter &&
        item.dateAdded &&
        item.dateAdded < filter.dateAfter
      ) {
        return false;
      }

      if (
        filter.dateBefore &&
        item.dateAdded &&
        item.dateAdded > filter.dateBefore
      ) {
        return false;
      }

      return true;
    });
  }
}

// 导出单例实例
let extractorInstance: ZoteroDataExtractorImpl | null = null;

export function getZoteroDataExtractor(): ZoteroDataExtractorImpl {
  if (!extractorInstance) {
    extractorInstance = new ZoteroDataExtractorImpl();
  }
  return extractorInstance;
}
