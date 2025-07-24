// 菜单处理器

import { logger } from "../../utils/logger";
import { ExportDialog } from "./exportDialog";
import { getDataExporter } from "../exporter";
import { configManager } from "../config/settings";

export class MenuHandler {
  private static instance: MenuHandler;

  static getInstance(): MenuHandler {
    if (!MenuHandler.instance) {
      MenuHandler.instance = new MenuHandler();
    }
    return MenuHandler.instance;
  }

  // 注册菜单项
  registerMenuItems(): void {
    logger.info("Registering XMnote menu items");

    try {
      // 在工具菜单中添加"Export to XMnote"选项
      ztoolkit.Menu.register("menuTools", {
        tag: "menuitem",
        id: "zotero-xmnote-export-menu",
        label: "Export to XMnote",
        oncommand: "Zotero.zonezzc.hooks.onMenuCommand('export-all')",
      });

      // 在条目右键菜单中添加选项
      ztoolkit.Menu.register("item", {
        tag: "menuitem",
        id: "zotero-xmnote-export-selected-menu",
        label: "Export Selected to XMnote",
        oncommand: "Zotero.zonezzc.hooks.onMenuCommand('export-selected')",
      });

      // 添加分隔符
      ztoolkit.Menu.register("menuTools", {
        tag: "menuseparator",
        id: "zotero-xmnote-separator",
      });

      logger.info("Menu items registered successfully");
    } catch (error) {
      logger.error("Failed to register menu items:", error);
    }
  }

  // 移除菜单项
  unregisterMenuItems(): void {
    logger.info("Unregistering XMnote menu items");

    try {
      // 移除菜单项
      ztoolkit.Menu.unregister("zotero-xmnote-export-menu");
      ztoolkit.Menu.unregister("zotero-xmnote-export-selected-menu");
      ztoolkit.Menu.unregister("zotero-xmnote-separator");

      logger.info("Menu items unregistered successfully");
    } catch (error) {
      logger.error("Failed to unregister menu items:", error);
    }
  }

  // 处理导出所有条目
  async handleExportAll(): Promise<void> {
    logger.info("Export all items requested");

    try {
      // 检查配置
      const config = configManager.getConfig();
      const validation = configManager.validateConfig(config);

      if (!validation.isValid) {
        this.showConfigurationError(validation.errors);
        return;
      }

      // 显示导出对话框
      await ExportDialog.show();
    } catch (error) {
      logger.error("Failed to handle export all:", error);
      this.showError("Failed to open export dialog");
    }
  }

  // 处理导出选中条目
  async handleExportSelected(): Promise<void> {
    logger.info("Export selected items requested");

    try {
      // 获取选中的条目
      const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();

      if (!selectedItems || selectedItems.length === 0) {
        this.showWarning("No items selected");
        return;
      }

      logger.info(`Selected ${selectedItems.length} items for export`);

      // 检查配置
      const config = configManager.getConfig();
      const validation = configManager.validateConfig(config);

      if (!validation.isValid) {
        this.showConfigurationError(validation.errors);
        return;
      }

      // 快速导出选中条目
      await this.quickExportItems(selectedItems);
    } catch (error) {
      logger.error("Failed to handle export selected:", error);
      this.showError("Failed to export selected items");
    }
  }

  // 快速导出条目
  private async quickExportItems(items: any[]): Promise<void> {
    try {
      const itemIds = items
        .filter((item) => item.isRegularItem())
        .map((item) => item.id);

      if (itemIds.length === 0) {
        this.showWarning(
          "No regular items selected (attachments, notes excluded)",
        );
        return;
      }

      // 显示进度通知
      const progressWin = new ztoolkit.ProgressWindow("XMnote Export")
        .createLine({
          text: `Exporting ${itemIds.length} items...`,
          type: "default",
        })
        .show();

      // 执行导出
      const exporter = getDataExporter();
      const result = await exporter.export({
        selectedItems: itemIds,
        onProgress: (progress) => {
          progressWin.changeLine({
            text: progress.message || `${progress.current}/${progress.total}`,
            type: progress.phase === "error" ? "fail" : "default",
          });
        },
      });

      // 显示结果
      if (result.success) {
        progressWin.changeLine({
          text: `Export completed: ${result.summary}`,
          type: "success",
        });

        this.showSuccess(
          `Successfully exported ${result.successfulImports} items to XMnote`,
        );
      } else {
        progressWin.changeLine({
          text: `Export failed: ${result.errors.join(", ")}`,
          type: "fail",
        });

        this.showError(`Export failed: ${result.errors.join(", ")}`);
      }

      // 3秒后关闭进度窗口
      setTimeout(() => {
        progressWin.close();
      }, 3000);
    } catch (error) {
      logger.error("Quick export failed:", error);
      this.showError(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // 显示配置错误
  private showConfigurationError(errors: string[]): void {
    const message = `Configuration errors:\n${errors.join("\n")}\n\nPlease check the XMnote settings in preferences.`;

    Services.prompt.alert(null as any, "XMnote Configuration Error", message);

    // 打开首选项面板
    this.openPreferences();
  }

  // 打开首选项面板
  private openPreferences(): void {
    try {
      (Zotero.Prefs as any).openPrefsWindow();
    } catch (error) {
      logger.error("Failed to open preferences:", error);
    }
  }

  // 显示成功消息
  private showSuccess(message: string): void {
    new ztoolkit.ProgressWindow("XMnote Export")
      .createLine({
        text: message,
        type: "success",
      })
      .show(2000);
  }

  // 显示错误消息
  private showError(message: string): void {
    new ztoolkit.ProgressWindow("XMnote Export")
      .createLine({
        text: message,
        type: "fail",
      })
      .show(3000);
  }

  // 显示警告消息
  private showWarning(message: string): void {
    new ztoolkit.ProgressWindow("XMnote Export")
      .createLine({
        text: message,
        type: "default",
      })
      .show(2000);
  }

  // 检查是否可以导出
  canExport(): boolean {
    try {
      const config = configManager.getConfig();
      const validation = configManager.validateConfig(config);
      return validation.isValid;
    } catch (error) {
      logger.error("Failed to check export capability:", error);
      return false;
    }
  }

  // 获取菜单状态
  getMenuItemState(itemId: string): { enabled: boolean; visible: boolean } {
    const canExport = this.canExport();

    switch (itemId) {
      case "zotero-xmnote-export-menu":
        return { enabled: canExport, visible: true };

      case "zotero-xmnote-export-selected-menu": {
        const hasSelection =
          Zotero.getActiveZoteroPane()?.getSelectedItems()?.length > 0;
        return { enabled: canExport && hasSelection, visible: true };
      }

      default:
        return { enabled: false, visible: false };
    }
  }
}

// 导出单例实例
export const menuHandler = MenuHandler.getInstance();
