// 导出对话框

import { logger } from "../../utils/logger";
import type {
  ExportOptions,
  ExportProgress,
  SelectiveExportOptions,
} from "../exporter";
import { getDataExporter } from "../exporter";
import { type ZoteroItemInfo } from "./itemSelector";

export class ExportDialog {
  private window: Window;
  private document: Document;
  private exporter = getDataExporter();
  private isExporting = false;

  constructor(window: Window) {
    this.window = window;
    this.document = window.document;
  }

  // 显示导出对话框（支持预选条目）
  static async show(preSelectedItems?: ZoteroItemInfo[]): Promise<void> {
    try {
      logger.info("Opening export dialog...");

      // 确定默认导出范围
      const hasPreSelected = preSelectedItems && preSelectedItems.length > 0;
      const defaultScope = hasPreSelected ? "selected" : "all";

      // 创建对话框数据对象
      const dialogData: { [key: string | number]: any } = {
        exportScope: defaultScope,
        includeNotes: true,
        includeAnnotations: true,
        includeMetadata: true,
        selectedItemsInfo: hasPreSelected ? preSelectedItems : [],
        loadCallback: () => {
          logger.info("Export dialog opened");
        },
        unloadCallback: () => {
          logger.info("Export dialog closed");
        },
      };

      // 创建ztoolkit对话框（增加行数来容纳新的选项）
      const dialogHelper = new ztoolkit.Dialog(hasPreSelected ? 12 : 10, 2)
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
        )
        .addCell(4, 0, {
          tag: "h2",
          properties: { innerHTML: "Export Options" },
          styles: {
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "10px",
            marginTop: "15px",
          },
        })
        .addCell(5, 0, {
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
          5,
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
        .addCell(6, 0, {
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
          6,
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
        .addCell(7, 0, {
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
          7,
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
        .addCell(8, 0, {
          tag: "div",
          properties: {
            innerHTML:
              hasPreSelected && dialogData.exportScope === "selected"
                ? `This will export ${preSelectedItems!.length} selected items with their notes and annotations to your XMnote application.`
                : "This will export all Zotero items with their notes and annotations to your XMnote application.",
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

              // 检查实际选中的导出范围（而不是依赖 dialogData）
              const selectedRadio = dialogHelper.window?.document.querySelector(
                'input[name="exportScope"]:checked',
              ) as HTMLInputElement;
              const actualExportScope =
                selectedRadio?.value || dialogData.exportScope;

              logger.info(
                `Dialog exportScope: ${dialogData.exportScope}, Actual selected: ${actualExportScope}, hasPreSelected: ${hasPreSelected}`,
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
                exportScope: actualExportScope as "all" | "selected" | "custom",
                selectedItems:
                  actualExportScope === "selected" && hasPreSelected
                    ? preSelectedItems!.map((item) => item.id)
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
        .setDialogData(dialogData)
        .open("Export to XMnote");

      // 等待对话框关闭
      await dialogData.unloadLock.promise;
      logger.info("Export dialog process completed");
    } catch (error) {
      logger.error("Failed to show export dialog:", error);
      throw error;
    }
  }

  // 快速导出选中的条目（用于右键菜单）
  static async quickExport(selectedItems: ZoteroItemInfo[]): Promise<void> {
    try {
      logger.info(`Starting quick export for ${selectedItems.length} items`);

      // 显示进度窗口
      const progressWin = new ztoolkit.ProgressWindow("XMnote Quick Export", {
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
          text: `Processing ${selectedItems.length} selected items...`,
          progress: 20,
        });

        // 使用默认导出设置
        const exportOptions: SelectiveExportOptions = {
          exportScope: "selected",
          selectedItems: selectedItems.map((item) => item.id),
          includeNotes: true,
          includeAnnotations: true,
          includeMetadata: true,
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

        logger.info(`Quick export completed: ${result.summary}`);
      } catch (error) {
        logger.error("Quick export failed:", error);
        progressWin.changeLine({
          text: `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          type: "fail",
          progress: 100,
        });

        setTimeout(() => {
          progressWin.close();
        }, 5000);
      }
    } catch (error) {
      logger.error("Failed to start quick export:", error);
      throw error;
    }
  }

  // 从当前选中的Zotero条目创建条目信息
  static async createSelectedItemsInfo(): Promise<ZoteroItemInfo[]> {
    try {
      const selectedItems = ztoolkit.getGlobal("ZoteroPane").getSelectedItems();
      if (!selectedItems || selectedItems.length === 0) {
        return [];
      }

      const itemsInfo: ZoteroItemInfo[] = [];
      for (const item of selectedItems) {
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

          itemsInfo.push(itemInfo);
        } catch (error) {
          logger.warn(`Failed to process selected item ${item.id}:`, error);
        }
      }

      return itemsInfo;
    } catch (error) {
      logger.error("Failed to create selected items info:", error);
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

  // 初始化对话框
  initialize(): void {
    logger.info("Initializing export dialog");

    this.setupEventHandlers();
    this.loadInitialData();
  }

  // 设置事件处理器
  private setupEventHandlers(): void {
    // 导出按钮
    const exportButton = this.document.getElementById(
      "export-button",
    ) as HTMLButtonElement;
    if (exportButton) {
      exportButton.addEventListener("click", () => this.handleExport());
    }

    // 预览按钮
    const previewButton = this.document.getElementById(
      "preview-button",
    ) as HTMLButtonElement;
    if (previewButton) {
      previewButton.addEventListener("click", () => this.handlePreview());
    }

    // 取消按钮
    const cancelButton = this.document.getElementById(
      "cancel-button",
    ) as HTMLButtonElement;
    if (cancelButton) {
      cancelButton.addEventListener("click", () => this.handleCancel());
    }

    // 选择所有/取消所有
    const selectAllButton = this.document.getElementById(
      "select-all-button",
    ) as HTMLButtonElement;
    if (selectAllButton) {
      selectAllButton.addEventListener("click", () => this.handleSelectAll());
    }

    const selectNoneButton = this.document.getElementById(
      "select-none-button",
    ) as HTMLButtonElement;
    if (selectNoneButton) {
      selectNoneButton.addEventListener("click", () => this.handleSelectNone());
    }

    // 筛选器变化
    const filterInputs = this.document.querySelectorAll(".filter-input");
    filterInputs.forEach((input: any) => {
      input.addEventListener("change", () => this.updateItemList());
    });
  }

  // 加载初始数据
  private async loadInitialData(): Promise<void> {
    try {
      // 加载条目类型
      const itemTypes = this.exporter.getSupportedItemTypes();
      this.populateSelect("item-types-select", itemTypes);

      // 加载标签
      const tags = await this.exporter.getAvailableTags();
      this.populateSelect("tags-select", tags);

      // 加载分类
      const collections = await this.exporter.getAvailableCollections();
      this.populateSelect("collections-select", collections);

      // 加载条目列表
      await this.updateItemList();
    } catch (error) {
      logger.error("Failed to load initial data:", error);
      this.showError("Failed to load data");
    }
  }

  // 填充下拉框
  private populateSelect(selectId: string, options: string[]): void {
    const select = this.document.getElementById(selectId) as HTMLSelectElement;
    if (!select) return;

    // 清空现有选项
    select.innerHTML = "";

    // 添加选项
    options.forEach((option) => {
      const optionElement = this.document.createElement("option");
      optionElement.value = option;
      optionElement.textContent = option;
      select.appendChild(optionElement);
    });
  }

  // 更新条目列表
  private async updateItemList(): Promise<void> {
    try {
      const options = this.getFilterOptions();
      const { items } = await this.exporter.preview(options);

      const itemList = this.document.getElementById("item-list") as HTMLElement;
      if (!itemList) return;

      // 清空现有内容
      itemList.innerHTML = "";

      // 添加条目
      items.forEach((item) => {
        const itemElement = this.createItemElement(item);
        itemList.appendChild(itemElement);
      });

      // 更新状态
      this.updateStatus(`Found ${items.length} items`);
    } catch (error) {
      logger.error("Failed to update item list:", error);
      this.showError("Failed to load items");
    }
  }

  // 创建条目元素
  private createItemElement(item: any): HTMLElement {
    const div = this.document.createElement("div");
    div.className = "item-entry";
    div.innerHTML = `
      <label>
        <input type='checkbox' class='item-checkbox' data-item-id='${item.id}' checked>
        <strong>${this.escapeHtml(item.title || "Untitled")}</strong>
        <br>
        <small>
          Type: ${item.itemType} | 
          Authors: ${item.creators.map((c: any) => c.lastName || c.name).join(", ") || "Unknown"}
          ${item.date ? ` | Date: ${item.date}` : ""}
        </small>
      </label>
    `;
    return div;
  }

  // 处理导出
  private async handleExport(): Promise<void> {
    if (this.isExporting) return;

    try {
      this.isExporting = true;
      this.setUIState("exporting");

      const options = this.getExportOptions();
      const result = await this.exporter.export({
        ...options,
        onProgress: (progress) => this.updateProgress(progress),
      });

      if (result.success) {
        this.showSuccess(`Export completed: ${result.summary}`);
        setTimeout(() => this.window.close(), 2000);
      } else {
        this.showError(`Export failed: ${result.errors.join(", ")}`);
      }
    } catch (error) {
      logger.error("Export failed:", error);
      this.showError(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      this.isExporting = false;
      this.setUIState("ready");
    }
  }

  // 处理预览
  private async handlePreview(): Promise<void> {
    try {
      const options = this.getFilterOptions();
      const { items, preview } = await this.exporter.preview(options);

      const previewArea = this.document.getElementById(
        "preview-area",
      ) as HTMLElement;
      if (!previewArea) return;

      previewArea.innerHTML = "";

      if (preview.length === 0) {
        previewArea.innerHTML = "<p>No items to preview</p>";
        return;
      }

      preview.forEach((item, index) => {
        const previewElement = this.document.createElement("div");
        previewElement.className = "preview-item";
        previewElement.innerHTML = `
          <h4>${this.escapeHtml(item.item.title)}</h4>
          <p><strong>Transformed Data:</strong></p>
          <pre>${JSON.stringify(item.transformedNote, null, 2)}</pre>
          <p><strong>Statistics:</strong></p>
          <ul>
            <li>Original Notes: ${item.stats.originalNotes}</li>
            <li>Original Annotations: ${item.stats.originalAnnotations}</li>
            <li>Transformed Entries: ${item.stats.transformedEntries}</li>
            <li>Metadata Fields: ${item.stats.metadata.join(", ") || "None"}</li>
          </ul>
        `;
        previewArea.appendChild(previewElement);
      });

      // 显示预览区域
      previewArea.style.display = "block";
    } catch (error) {
      logger.error("Preview failed:", error);
      this.showError("Preview failed");
    }
  }

  // 处理取消
  private handleCancel(): void {
    this.window.close();
  }

  // 处理全选
  private handleSelectAll(): void {
    const checkboxes = this.document.querySelectorAll(
      ".item-checkbox",
    ) as NodeListOf<HTMLInputElement>;
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = true;
    });
  }

  // 处理取消全选
  private handleSelectNone(): void {
    const checkboxes = this.document.querySelectorAll(
      ".item-checkbox",
    ) as NodeListOf<HTMLInputElement>;
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = false;
    });
  }

  // 获取筛选选项
  private getFilterOptions(): ExportOptions {
    const itemTypesSelect = this.document.getElementById(
      "item-types-select",
    ) as HTMLSelectElement;
    const tagsSelect = this.document.getElementById(
      "tags-select",
    ) as HTMLSelectElement;
    const collectionsSelect = this.document.getElementById(
      "collections-select",
    ) as HTMLSelectElement;

    return {
      itemTypes: Array.from(itemTypesSelect.selectedOptions).map(
        (option: any) => option.value,
      ),
      tags: Array.from(tagsSelect.selectedOptions).map(
        (option: any) => option.value,
      ),
      collections: Array.from(collectionsSelect.selectedOptions).map(
        (option: any) => option.value,
      ),
    };
  }

  // 获取导出选项
  private getExportOptions(): ExportOptions {
    const filterOptions = this.getFilterOptions();

    // 获取选中的条目ID
    const selectedCheckboxes = this.document.querySelectorAll(
      ".item-checkbox:checked",
    ) as NodeListOf<HTMLInputElement>;
    const selectedItems = Array.from(selectedCheckboxes).map((checkbox: any) =>
      parseInt(checkbox.getAttribute("data-item-id") || "0"),
    );

    // 获取其他选项
    const includeNotes =
      (
        this.document.getElementById(
          "include-notes-checkbox",
        ) as HTMLInputElement
      )?.checked ?? true;
    const includeAnnotations =
      (
        this.document.getElementById(
          "include-annotations-checkbox",
        ) as HTMLInputElement
      )?.checked ?? true;
    const includeMetadata =
      (
        this.document.getElementById(
          "include-metadata-checkbox",
        ) as HTMLInputElement
      )?.checked ?? true;

    return {
      ...filterOptions,
      selectedItems: selectedItems.length > 0 ? selectedItems : undefined,
      includeNotes,
      includeAnnotations,
      includeMetadata,
    };
  }

  // 更新进度
  private updateProgress(progress: ExportProgress): void {
    const progressBar = this.document.getElementById(
      "progress-bar",
    ) as HTMLElement;
    const progressText = this.document.getElementById(
      "progress-text",
    ) as HTMLElement;

    if (progressBar) {
      const percentage =
        progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
      progressBar.style.width = `${percentage}%`;
    }

    if (progressText) {
      progressText.textContent =
        progress.message || `${progress.current}/${progress.total}`;
    }

    if (progress.phase === "error" && progress.errors) {
      this.showError(progress.errors.join(", "));
    }
  }

  // 设置UI状态
  private setUIState(state: "ready" | "exporting"): void {
    const exportButton = this.document.getElementById(
      "export-button",
    ) as HTMLButtonElement;
    const previewButton = this.document.getElementById(
      "preview-button",
    ) as HTMLButtonElement;
    const progressContainer = this.document.getElementById(
      "progress-container",
    ) as HTMLElement;

    switch (state) {
      case "ready":
        if (exportButton) exportButton.disabled = false;
        if (previewButton) previewButton.disabled = false;
        if (progressContainer) progressContainer.style.display = "none";
        break;

      case "exporting":
        if (exportButton) exportButton.disabled = true;
        if (previewButton) previewButton.disabled = true;
        if (progressContainer) progressContainer.style.display = "block";
        break;
    }
  }

  // 显示状态信息
  private updateStatus(message: string): void {
    const statusElement = this.document.getElementById(
      "status-text",
    ) as HTMLElement;
    if (statusElement) {
      statusElement.textContent = message;
    }
  }

  // 显示成功信息
  private showSuccess(message: string): void {
    this.showMessage(message, "success");
  }

  // 显示错误信息
  private showError(message: string): void {
    this.showMessage(message, "error");
  }

  // 显示消息
  private showMessage(message: string, type: "success" | "error"): void {
    const messageArea = this.document.getElementById(
      "message-area",
    ) as HTMLElement;
    if (!messageArea) return;

    messageArea.textContent = message;
    messageArea.className = `message ${type}`;
    messageArea.style.display = "block";

    // 3秒后隐藏成功消息
    if (type === "success") {
      setTimeout(() => {
        messageArea.style.display = "none";
      }, 3000);
    }
  }

  // HTML转义
  private escapeHtml(text: string): string {
    const div = this.document.createElement("div");
    div.textContent = text;
    return div.innerHTML as string;
  }
}
