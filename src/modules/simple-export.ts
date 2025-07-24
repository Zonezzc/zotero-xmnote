// 简化的导出功能，用于初始测试

import { logger } from "../utils/logger";

export async function simpleExportTest(): Promise<void> {
  try {
    logger.info("Testing XMnote export functionality");

    // 获取选中的条目
    const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();

    if (!selectedItems || selectedItems.length === 0) {
      new ztoolkit.ProgressWindow("XMnote Test")
        .createLine({
          text: "No items selected for test",
          type: "default",
        })
        .show(2000);
      return;
    }

    // 显示测试结果
    new ztoolkit.ProgressWindow("XMnote Test")
      .createLine({
        text: `Found ${selectedItems.length} selected items`,
        type: "success",
      })
      .show(3000);

    // 简单提取第一个条目的信息
    const firstItem = selectedItems[0];
    if (firstItem.isRegularItem()) {
      const itemInfo = {
        id: firstItem.id,
        title: firstItem.getField("title"),
        itemType: firstItem.itemType,
        creators: firstItem.getCreators(),
      };

      logger.info("First item info:", itemInfo);

      new ztoolkit.ProgressWindow("XMnote Test")
        .createLine({
          text: `First item: ${itemInfo.title}`,
          type: "success",
        })
        .show(3000);
    }

    logger.info("XMnote export test completed successfully");
  } catch (error) {
    logger.error("XMnote export test failed:", error);

    new ztoolkit.ProgressWindow("XMnote Test")
      .createLine({
        text: `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "fail",
      })
      .show(3000);
  }
}
