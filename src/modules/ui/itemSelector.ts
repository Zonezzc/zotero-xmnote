// 条目选择器：处理条目筛选、搜索和选择逻辑

import { logger } from "../../utils/logger";

export interface FilterState {
  itemTypes?: string[];
  collections?: string[];
  tags?: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export interface ZoteroItemInfo {
  id: number;
  title: string;
  itemType: string;
  creators: string;
  date?: string;
  collections: string[];
  tags: string[];
}

export interface ItemSelectionData {
  available: ZoteroItemInfo[];
  selected: ZoteroItemInfo[];
  searchQuery: string;
  filters: FilterState;
  totalCount: number;
}

export class ItemSelector {
  private allItems: ZoteroItemInfo[] = [];
  private filteredItems: ZoteroItemInfo[] = [];
  private selectedItems: Set<number> = new Set();
  private searchQuery: string = "";
  private filters: FilterState = {};

  constructor(preSelectedItemIds?: number[]) {
    if (preSelectedItemIds) {
      preSelectedItemIds.forEach((id) => this.selectedItems.add(id));
    }
  }

  // 加载所有条目
  async loadAllItems(): Promise<void> {
    try {
      logger.info("Loading all Zotero items for selection...");

      const allZoteroItems = await Zotero.Items.getAll(
        Zotero.Libraries.userLibraryID,
      );
      this.allItems = [];

      for (const item of allZoteroItems) {
        if (!item.isRegularItem() || item.deleted) {
          continue;
        }

        try {
          const itemInfo: ZoteroItemInfo = {
            id: item.id,
            title: item.getField("title") || "Untitled",
            itemType: item.itemType,
            creators: this.formatCreators(item),
            date: item.getField("date") || undefined,
            collections: this.getItemCollections(item),
            tags: this.getItemTags(item),
          };

          this.allItems.push(itemInfo);
        } catch (error) {
          logger.warn(`Failed to process item ${item.id}:`, error);
        }
      }

      logger.info(`Loaded ${this.allItems.length} items for selection`);
      this.applyFilters();
    } catch (error) {
      logger.error("Failed to load items:", error);
      throw error;
    }
  }

  // 格式化创作者信息
  private formatCreators(item: Zotero.Item): string {
    try {
      const creators = item.getCreators();
      if (!creators || creators.length === 0) {
        return "Unknown";
      }

      return (
        creators
          .slice(0, 3) // 最多显示3个作者
          .map((creator: any) => {
            if (creator.lastName && creator.firstName) {
              return `${creator.lastName}, ${creator.firstName}`;
            } else if (creator.lastName) {
              return creator.lastName;
            } else if (creator.name) {
              return creator.name;
            } else {
              return "Unknown";
            }
          })
          .join("; ") + (creators.length > 3 ? " et al." : "")
      );
    } catch (error) {
      logger.warn(`Failed to format creators for item ${item.id}:`, error);
      return "Unknown";
    }
  }

  // 获取条目的分类信息
  private getItemCollections(item: Zotero.Item): string[] {
    try {
      const collections = item.getCollections();
      return collections.map((collectionID: number) => {
        const collection = Zotero.Collections.get(collectionID);
        return collection ? collection.name : `Collection ${collectionID}`;
      });
    } catch (error) {
      logger.warn(`Failed to get collections for item ${item.id}:`, error);
      return [];
    }
  }

  // 获取条目的标签信息
  private getItemTags(item: Zotero.Item): string[] {
    try {
      const tags = item.getTags();
      return tags.map((tag: any) => tag.tag || tag.name || "").filter(Boolean);
    } catch (error) {
      logger.warn(`Failed to get tags for item ${item.id}:`, error);
      return [];
    }
  }

  // 搜索条目
  search(query: string): void {
    this.searchQuery = query.toLowerCase().trim();
    this.applyFilters();
  }

  // 应用筛选器
  setFilters(filters: FilterState): void {
    this.filters = { ...filters };
    this.applyFilters();
  }

  // 应用搜索和筛选
  private applyFilters(): void {
    this.filteredItems = this.allItems.filter((item) => {
      // 搜索筛选
      if (this.searchQuery) {
        const searchFields = [
          item.title,
          item.creators,
          item.itemType,
          ...item.tags,
          ...item.collections,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchFields.includes(this.searchQuery)) {
          return false;
        }
      }

      // 条目类型筛选
      if (this.filters.itemTypes && this.filters.itemTypes.length > 0) {
        if (!this.filters.itemTypes.includes(item.itemType)) {
          return false;
        }
      }

      // 分类筛选
      if (this.filters.collections && this.filters.collections.length > 0) {
        const hasMatchingCollection = this.filters.collections.some(
          (collection) => item.collections.includes(collection),
        );
        if (!hasMatchingCollection) {
          return false;
        }
      }

      // 标签筛选
      if (this.filters.tags && this.filters.tags.length > 0) {
        const hasMatchingTag = this.filters.tags.some((tag) =>
          item.tags.includes(tag),
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      // 日期筛选
      if (this.filters.dateRange) {
        const itemDate = item.date ? new Date(item.date) : null;
        if (itemDate) {
          if (
            this.filters.dateRange.from &&
            itemDate < this.filters.dateRange.from
          ) {
            return false;
          }
          if (
            this.filters.dateRange.to &&
            itemDate > this.filters.dateRange.to
          ) {
            return false;
          }
        }
      }

      return true;
    });

    logger.debug(
      `Filtered ${this.filteredItems.length} items from ${this.allItems.length} total`,
    );
  }

  // 选择条目
  selectItem(itemId: number): void {
    this.selectedItems.add(itemId);
  }

  // 取消选择条目
  deselectItem(itemId: number): void {
    this.selectedItems.delete(itemId);
  }

  // 切换选择状态
  toggleItem(itemId: number): void {
    if (this.selectedItems.has(itemId)) {
      this.deselectItem(itemId);
    } else {
      this.selectItem(itemId);
    }
  }

  // 全选当前筛选结果
  selectAll(): void {
    this.filteredItems.forEach((item) => this.selectedItems.add(item.id));
  }

  // 清除所有选择
  clearSelection(): void {
    this.selectedItems.clear();
  }

  // 检查条目是否被选中
  isSelected(itemId: number): boolean {
    return this.selectedItems.has(itemId);
  }

  // 获取筛选后的条目
  getFilteredItems(): ZoteroItemInfo[] {
    return [...this.filteredItems];
  }

  // 获取选中的条目
  getSelectedItems(): ZoteroItemInfo[] {
    return this.allItems.filter((item) => this.selectedItems.has(item.id));
  }

  // 获取选中的条目ID
  getSelectedItemIds(): number[] {
    return Array.from(this.selectedItems);
  }

  // 获取当前选择状态数据
  getSelectionData(): ItemSelectionData {
    return {
      available: this.filteredItems,
      selected: this.getSelectedItems(),
      searchQuery: this.searchQuery,
      filters: { ...this.filters },
      totalCount: this.allItems.length,
    };
  }

  // 获取统计信息
  getStats() {
    return {
      total: this.allItems.length,
      filtered: this.filteredItems.length,
      selected: this.selectedItems.size,
    };
  }

  // 获取可用的筛选选项
  async getAvailableFilterOptions() {
    const itemTypes = new Set<string>();
    const collections = new Set<string>();
    const tags = new Set<string>();

    this.allItems.forEach((item) => {
      itemTypes.add(item.itemType);
      item.collections.forEach((collection) => collections.add(collection));
      item.tags.forEach((tag) => tags.add(tag));
    });

    return {
      itemTypes: Array.from(itemTypes).sort(),
      collections: Array.from(collections).sort(),
      tags: Array.from(tags).sort(),
    };
  }
}
