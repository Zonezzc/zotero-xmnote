import type { PreciseReadingDuration, XMnoteEntry } from "../xmnote/types";

export interface ReadingEstimationConfig {
  maxSessionGap: number; // 最大会话间隔（秒）：1小时 = 3600秒
  minSessionDuration: number; // 最小会话时长（秒）：10分钟 = 600秒
  maxSessionDuration: number; // 最大会话时长（秒）：4小时 = 14400秒
  singleNoteEstimate: number; // 单笔记估算时长（秒）：10分钟 = 600秒
  readingSpeedFactor: number; // 阅读速度因子：用于根据页数调整时长
}

export interface ReadingSession {
  startTime: number; // 会话开始时间
  endTime: number; // 会话结束时间
  duration: number; // 估算阅读时长（秒）
  startPosition: number; // 开始位置（页码）
  endPosition: number; // 结束位置（页码）
  notes: XMnoteEntry[]; // 包含的笔记
  noteCount: number; // 笔记数量
  pageProgress: number; // 页面进度变化
}

export interface ReadingDurationResult {
  preciseReadingDurations: PreciseReadingDuration[];
  totalReadingTime: number;
  sessions: ReadingSession[];
}

const DEFAULT_CONFIG: ReadingEstimationConfig = {
  maxSessionGap: 1800, // 30分钟间隔
  minSessionDuration: 600, // 最少10分钟
  maxSessionDuration: 14400, // 最多4小时
  singleNoteEstimate: 600, // 单笔记10分钟
  readingSpeedFactor: 1.2, // 阅读速度调整因子
};

export class ReadingDurationEstimator {
  private config: ReadingEstimationConfig;

  constructor(config?: Partial<ReadingEstimationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  estimateFromNotes(notes: XMnoteEntry[]): ReadingDurationResult {
    // 1. 预处理笔记
    const validNotes = this.preprocessNotes(notes);

    if (validNotes.length === 0) {
      return {
        preciseReadingDurations: [],
        totalReadingTime: 0,
        sessions: [],
      };
    }

    // 2. 分组成会话
    const sessions = this.groupNotesIntoSessions(validNotes);

    // 3. 估算每个会话的时长
    sessions.forEach((session) => {
      session.duration = this.estimateSessionDuration(session);
    });

    // 4. 生成输出数据
    const preciseReadingDurations =
      this.generatePreciseReadingDurations(sessions);
    const totalReadingTime = sessions.reduce(
      (total, session) => total + session.duration,
      0,
    );

    return {
      preciseReadingDurations,
      totalReadingTime,
      sessions,
    };
  }

  private preprocessNotes(notes: XMnoteEntry[]): XMnoteEntry[] {
    // 1. 过滤有效笔记（有时间戳的）
    const validNotes = notes.filter((note) => note.time && note.time > 0);

    // 2. 按时间排序
    return validNotes.sort((a, b) => (a.time || 0) - (b.time || 0));
  }

  private groupNotesIntoSessions(notes: XMnoteEntry[]): ReadingSession[] {
    const sessions: ReadingSession[] = [];
    let currentSession: ReadingSession | null = null;

    for (const note of notes) {
      if (!currentSession) {
        // 创建新会话
        currentSession = this.createNewSession(note);
      } else {
        const timeDiff = (note.time || 0) - currentSession.endTime;

        if (timeDiff <= this.config.maxSessionGap) {
          // 归入当前会话
          this.addNoteToSession(currentSession, note);
        } else {
          // 结束当前会话，开始新会话
          sessions.push(currentSession);
          currentSession = this.createNewSession(note);
        }
      }
    }

    // 处理最后一个会话
    if (currentSession) {
      sessions.push(currentSession);
    }

    return sessions;
  }

  private createNewSession(note: XMnoteEntry): ReadingSession {
    const position = note.page || 0;
    return {
      startTime: note.time || 0,
      endTime: note.time || 0,
      duration: 0,
      startPosition: position,
      endPosition: position,
      notes: [note],
      noteCount: 1,
      pageProgress: 0,
    };
  }

  private addNoteToSession(session: ReadingSession, note: XMnoteEntry): void {
    session.notes.push(note);
    session.noteCount++;
    session.endTime = note.time || session.endTime;
    session.endPosition = note.page || session.endPosition;
    session.pageProgress = Math.abs(
      session.endPosition - session.startPosition,
    );
  }

  private estimateSessionDuration(session: ReadingSession): number {
    if (session.notes.length === 1) {
      // 单笔记：使用固定估算时长
      return this.config.singleNoteEstimate;
    }

    // 多笔记：基于时间跨度估算
    const timeSpan = session.endTime - session.startTime;
    const baseDuration = Math.min(timeSpan, this.config.maxSessionDuration);

    // 根据页数变化调整（可选优化）
    const adjustedDuration = Math.max(
      baseDuration * this.config.readingSpeedFactor,
      this.config.minSessionDuration,
    );

    return Math.min(adjustedDuration, this.config.maxSessionDuration);
  }

  private generatePreciseReadingDurations(
    sessions: ReadingSession[],
  ): PreciseReadingDuration[] {
    if (sessions.length === 0) return [];

    const filteredSessions: ReadingSession[] = [];

    for (const session of sessions) {
      if (filteredSessions.length === 0) {
        // 添加第一个会话
        filteredSessions.push(session);
      } else {
        const lastSession = filteredSessions[filteredSessions.length - 1];
        const lastEndTime = lastSession.startTime + lastSession.duration;
        const currentStartTime = session.startTime;

        // 检查与上一个会话结束时间的间隔
        const timeBetweenSessions = currentStartTime - lastEndTime;

        if (timeBetweenSessions >= this.config.maxSessionGap) {
          // 间隔足够大，添加新会话
          filteredSessions.push(session);
        }
        // 否则跳过当前会话（间隔太小）
      }
    }

    return filteredSessions.map((session) => ({
      startTime: session.startTime * 1000, // 转换为毫秒
      endTime: (session.startTime + session.duration) * 1000,
      position: session.endPosition,
    }));
  }

  // 智能调整配置参数
  adaptConfigByUser(notes: XMnoteEntry[]): ReadingEstimationConfig {
    const avgInterval = this.calculateAverageNoteInterval(notes);
    const noteFrequency = this.calculateNoteFrequency(notes);

    return {
      ...this.config,
      maxSessionGap: Math.max(avgInterval * 3, 1800), // 动态调整会话间隔
      singleNoteEstimate: Math.max(noteFrequency * 2, 600), // 根据笔记频率调整
    };
  }

  private calculateAverageNoteInterval(notes: XMnoteEntry[]): number {
    if (notes.length < 2) return 1800; // 默认30分钟

    const validNotes = notes
      .filter((note) => note.time && note.time > 0)
      .sort((a, b) => (a.time || 0) - (b.time || 0));

    if (validNotes.length < 2) return 1800;

    let totalInterval = 0;
    let count = 0;

    for (let i = 1; i < validNotes.length; i++) {
      const interval =
        (validNotes[i].time || 0) - (validNotes[i - 1].time || 0);
      if (interval > 0 && interval < 86400) {
        // 忽略超过1天的间隔
        totalInterval += interval;
        count++;
      }
    }

    return count > 0 ? totalInterval / count : 1800;
  }

  private calculateNoteFrequency(notes: XMnoteEntry[]): number {
    const validNotes = notes.filter((note) => note.time && note.time > 0);
    if (validNotes.length === 0) return 600; // 默认10分钟

    // 简单的频率计算：假设每个笔记代表的平均阅读时间
    return Math.max(600, Math.min(1800, 600 * (validNotes.length / 10))); // 基于笔记数量调整
  }
}
