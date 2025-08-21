// 验证阅读时长估算集成
import { configManager } from "../config/settings";
import { ReadingDurationEstimator } from "./duration-estimator";

export function verifyReadingDurationIntegration(): void {
  console.log("=== 验证阅读时长估算集成 ===");

  // 1. 检查默认配置
  const config = configManager.getImportOptions();
  console.log(
    `默认配置 includeReadingDuration: ${config.includeReadingDuration}`,
  );
  console.log(
    `默认配置 readingDuration.enabled: ${config.readingDuration.enabled}`,
  );
  console.log(
    `最大会话间隔: ${config.readingDuration.maxSessionGap} 秒 (${config.readingDuration.maxSessionGap / 60} 分钟)`,
  );
  console.log(
    `单笔记估算时长: ${config.readingDuration.singleNoteEstimate} 秒 (${config.readingDuration.singleNoteEstimate / 60} 分钟)`,
  );

  // 2. 测试估算器创建
  try {
    const estimator = new ReadingDurationEstimator();
    console.log("✅ ReadingDurationEstimator 创建成功");

    // 3. 测试空数据处理
    const emptyResult = estimator.estimateFromNotes([]);
    console.log(
      `✅ 空笔记处理正常: ${emptyResult.sessions.length} 个会话, ${emptyResult.totalReadingTime} 秒总时长`,
    );

    // 4. 测试配置继承
    const customEstimator = new ReadingDurationEstimator({
      maxSessionGap: config.readingDuration.maxSessionGap,
      minSessionDuration: config.readingDuration.minSessionDuration,
      maxSessionDuration: config.readingDuration.maxSessionDuration,
      singleNoteEstimate: config.readingDuration.singleNoteEstimate,
      readingSpeedFactor: config.readingDuration.readingSpeedFactor,
    });
    console.log("✅ 自定义配置的估算器创建成功");
  } catch (error) {
    console.error("❌ 估算器测试失败:", error);
  }

  // 5. 输出集成状态
  const isFullyEnabled =
    config.includeReadingDuration && config.readingDuration.enabled;
  console.log(`\n集成状态: ${isFullyEnabled ? "✅ 完全启用" : "⚠️ 部分禁用"}`);

  if (isFullyEnabled) {
    console.log("Quick Export 现在将包含阅读时长估算数据!");
  } else {
    console.log("需要在配置中启用阅读时长估算功能。");
  }

  console.log("=== 验证完成 ===");
}

// 如果直接运行此文件，则执行验证
if (typeof require !== "undefined" && require.main === module) {
  verifyReadingDurationIntegration();
}
