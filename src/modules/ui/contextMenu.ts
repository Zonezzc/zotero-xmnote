// 右键菜单处理器：为条目添加XMnote导出选项

import { logger } from "../../utils/logger";
import {
  getNativeMenuManager,
  type NativeMenuManager,
} from "../../utils/ztoolkit";
import { ExportDialog } from "./exportDialog";

export class ContextMenuHandler {
  private static nativeMenuIDs: string[] = [];

  // 注册条目右键菜单
  static registerItemContextMenu(): void {
    try {
      logger.info("Registering item context menu...");

      const menuManager = getNativeMenuManager();
      if (menuManager) {
        try {
          this.registerNativeItemContextMenu(menuManager);
          logger.info("Item context menu registered with Zotero.MenuManager");
          return;
        } catch (error) {
          logger.warn(
            "Native item context menu registration failed, falling back to ztoolkit.Menu:",
            error,
          );
          this.unregisterNativeMenus(menuManager);
        }
      }

      const menuIcon = `chrome://${addon.data.config.addonRef}/content/icons/favicon@0.5x.png`;

      // 添加快速导出菜单项
      ztoolkit.Menu.register("item", {
        tag: "menuitem",
        id: "zotero-itemmenu-xmnote-quick-export",
        label: "Quick Export to XMnote",
        commandListener: async () => this.quickExportItems(),
        icon: menuIcon,
      });

      // 添加带选项的导出菜单项
      ztoolkit.Menu.register("item", {
        tag: "menuitem",
        id: "zotero-itemmenu-xmnote-export-with-options",
        label: "Export to XMnote...",
        commandListener: async () => this.showExportDialog(),
        icon: menuIcon,
      });

      logger.info("Item context menu registered successfully");
    } catch (error) {
      logger.error("Failed to register item context menu:", error);
    }
  }

  private static registerNativeItemContextMenu(
    menuManager: NativeMenuManager,
  ): void {
    const menuID = menuManager.registerMenu({
      menuID: "item-context-menu",
      pluginID: addon.data.config.addonID,
      target: "main/library/item",
      menus: [
        {
          menuType: "menuitem",
          l10nID: `${addon.data.config.addonRef}-menu-quick-export`,
          icon: `chrome://${addon.data.config.addonRef}/content/icons/favicon@0.5x.png`,
          onShowing: (_event: Event, context: any) => {
            context.setVisible(
              context.items?.some((item: Zotero.Item) =>
                item.isRegularItem(),
              ) ?? false,
            );
          },
          onCommand: async (_event: Event, context: any) =>
            this.quickExportItems(context.items),
        },
        {
          menuType: "menuitem",
          l10nID: `${addon.data.config.addonRef}-menu-export-options`,
          icon: `chrome://${addon.data.config.addonRef}/content/icons/favicon@0.5x.png`,
          onShowing: (_event: Event, context: any) => {
            context.setVisible(
              context.items?.some((item: Zotero.Item) =>
                item.isRegularItem(),
              ) ?? false,
            );
          },
          onCommand: async (_event: Event, context: any) =>
            this.showExportDialog(context.items),
        },
      ],
    });

    if (!menuID) {
      throw new Error("Failed to register native item context menu");
    }
    this.nativeMenuIDs.push(menuID);
  }

  // 注册分类右键菜单
  static registerCollectionContextMenu(): void {
    try {
      logger.info("Registering collection context menu...");

      const menuManager = getNativeMenuManager();
      if (menuManager) {
        try {
          this.registerNativeCollectionContextMenu(menuManager);
          logger.info(
            "Collection context menu registered with Zotero.MenuManager",
          );
          return;
        } catch (error) {
          logger.warn(
            "Native collection context menu registration failed, falling back to ztoolkit.Menu:",
            error,
          );
        }
      }

      const menuIcon = `chrome://${addon.data.config.addonRef}/content/icons/favicon@0.5x.png`;

      // 添加导出整个分类的菜单项
      ztoolkit.Menu.register("collection", {
        tag: "menuitem",
        id: "zotero-collectionmenu-xmnote-export",
        label: "Export Collection to XMnote...",
        commandListener: async () => this.exportCollection(),
        icon: menuIcon,
      });

      logger.info("Collection context menu registered successfully");
    } catch (error) {
      logger.error("Failed to register collection context menu:", error);
    }
  }

  private static registerNativeCollectionContextMenu(
    menuManager: NativeMenuManager,
  ): void {
    const menuID = menuManager.registerMenu({
      menuID: "collection-context-menu",
      pluginID: addon.data.config.addonID,
      target: "main/library/collection",
      menus: [
        {
          menuType: "menuitem",
          l10nID: `${addon.data.config.addonRef}-menu-export-collection`,
          icon: `chrome://${addon.data.config.addonRef}/content/icons/favicon@0.5x.png`,
          onShowing: (_event: Event, context: any) => {
            context.setVisible(
              context.collectionTreeRow?.isCollection?.() ?? false,
            );
          },
          onCommand: async (_event: Event, context: any) => {
            const row = context.collectionTreeRow;
            const collection = row?.isCollection?.() ? row.ref : undefined;
            await this.exportCollection(collection);
          },
        },
      ],
    });

    if (!menuID) {
      throw new Error("Failed to register native collection context menu");
    }
    this.nativeMenuIDs.push(menuID);
  }

  // 获取选中分类的所有条目
  private static async getCollectionItems(
    collection?: Zotero.Collection,
  ): Promise<any[]> {
    try {
      const selectedCollection =
        collection ?? ztoolkit.getGlobal("ZoteroPane").getSelectedCollection();

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

      const menuManager = getNativeMenuManager();
      if (menuManager) {
        this.unregisterNativeMenus(menuManager);
      }

      ztoolkit.Menu.unregister("zotero-itemmenu-xmnote-quick-export");
      ztoolkit.Menu.unregister("zotero-itemmenu-xmnote-export-with-options");
      ztoolkit.Menu.unregister("zotero-collectionmenu-xmnote-export");

      logger.info("Context menus unregistered");
    } catch (error) {
      logger.error("Failed to unregister context menus:", error);
    }
  }

  private static unregisterNativeMenus(menuManager: NativeMenuManager): void {
    for (const menuID of this.nativeMenuIDs) {
      menuManager.unregisterMenu(menuID);
    }
    this.nativeMenuIDs = [];
  }

  private static async quickExportItems(items?: Zotero.Item[]): Promise<void> {
    try {
      const selectedItems = await ExportDialog.createSelectedItemsInfo(items);
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
  }

  private static async showExportDialog(items?: Zotero.Item[]): Promise<void> {
    try {
      const selectedItems = await ExportDialog.createSelectedItemsInfo(items);
      await ExportDialog.show(selectedItems);
    } catch (error) {
      logger.error("Failed to show export dialog:", error);
      ztoolkit.getGlobal("alert")(
        `Failed to open export dialog: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private static async exportCollection(
    collection?: Zotero.Collection,
  ): Promise<void> {
    try {
      const collectionItems = await this.getCollectionItems(collection);
      if (collectionItems.length === 0) {
        ztoolkit.getGlobal("alert")("No items found in selected collection.");
        return;
      }

      await ExportDialog.show(collectionItems);
    } catch (error) {
      logger.error("Failed to export collection:", error);
      ztoolkit.getGlobal("alert")(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
