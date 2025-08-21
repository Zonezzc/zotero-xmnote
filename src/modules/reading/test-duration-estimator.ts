// 测试阅读时长估算功能
import { ReadingDurationEstimator } from "./duration-estimator";
import type { XMnoteEntry } from "../xmnote/types";

// 创建测试数据
function createTestNotes(): XMnoteEntry[] {
  const baseTime = Math.floor(Date.now() / 1000) - 86400; // 昨天开始

  return [
    // 第一个阅读会话：连续阅读
    {
      page: 10,
      text: "第一段摘录",
      note: "这是第一个笔记",
      time: baseTime, // 14:00:00
    },
    {
      page: 15,
      text: "第二段摘录",
      time: baseTime + 900, // 14:15:00 (+15分钟)
    },
    {
      page: 22,
      note: "重要思考",
      time: baseTime + 2100, // 14:35:00 (+20分钟)
    },

    // 间隔太长，新会话
    {
      page: 35,
      text: "新的阅读段落",
      time: baseTime + 6300, // 15:45:00 (+70分钟)
    },

    // 第二天的阅读
    {
      page: 42,
      note: "第二天的笔记",
      time: baseTime + 86400 + 3600, // 第二天 15:00:00
    },
    {
      page: 48,
      text: "继续阅读",
      time: baseTime + 86400 + 4500, // 第二天 15:15:00 (+15分钟)
    },
  ];
}

function testReadingDurationEstimator(): void {
  console.log("=== 开始测试阅读时长估算器 ===");

  // 创建估算器
  const estimator = new ReadingDurationEstimator();

  // 创建测试数据
  const testNotes = createTestNotes();
  console.log(`创建了 ${testNotes.length} 个测试笔记`);

  // 执行估算
  const result = estimator.estimateFromNotes(testNotes);

  // 输出结果
  console.log("\n=== 估算结果 ===");
  console.log(`检测到 ${result.sessions.length} 个阅读会话`);
  console.log(`总阅读时间: ${Math.round(result.totalReadingTime / 60)} 分钟`);

  console.log("\n=== 阅读会话详情 ===");
  result.sessions.forEach((session, index) => {
    const startDate = new Date(session.startTime * 1000);
    const durationMinutes = Math.round(session.duration / 60);
    console.log(`会话 ${index + 1}:`);
    console.log(`  开始时间: ${startDate.toLocaleString()}`);
    console.log(`  时长: ${durationMinutes} 分钟`);
    console.log(`  笔记数量: ${session.noteCount}`);
    console.log(
      `  页面范围: ${session.startPosition} - ${session.endPosition}`,
    );
    console.log(`  页面进度: ${session.pageProgress} 页`);
  });

  console.log("\n=== 精确阅读时长 ===");
  result.preciseReadingDurations.forEach((duration, index) => {
    const startDate = new Date(duration.startTime);
    const endDate = new Date(duration.endTime);
    const durationMinutes = Math.round(
      (duration.endTime - duration.startTime) / 60000,
    );
    console.log(`精确记录 ${index + 1}:`);
    console.log(`  开始: ${startDate.toLocaleString()}`);
    console.log(`  结束: ${endDate.toLocaleString()}`);
    console.log(`  时长: ${durationMinutes} 分钟`);
    console.log(`  位置: ${duration.position}`);
  });

  console.log("\n=== 总计 ===");
  console.log(
    `所有阅读会话的总时长: ${Math.round(result.totalReadingTime / 60)} 分钟`,
  );

  console.log("\n=== 测试完成 ===");
}

// 测试配置自适应功能
function testConfigAdaptation(): void {
  console.log("\n=== 测试配置自适应 ===");

  const estimator = new ReadingDurationEstimator();
  const testNotes = createTestNotes();

  // 测试配置自适应
  const adaptedConfig = estimator.adaptConfigByUser(testNotes);
  console.log("自适应配置结果:");
  console.log(
    `  最大会话间隔: ${adaptedConfig.maxSessionGap} 秒 (${Math.round(adaptedConfig.maxSessionGap / 60)} 分钟)`,
  );
  console.log(
    `  单笔记估算时长: ${adaptedConfig.singleNoteEstimate} 秒 (${Math.round(adaptedConfig.singleNoteEstimate / 60)} 分钟)`,
  );
  console.log(
    `  最小会话时长: ${adaptedConfig.minSessionDuration} 秒 (${Math.round(adaptedConfig.minSessionDuration / 60)} 分钟)`,
  );
  console.log(
    `  最大会话时长: ${adaptedConfig.maxSessionDuration} 秒 (${Math.round(adaptedConfig.maxSessionDuration / 60)} 分钟)`,
  );
  console.log(`  阅读速度因子: ${adaptedConfig.readingSpeedFactor}`);
}

// 测试边界情况
function testEdgeCases(): void {
  console.log("\n=== 测试边界情况 ===");

  const estimator = new ReadingDurationEstimator();

  // 测试空笔记
  console.log("测试空笔记数组:");
  const emptyResult = estimator.estimateFromNotes([]);
  console.log(`  会话数: ${emptyResult.sessions.length}`);
  console.log(`  总时长: ${emptyResult.totalReadingTime} 秒`);

  // 测试单个笔记
  console.log("\n测试单个笔记:");
  const singleNote: XMnoteEntry = {
    page: 5,
    text: "单个笔记",
    time: Math.floor(Date.now() / 1000),
  };
  const singleResult = estimator.estimateFromNotes([singleNote]);
  console.log(`  会话数: ${singleResult.sessions.length}`);
  console.log(
    `  总时长: ${Math.round(singleResult.totalReadingTime / 60)} 分钟`,
  );

  // 测试没有时间戳的笔记
  console.log("\n测试没有时间戳的笔记:");
  const noTimeNotes: XMnoteEntry[] = [
    { page: 1, text: "没有时间戳1" },
    { page: 2, text: "没有时间戳2" },
  ];
  const noTimeResult = estimator.estimateFromNotes(noTimeNotes);
  console.log(`  会话数: ${noTimeResult.sessions.length}`);
  console.log(`  总时长: ${noTimeResult.totalReadingTime} 秒`);
}

// 导出测试函数供外部调用
export function runReadingDurationTests(): void {
  try {
    testReadingDurationEstimator();
    testConfigAdaptation();
    testEdgeCases();
    console.log("\n✅ 所有测试完成!");
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

// 如果直接运行此文件，则执行测试
if (typeof require !== "undefined" && require.main === module) {
  runReadingDurationTests();
}
