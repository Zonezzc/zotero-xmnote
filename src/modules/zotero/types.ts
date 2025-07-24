// Zotero 数据相关的类型定义

export interface ZoteroItem {
  id: number;
  title: string;
  itemType: string;
  creators: ZoteroCreator[];
  abstractNote?: string;
  publisher?: string;
  date?: string;
  ISBN?: string;
  tags: ZoteroTag[];
  collections: string[];
  dateAdded?: Date;
  dateModified?: Date;
}

export interface ZoteroCreator {
  firstName?: string;
  lastName?: string;
  name?: string;
  creatorType: string;
}

export interface ZoteroTag {
  tag: string;
  type?: number;
}

export interface ZoteroNote {
  id: number;
  parentItemID: number;
  title: string;
  note: string;
  dateAdded: Date;
  dateModified: Date;
}

export interface ZoteroAnnotation {
  id: number;
  parentItemID: number;
  type: string;
  text: string;
  comment?: string;
  color?: string;
  pageLabel?: string;
  position?: any;
  dateAdded: Date;
  dateModified: Date;
}

export interface ZoteroMetadata {
  itemID: number;
  title: string;
  creators: ZoteroCreator[];
  publisher?: string;
  date?: string;
  ISBN?: string;
  abstractNote?: string;
  itemType: string;
  tags: ZoteroTag[];
  collections: string[];
}

export interface ZoteroDataExtractor {
  // 获取所有条目
  getAllItems(): Promise<ZoteroItem[]>;

  // 获取指定条目的笔记
  getItemNotes(itemId: number): ZoteroNote[];

  // 获取指定条目的注释
  getItemAnnotations(itemId: number): ZoteroAnnotation[];

  // 获取条目元数据
  getItemMetadata(itemId: number): ZoteroMetadata;
}

export interface TransformInput {
  item: ZoteroItem;
  notes: ZoteroNote[];
  annotations: ZoteroAnnotation[];
}

export interface DataTransformer {
  // 转换Zotero条目到XMnote格式
  transformItem(
    item: ZoteroItem,
    notes: ZoteroNote[],
    annotations: ZoteroAnnotation[],
  ): import("../xmnote/types").XMnoteNote;

  // 批量转换
  transformItems(
    items: TransformInput[],
  ): import("../xmnote/types").XMnoteNote[];

  // 验证转换结果
  validateNote(
    note: import("../xmnote/types").XMnoteNote,
  ): import("../config/types").ValidationResult;
}
