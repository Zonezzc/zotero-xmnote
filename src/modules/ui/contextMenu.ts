// 右键菜单处理器：为条目添加XMnote导出选项

import { logger } from "../../utils/logger";
import { ExportDialog } from "./exportDialog";

export class ContextMenuHandler {
  // 注册条目右键菜单
  static registerItemContextMenu(): void {
    try {
      logger.info("Registering item context menu...");

      const menuIcon = `chrome://${addon.data.config.addonRef}/content/icons/favicon@0.5x.png`;

      // 添加快速导出菜单项
      ztoolkit.Menu.register("item", {
        tag: "menuitem",
        id: "zotero-itemmenu-xmnote-quick-export",
        label: "Quick Export to XMnote",
        commandListener: async (ev) => {
          try {
            const selectedItems = await ExportDialog.createSelectedItemsInfo();
            if (selectedItems.length === 0) {
              ztoolkit.getGlobal("alert")("No items selected for export.");
              return;
            }

            await ExportDialog.quickExport(selectedItems);
          } catch (error) {
            logger.error("Failed to quick export:", error);
            ztoolkit.getGlobal("alert")(
              `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        },
        icon: menuIcon,
      });

      // 添加带选项的导出菜单项
      ztoolkit.Menu.register("item", {
        tag: "menuitem",
        id: "zotero-itemmenu-xmnote-export-with-options",
        label: "Export to XMnote...",
        commandListener: async (ev) => {
          try {
            const selectedItems = await ExportDialog.createSelectedItemsInfo();
            await ExportDialog.show(selectedItems);
          } catch (error) {
            logger.error("Failed to show export dialog:", error);
            ztoolkit.getGlobal("alert")(
              `Failed to open export dialog: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        },
        icon: menuIcon,
      });

      logger.info("Item context menu registered successfully");
    } catch (error) {
      logger.error("Failed to register item context menu:", error);
    }
  }

  // 注册分类右键菜单
  static registerCollectionContextMenu(): void {
    try {
      logger.info("Registering collection context menu...");

      const menuIcon = `chrome://${addon.data.config.addonRef}/content/icons/favicon@0.5x.png`;

      // 添加导出整个分类的菜单项
      ztoolkit.Menu.register("collection", {
        tag: "menuitem",
        id: "zotero-collectionmenu-xmnote-export",
        label: "Export Collection to XMnote...",
        commandListener: async (ev) => {
          try {
            const collectionItems = await this.getCollectionItems();
            if (collectionItems.length === 0) {
              ztoolkit.getGlobal("alert")(
                "No items found in selected collection.",
              );
              return;
            }

            await ExportDialog.show(collectionItems);
          } catch (error) {
            logger.error("Failed to export collection:", error);
            ztoolkit.getGlobal("alert")(
              `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        },
        icon: menuIcon,
      });

      logger.info("Collection context menu registered successfully");
    } catch (error) {
      logger.error("Failed to register collection context menu:", error);
    }
  }

  // 获取选中分类的所有条目
  private static async getCollectionItems(): Promise<any[]> {
    try {
      const zoteroPane = ztoolkit.getGlobal("ZoteroPane");
      const selectedCollection = zoteroPane.getSelectedCollection();

      if (!selectedCollection) {
        logger.warn("No collection selected");
        return [];
      }

      logger.info(`Getting items from collection: ${selectedCollection.name}`);

      // 获取分类中的所有条目
      const items = selectedCollection.getChildItems();
      const regularItems = items.filter(
        (item: any) => item.isRegularItem() && !item.deleted,
      );

      logger.info(`Found ${regularItems.length} items in collection`);

      // 转换为ItemInfo格式
      const itemsInfo = [];
      for (const item of regularItems) {
        try {
          const itemInfo = {
            id: item.id,
            title: item.getField("title") || "Untitled",
            itemType: item.itemType,
            creators: ExportDialog.formatCreators
              ? ExportDialog.formatCreators(item)
              : "Unknown",
            date: item.getField("date") || undefined,
            collections: ExportDialog.getItemCollections
              ? ExportDialog.getItemCollections(item)
              : [],
            tags: ExportDialog.getItemTags
              ? ExportDialog.getItemTags(item)
              : [],
          };

          itemsInfo.push(itemInfo);
        } catch (error) {
          logger.warn(`Failed to process collection item ${item.id}:`, error);
        }
      }

      return itemsInfo;
    } catch (error) {
      logger.error("Failed to get collection items:", error);
      return [];
    }
  }

  // 清理菜单项
  static unregisterMenus(): void {
    try {
      logger.info("Unregistering context menus...");

      // 这里可以添加清理逻辑，如果需要的话
      // Zotero插件框架通常会在插件卸载时自动清理菜单项

      logger.info("Context menus unregistered");
    } catch (error) {
      logger.error("Failed to unregister context menus:", error);
    }
  }
}
