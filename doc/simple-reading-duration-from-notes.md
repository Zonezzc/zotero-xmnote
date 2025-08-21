# 基于笔记时间戳的简单阅读时长估算方案

## 1. 方案概述

### 1.1 核心思路

利用现有的笔记时间戳数据，通过分析笔记创建的时间间隔来估算阅读时长：

- **相邻笔记合并**：如果笔记间隔在合理范围内，认为是同一阅读会话
- **单笔记估算**：孤立笔记按固定时长（如10分钟）估算
- **位置跟踪**：利用笔记的页码信息跟踪阅读位置变化

### 1.2 优势

- ✅ **实现简单**：基于现有数据，无需复杂的实时跟踪
- ✅ **数据可用**：Zotero笔记已包含时间戳和位置信息
- ✅ **向后兼容**：可以分析历史笔记数据
- ✅ **资源友好**：不需要实时监控，计算量小

## 2. 算法设计

### 2.1 核心参数

```typescript
interface ReadingEstimationConfig {
  maxSessionGap: number; // 最大会话间隔（秒）：30分钟 = 1800秒
  minSessionDuration: number; // 最小会话时长（秒）：10分钟 = 600秒
  maxSessionDuration: number; // 最大会话时长（秒）：4小时 = 14400秒
  singleNoteEstimate: number; // 单笔记估算时长（秒）：10分钟 = 600秒
  readingSpeedFactor: number; // 阅读速度因子：用于根据页数调整时长
}
```

### 2.2 算法流程

#### 步骤1：笔记预处理

```typescript
// 1. 获取所有笔记，按时间排序
const notes = item.notes.sort((a, b) => a.time - b.time);

// 2. 过滤有效笔记（有时间戳的）
const validNotes = notes.filter((note) => note.time && note.time > 0);
```

#### 步骤2：会话分组

```typescript
function groupNotesIntoSessions(
  notes: XMnoteEntry[],
  config: ReadingEstimationConfig,
) {
  const sessions: ReadingSession[] = [];
  let currentSession: ReadingSession | null = null;

  for (const note of notes) {
    if (!currentSession) {
      // 创建新会话
      currentSession = createNewSession(note);
    } else {
      const timeDiff = note.time - currentSession.lastNoteTime;

      if (timeDiff <= config.maxSessionGap) {
        // 归入当前会话
        addNoteToSession(currentSession, note);
      } else {
        // 结束当前会话，开始新会话
        finalizeSession(currentSession, config);
        sessions.push(currentSession);
        currentSession = createNewSession(note);
      }
    }
  }

  // 处理最后一个会话
  if (currentSession) {
    finalizeSession(currentSession, config);
    sessions.push(currentSession);
  }

  return sessions;
}
```

#### 步骤3：时长估算

```typescript
function estimateSessionDuration(
  session: ReadingSession,
  config: ReadingEstimationConfig,
): number {
  if (session.notes.length === 1) {
    // 单笔记：使用固定估算时长
    return config.singleNoteEstimate;
  }

  // 多笔记：基于时间跨度估算
  const timeSpan = session.endTime - session.startTime;
  const baseDuration = Math.min(timeSpan, config.maxSessionDuration);

  // 根据页数变化调整（可选优化）
  const pageProgress = calculatePageProgress(session);
  const adjustedDuration = Math.max(
    baseDuration * config.readingSpeedFactor,
    config.minSessionDuration,
  );

  return Math.min(adjustedDuration, config.maxSessionDuration);
}
```

### 2.3 数据结构

#### 阅读会话

```typescript
interface ReadingSession {
  startTime: number; // 会话开始时间
  endTime: number; // 会话结束时间
  duration: number; // 估算阅读时长（秒）
  startPosition: number; // 开始位置（页码）
  endPosition: number; // 结束位置（页码）
  notes: XMnoteEntry[]; // 包含的笔记
  noteCount: number; // 笔记数量
  pageProgress: number; // 页面进度变化
}
```

## 3. 实现示例

### 3.1 配置参数

```typescript
const DEFAULT_CONFIG: ReadingEstimationConfig = {
  maxSessionGap: 1800, // 30分钟间隔
  minSessionDuration: 600, // 最少10分钟
  maxSessionDuration: 14400, // 最多4小时
  singleNoteEstimate: 600, // 单笔记10分钟
  readingSpeedFactor: 1.2, // 阅读速度调整因子
};
```

### 3.2 实际场景示例

#### 场景1：连续阅读会话

```
笔记A: 14:00:00, 页码10
笔记B: 14:15:00, 页码15  → 间隔15分钟，合并到同一会话
笔记C: 14:35:00, 页码22  → 间隔20分钟，继续同一会话
笔记D: 15:45:00, 页码35  → 间隔70分钟，超过阈值，新会话

结果：
会话1: 14:00-14:35 (35分钟), 估算阅读时长: 35-40分钟
会话2: 15:45单笔记, 估算阅读时长: 10分钟
```

#### 场景2：分散阅读

```
笔记A: 09:00:00, 页码5   → 单独会话
笔记B: 20:30:00, 页码8   → 间隔太长，新会话

结果：
会话1: 09:00单笔记, 估算时长: 10分钟
会话2: 20:30单笔记, 估算时长: 10分钟
```

## 4. 生成XMnote数据

### 4.1 精确阅读时长

```typescript
function generatePreciseReadingDurations(
  sessions: ReadingSession[],
): PreciseReadingDuration[] {
  return sessions.map((session) => ({
    startTime: session.startTime * 1000, // 转换为毫秒
    endTime: (session.startTime + session.duration) * 1000,
    position: session.endPosition,
  }));
}
```

### 4.2 模糊阅读时长（可选）

```typescript
function generateFuzzyReadingDurations(
  sessions: ReadingSession[],
): FuzzyReadingDuration[] {
  // 按日期合并会话
  const dailySessions = groupSessionsByDate(sessions);

  return dailySessions.map((dailyGroup) => ({
    date: formatDateString(dailyGroup.date),
    durationSeconds: dailyGroup.totalDuration,
    position: dailyGroup.maxPosition,
  }));
}
```

## 5. 质量优化策略

### 5.1 智能调整

- **页码一致性检查**：如果笔记页码倒退，可能是重读，调整时长估算
- **笔记密度分析**：高密度笔记区域可能阅读更仔细，增加时长权重
- **时间异常检测**：识别明显不合理的时间间隔

### 5.2 参数自适应

```typescript
function adaptConfigByUser(notes: XMnoteEntry[]): ReadingEstimationConfig {
  const avgInterval = calculateAverageNoteInterval(notes);
  const noteFrequency = calculateNoteFrequency(notes);

  return {
    ...DEFAULT_CONFIG,
    maxSessionGap: Math.max(avgInterval * 3, 1800), // 动态调整会话间隔
    singleNoteEstimate: Math.max(noteFrequency * 2, 600), // 根据笔记频率调整
  };
}
```

## 6. 实现位置

### 6.1 现有代码集成

- **位置**：在 `src/modules/zotero/transformer.ts` 中添加阅读时长估算功能
- **调用时机**：在 `transformToXMnote()` 方法中处理笔记数据时计算
- **数据来源**：使用现有的 `extractedNotes` 数据

### 6.2 新增模块

```typescript
// src/modules/reading/duration-estimator.ts
export class ReadingDurationEstimator {
  private config: ReadingEstimationConfig;

  constructor(config?: Partial<ReadingEstimationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  estimateFromNotes(notes: XMnoteEntry[]): {
    preciseReadingDurations: PreciseReadingDuration[];
    fuzzyReadingDurations: FuzzyReadingDuration[];
    totalReadingTime: number;
  };
}
```

## 7. 用户配置选项

### 7.1 偏好设置

在插件配置中添加：

- ✅ **启用阅读时长估算**：开关选项
- ✅ **会话间隔时间**：可调整的时间阈值
- ✅ **单笔记估算时长**：可自定义的默认时长
- ✅ **最大会话时长**：防止异常长时间的上限

### 7.2 数据展示

- **统计信息**：在导出时显示估算的总阅读时长
- **会话详情**：可选择显示具体的阅读会话分解
- **质量指标**：显示估算的可信度（基于笔记密度等）

## 8. 实施步骤

### 8.1 第一阶段（核心功能）

1. 实现基础的会话分组算法
2. 添加简单的时长估算逻辑
3. 生成符合XMnote API的数据格式
4. 在现有导出流程中集成

### 8.2 第二阶段（优化改进）

1. 添加智能参数调整
2. 实现质量检测和异常处理
3. 提供用户配置选项
4. 优化算法准确性

### 8.3 第三阶段（高级功能）

1. 添加阅读模式识别（快速浏览vs深度阅读）
2. 支持多种时长估算策略
3. 提供详细的统计报告
4. 支持历史数据分析

## 9. 预期效果

### 9.1 数据示例

对于一个包含20个笔记的文档：

```
原始笔记：20个，时间跨度：2天
估算结果：
- 会话数：5个
- 总阅读时长：2.5小时
- 精确记录：5条 preciseReadingDurations
- 模糊记录：2条 fuzzyReadingDurations（按天）
```

### 9.2 准确性评估

- **优点**：基于真实用户行为（笔记创建）
- **限制**：无法捕获无笔记的阅读时间
- **适用性**：对勤做笔记的用户效果更好

这个简化方案可以作为阅读时长跟踪的第一步实现，为用户提供有价值的阅读统计数据，同时为后续更精确的跟踪功能奠定基础。
