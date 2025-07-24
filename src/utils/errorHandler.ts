// 全局错误处理器

import { logger } from "./logger";

export class XMnoteError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: any,
  ) {
    super(message);
    this.name = "XMnoteError";
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // 处理通用错误
  handleError(error: Error | XMnoteError | any, context?: string): void {
    const errorMessage = this.formatError(error, context);
    logger.error(errorMessage, error);

    // 根据错误类型决定是否显示用户通知
    if (this.shouldNotifyUser(error)) {
      this.showUserNotification(errorMessage, "error");
    }
  }

  // 处理警告
  handleWarning(message: string, context?: string): void {
    const warningMessage = context ? `[${context}] ${message}` : message;
    logger.warn(warningMessage);

    this.showUserNotification(warningMessage, "warning");
  }

  // 格式化错误信息
  private formatError(error: any, context?: string): string {
    let message = "";

    if (context) {
      message += `[${context}] `;
    }

    if (error instanceof XMnoteError) {
      message += `XMnote Error (${error.code || "UNKNOWN"}): ${error.message}`;
      if (error.context) {
        message += ` | Context: ${JSON.stringify(error.context)}`;
      }
    } else if (error instanceof Error) {
      message += `${error.name}: ${error.message}`;
    } else if (typeof error === "string") {
      message += error;
    } else {
      message += `Unknown error: ${JSON.stringify(error)}`;
    }

    return message;
  }

  // 判断是否应该通知用户
  private shouldNotifyUser(error: any): boolean {
    // 网络错误、配置错误等应该通知用户
    if (error instanceof XMnoteError) {
      const notifyableCodes = [
        "CONFIG_ERROR",
        "NETWORK_ERROR",
        "API_ERROR",
        "VALIDATION_ERROR",
      ];
      return notifyableCodes.includes(error.code || "");
    }

    // 一般的错误也通知用户
    return true;
  }

  // 显示用户通知
  private showUserNotification(
    message: string,
    type: "error" | "warning" | "info",
  ): void {
    try {
      const progressWindow = new ztoolkit.ProgressWindow("XMnote");

      let progressType: "default" | "success" | "fail";
      switch (type) {
        case "error":
          progressType = "fail";
          break;
        case "warning":
          progressType = "default";
          break;
        case "info":
          progressType = "success";
          break;
        default:
          progressType = "default";
      }

      progressWindow
        .createLine({
          text: message,
          type: progressType,
        })
        .show(type === "error" ? 5000 : 3000);
    } catch (notificationError) {
      // 如果通知系统也失败了，至少记录到控制台
      console.error("Failed to show user notification:", notificationError);
      console.error("Original message:", message);
    }
  }

  // 创建特定类型的错误
  createConfigError(message: string, context?: any): XMnoteError {
    return new XMnoteError(message, "CONFIG_ERROR", context);
  }

  createNetworkError(message: string, context?: any): XMnoteError {
    return new XMnoteError(message, "NETWORK_ERROR", context);
  }

  createApiError(message: string, context?: any): XMnoteError {
    return new XMnoteError(message, "API_ERROR", context);
  }

  createValidationError(message: string, context?: any): XMnoteError {
    return new XMnoteError(message, "VALIDATION_ERROR", context);
  }

  createDataError(message: string, context?: any): XMnoteError {
    return new XMnoteError(message, "DATA_ERROR", context);
  }

  // 包装异步函数以自动处理错误
  wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string,
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error, context);
        throw error;
      }
    };
  }

  // 包装同步函数以自动处理错误
  wrapSync<T extends any[], R>(
    fn: (...args: T) => R,
    context?: string,
  ): (...args: T) => R {
    return (...args: T): R => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error, context);
        throw error;
      }
    };
  }

  // 安全执行函数（不重新抛出错误）
  safeExecute<T>(
    fn: () => T,
    context?: string,
    defaultValue?: T,
  ): T | undefined {
    try {
      return fn();
    } catch (error) {
      this.handleError(error, context);
      return defaultValue;
    }
  }

  // 安全执行异步函数（不重新抛出错误）
  async safeExecuteAsync<T>(
    fn: () => Promise<T>,
    context?: string,
    defaultValue?: T,
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error, context);
      return defaultValue;
    }
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance();

// 便捷函数
export const handleError = (error: any, context?: string) =>
  errorHandler.handleError(error, context);

export const handleWarning = (message: string, context?: string) =>
  errorHandler.handleWarning(message, context);

export const createConfigError = (message: string, context?: any) =>
  errorHandler.createConfigError(message, context);

export const createNetworkError = (message: string, context?: any) =>
  errorHandler.createNetworkError(message, context);

export const createApiError = (message: string, context?: any) =>
  errorHandler.createApiError(message, context);

export const createValidationError = (message: string, context?: any) =>
  errorHandler.createValidationError(message, context);

export const createDataError = (message: string, context?: any) =>
  errorHandler.createDataError(message, context);

export const wrapAsync = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string,
) => errorHandler.wrapAsync(fn, context);

export const wrapSync = <T extends any[], R>(
  fn: (...args: T) => R,
  context?: string,
) => errorHandler.wrapSync(fn, context);

export const safeExecute = <T>(
  fn: () => T,
  context?: string,
  defaultValue?: T,
) => errorHandler.safeExecute(fn, context, defaultValue);

export const safeExecuteAsync = <T>(
  fn: () => Promise<T>,
  context?: string,
  defaultValue?: T,
) => errorHandler.safeExecuteAsync(fn, context, defaultValue);
