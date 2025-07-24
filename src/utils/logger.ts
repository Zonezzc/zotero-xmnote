// 日志记录工具

export class Logger {
  private static instance: Logger;
  private prefix = "[XMnote]";

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, ...args: any[]): void {
    ztoolkit.log(`${this.prefix} ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    ztoolkit.log(`${this.prefix} [WARN] ${message}`, ...args);
  }

  error(message: string, error?: Error | any, ...args: any[]): void {
    if (error) {
      ztoolkit.log(`${this.prefix} [ERROR] ${message}`, error, ...args);
    } else {
      ztoolkit.log(`${this.prefix} [ERROR] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    // 在开发模式下显示debug日志
    const isDevelopment =
      typeof process !== "undefined" && process.env.NODE_ENV === "development";
    if (isDevelopment) {
      ztoolkit.log(`${this.prefix} [DEBUG] ${message}`, ...args);
    }
  }
}

// 导出单例实例
export const logger = Logger.getInstance();
