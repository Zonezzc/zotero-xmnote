// 扩展导出对话框以支持当前分类导出

import { logger } from "../../utils/logger";
import type { SelectiveExportOptions } from "../exporter";
import { getDataExporter } from "../exporter";
import { type ZoteroItemInfo } from "./itemSelector";

export class ExtendedExportDialog {
  private window: Window;
  private document: Document;
  private exporter = getDataExporter();
  private isExporting = false;

  constructor(window: Window) {
    this.window = window;
    this.document = window.document;
  }

  // 显示扩展导出对话框（支持当前分类选项）
  static async show(preSelectedItems?: ZoteroItemInfo[]): Promise<void> {
    try {
      logger.info("Opening extended export dialog...");

      // 检查当前选中的分类
      const currentCollection = this.getCurrentCollection();
      const hasPreSelected = preSelectedItems && preSelectedItems.length > 0;
      const hasCurrentCollection = currentCollection !== null;

      // 确定默认导出范围
      const defaultScope = hasPreSelected
        ? "selected"
        : hasCurrentCollection
          ? "collection"
          : "all";

      // 创建对话框数据对象
      const dialogData: { [key: string | number]: any } = {
        exportScope: defaultScope,
        includeNotes: true,
        includeAnnotations: true,
        includeMetadata: true,
        selectedItemsInfo: hasPreSelected ? preSelectedItems : [],
        currentCollection: currentCollection,
        loadCallback: () => {
          logger.info("Extended export dialog opened");
        },
        unloadCallback: () => {
          logger.info("Extended export dialog closed");
        },
      };

      // 计算需要的行数
      let totalRows = 10; // 基础行数
      if (hasPreSelected) totalRows += 2;
      if (hasCurrentCollection) totalRows += 1;

      const dialogHelper = new ztoolkit.Dialog(totalRows, 2)
        .addCell(0, 0, {
          tag: "h1",
          properties: { innerHTML: "Export to XMnote" },
          styles: {
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#333",
          },
        })
        .addCell(1, 0, {
          tag: "h2",
          properties: { innerHTML: "Export Scope" },
          styles: {
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "10px",
            marginTop: "15px",
          },
        })
        .addCell(2, 0, {
          tag: "label",
          namespace: "html",
          attributes: {
            for: "scope-all-radio",
          },
          properties: { innerHTML: "All Items" },
          styles: {
            display: "block",
            marginBottom: "5px",
            fontWeight: "normal",
          },
        })
        .addCell(
          2,
          1,
          {
            tag: "input",
            namespace: "html",
            id: "scope-all-radio",
            attributes: {
              "data-bind": "exportScope",
              "data-prop": "checked",
              type: "radio",
              name: "exportScope",
              value: "all",
            },
          },
          false,
        )
        .addCell(3, 0, {
          tag: "label",
          namespace: "html",
          attributes: {
            for: "scope-selected-radio",
          },
          properties: {
            innerHTML: hasPreSelected
              ? `Selected Items (${preSelectedItems!.length})`
              : "Selected Items",
          },
          styles: {
            display: "block",
            marginBottom: "5px",
            fontWeight: "normal",
            color: hasPreSelected ? "#333" : "#999",
          },
        })
        .addCell(
          3,
          1,
          {
            tag: "input",
            namespace: "html",
            id: "scope-selected-radio",
            attributes: {
              "data-bind": "exportScope",
              "data-prop": "checked",
              type: "radio",
              name: "exportScope",
              value: "selected",
              disabled: hasPreSelected ? undefined : "true",
            },
          },
          false,
        );

      // 添加当前分类选项（如果有的话）
      let currentRowIndex = 4;
      if (hasCurrentCollection) {
        dialogHelper
          .addCell(4, 0, {
            tag: "label",
            namespace: "html",
            attributes: {
              for: "scope-collection-radio",
            },
            properties: {
              innerHTML: `Current Collection (${currentCollection.name})`,
            },
            styles: {
              display: "block",
              marginBottom: "5px",
              fontWeight: "normal",
              color: "#333",
            },
          })
          .addCell(
            4,
            1,
            {
              tag: "input",
              namespace: "html",
              id: "scope-collection-radio",
              attributes: {
                "data-bind": "exportScope",
                "data-prop": "checked",
                type: "radio",
                name: "exportScope",
                value: "collection",
              },
            },
            false,
          );
        currentRowIndex = 5;
      }

      // 添加导出选项标题
      dialogHelper.addCell(currentRowIndex, 0, {
        tag: "h2",
        properties: { innerHTML: "Export Options" },
        styles: {
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "10px",
          marginTop: "15px",
        },
      });

      // 添加导出选项复选框
      dialogHelper
        .addCell(currentRowIndex + 1, 0, {
          tag: "label",
          namespace: "html",
          attributes: {
            for: "include-notes-checkbox",
          },
          properties: { innerHTML: "Include Notes" },
          styles: {
            display: "block",
            marginBottom: "5px",
            fontWeight: "normal",
          },
        })
        .addCell(
          currentRowIndex + 1,
          1,
          {
            tag: "input",
            namespace: "html",
            id: "include-notes-checkbox",
            attributes: {
              "data-bind": "includeNotes",
              "data-prop": "checked",
              type: "checkbox",
            },
          },
          false,
        )
        .addCell(currentRowIndex + 2, 0, {
          tag: "label",
          namespace: "html",
          attributes: {
            for: "include-annotations-checkbox",
          },
          properties: { innerHTML: "Include Annotations" },
          styles: {
            display: "block",
            marginBottom: "5px",
            fontWeight: "normal",
          },
        })
        .addCell(
          currentRowIndex + 2,
          1,
          {
            tag: "input",
            namespace: "html",
            id: "include-annotations-checkbox",
            attributes: {
              "data-bind": "includeAnnotations",
              "data-prop": "checked",
              type: "checkbox",
            },
          },
          false,
        )
        .addCell(currentRowIndex + 3, 0, {
          tag: "label",
          namespace: "html",
          attributes: {
            for: "include-metadata-checkbox",
          },
          properties: { innerHTML: "Include Metadata" },
          styles: {
            display: "block",
            marginBottom: "5px",
            fontWeight: "normal",
          },
        })
        .addCell(
          currentRowIndex + 3,
          1,
          {
            tag: "input",
            namespace: "html",
            id: "include-metadata-checkbox",
            attributes: {
              "data-bind": "includeMetadata",
              "data-prop": "checked",
              type: "checkbox",
            },
          },
          false,
        )
        .addCell(currentRowIndex + 4, 0, {
          tag: "div",
          id: "export-description",
          properties: {
            innerHTML: this.getDescriptionText(
              dialogData.exportScope,
              !!hasPreSelected,
              !!hasCurrentCollection,
              preSelectedItems || [],
              currentCollection,
            ),
          },
          styles: {
            marginTop: "15px",
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#666",
            gridColumn: "1 / -1",
          },
        })
        .addButton("Export", "export", {
          callback: async (e) => {
            // 开始导出流程
            logger.info("User confirmed export, starting export process...");

            // 关闭对话框
            dialogHelper.window?.close();

            // 显示进度窗口
            const progressWin = new ztoolkit.ProgressWindow("XMnote Export", {
              closeOnClick: false,
              closeTime: -1,
            });

            progressWin
              .createLine({
                text: "Initializing export...",
                type: "default",
                progress: 0,
              })
              .show();

            try {
              // 获取导出器
              const { getDataExporter } = await import("../exporter");
              const exporter = getDataExporter();

              progressWin.changeLine({
                text: "Loading items from Zotero...",
                progress: 10,
              });

              // 检查实际选中的导出范围
              const selectedRadio = dialogHelper.window?.document.querySelector(
                'input[name="exportScope"]:checked',
              ) as HTMLInputElement;
              const actualExportScope =
                selectedRadio?.value || dialogData.exportScope;

              logger.info(
                `Dialog exportScope: ${dialogData.exportScope}, Actual selected: ${actualExportScope}, hasPreSelected: ${hasPreSelected}, hasCurrentCollection: ${hasCurrentCollection}`,
              );

              // 根据导出范围获取条目
              let targetItems: any[];
              let itemCount: number;

              if (actualExportScope === "selected" && hasPreSelected) {
                // 使用预选条目
                const selectedIds = preSelectedItems!.map((item) => item.id);
                targetItems = await Promise.all(
                  selectedIds.map((id) => Zotero.Items.getAsync(id)),
                );
                itemCount = targetItems.length;
                logger.info(`Using ${itemCount} pre-selected items for export`);
              } else if (
                actualExportScope === "collection" &&
                hasCurrentCollection
              ) {
                // 使用当前分类的条目
                const collectionItems = await this.getCurrentCollectionItems();
                const collectionIds = collectionItems.map((item) => item.id);
                targetItems = await Promise.all(
                  collectionIds.map((id) => Zotero.Items.getAsync(id)),
                );
                itemCount = targetItems.length;
                logger.info(
                  `Using ${itemCount} items from current collection for export`,
                );
              } else {
                // 获取所有条目
                targetItems = await Zotero.Items.getAll(
                  Zotero.Libraries.userLibraryID,
                );
                itemCount = targetItems.length;
                logger.info(`Found ${itemCount} items to export`);
              }

              progressWin.changeLine({
                text: `Processing ${itemCount} items...`,
                progress: 20,
              });

              // 使用完整的导出流程
              const exportOptions: SelectiveExportOptions = {
                exportScope: actualExportScope as
                  | "all"
                  | "selected"
                  | "collection"
                  | "custom",
                selectedItems:
                  actualExportScope === "selected" && hasPreSelected
                    ? preSelectedItems!.map((item) => item.id)
                    : actualExportScope === "collection" && hasCurrentCollection
                      ? (await this.getCurrentCollectionItems()).map(
                          (item) => item.id,
                        )
                      : undefined,
                includeNotes: dialogData.includeNotes,
                includeAnnotations: dialogData.includeAnnotations,
                includeMetadata: dialogData.includeMetadata,
                batchSize: 10,
                onProgress: (progress: any) => {
                  const progressPercent =
                    progress.total > 0
                      ? 20 + (progress.current / progress.total) * 60
                      : 20;

                  progressWin.changeLine({
                    text: `${progress.message} (${progress.current}/${progress.total})`,
                    progress: progressPercent,
                  });
                },
              };

              logger.info(`Export options:`, exportOptions);
              const result = await exporter.export(exportOptions);

              // 显示结果
              progressWin.changeLine({
                text: result.summary,
                type: result.success ? "success" : "fail",
                progress: 100,
              });

              // 3秒后自动关闭
              setTimeout(() => {
                progressWin.close();
              }, 3000);

              logger.info(`Export process completed: ${result.summary}`);
            } catch (error) {
              logger.error("Export process failed:", error);
              progressWin.changeLine({
                text: `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                type: "fail",
                progress: 100,
              });

              setTimeout(() => {
                progressWin.close();
              }, 5000);
            }
          },
        })
        .addButton("Cancel", "cancel")
        .setDialogData(dialogData);

      dialogHelper.open("Export to XMnote");

      // 等待对话框DOM加载完成后添加事件监听器
      setTimeout(() => {
        const dialogWindow = dialogHelper.window;
        if (dialogWindow && dialogWindow.document) {
          const radios = dialogWindow.document.querySelectorAll(
            'input[name="exportScope"]',
          );
          logger.info(
            `Found ${radios.length} radio buttons, adding change listeners`,
          );

          radios.forEach((radio: any) => {
            radio.addEventListener("change", function (this: HTMLInputElement) {
              if (this.checked) {
                logger.info(`Radio changed to: ${this.value}`);
                const descriptionElement =
                  dialogWindow.document.getElementById("export-description");
                if (descriptionElement) {
                  const newDescription =
                    ExtendedExportDialog.getDescriptionText(
                      this.value,
                      !!hasPreSelected,
                      !!hasCurrentCollection,
                      preSelectedItems || [],
                      currentCollection,
                    );
                  descriptionElement.innerHTML = newDescription;
                  logger.info(`Updated description for scope: ${this.value}`);
                } else {
                  logger.warn("Description element not found");
                }
              }
            });
          });
        } else {
          logger.warn("Dialog window or document not found");
        }
      }, 500);

      // 等待对话框关闭
      await dialogData.unloadLock.promise;
      logger.info("Extended export dialog process completed");
    } catch (error) {
      logger.error("Failed to show extended export dialog:", error);
      throw error;
    }
  }

  // 获取描述文本
  static getDescriptionText(
    exportScope: string,
    hasPreSelected: boolean,
    hasCurrentCollection: boolean,
    preSelectedItems: ZoteroItemInfo[],
    currentCollection?: any,
  ): string {
    if (exportScope === "selected" && hasPreSelected) {
      return `This will export ${preSelectedItems!.length} selected items with their notes and annotations to your XMnote application.`;
    } else if (exportScope === "collection" && hasCurrentCollection) {
      return `This will export all items from the "${currentCollection.name}" collection with their notes and annotations to your XMnote application.`;
    } else {
      return "This will export all Zotero items with their notes and annotations to your XMnote application.";
    }
  }

  // 获取当前选中的分类
  static getCurrentCollection(): any {
    try {
      const zoteroPane = ztoolkit.getGlobal("ZoteroPane");
      const selectedCollection = zoteroPane.getSelectedCollection();
      return selectedCollection;
    } catch (error) {
      logger.warn("Failed to get current collection:", error);
      return null;
    }
  }

  // 获取当前分类的所有条目
  static async getCurrentCollectionItems(): Promise<ZoteroItemInfo[]> {
    try {
      const currentCollection = this.getCurrentCollection();
      if (!currentCollection) {
        return [];
      }

      logger.info(`Getting items from collection: ${currentCollection.name}`);

      // 获取分类中的所有条目
      const items = currentCollection.getChildItems();
      const regularItems = items.filter(
        (item: any) => item.isRegularItem() && !item.deleted,
      );

      logger.info(`Found ${regularItems.length} items in collection`);

      // 转换为ItemInfo格式
      const itemsInfo = [];
      for (const item of regularItems) {
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

          itemsInfo.push(itemInfo);
        } catch (error) {
          logger.warn(`Failed to process collection item ${item.id}:`, error);
        }
      }

      return itemsInfo;
    } catch (error) {
      logger.error("Failed to get current collection items:", error);
      return [];
    }
  }

  // 辅助方法：格式化创作者信息
  static formatCreators(item: Zotero.Item): string {
    try {
      const creators = item.getCreators();
      if (!creators || creators.length === 0) {
        return "Unknown";
      }

      return (
        creators
          .slice(0, 3)
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

  // 辅助方法：获取条目的分类信息
  static getItemCollections(item: Zotero.Item): string[] {
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

  // 辅助方法：获取条目的标签信息
  static getItemTags(item: Zotero.Item): string[] {
    try {
      const tags = item.getTags();
      return tags.map((tag: any) => tag.tag || tag.name || "").filter(Boolean);
    } catch (error) {
      logger.warn(`Failed to get tags for item ${item.id}:`, error);
      return [];
    }
  }
}
