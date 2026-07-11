// 网络请求工具

import { logger } from "./logger";

export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any,
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export interface NetworkResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

export class NetworkClient {
  private timeout: number = 30000; // 默认30秒超时

  constructor(timeout?: number) {
    if (timeout) {
      this.timeout = timeout;
    }
  }

  async post<T = unknown>(
    url: string,
    data: unknown,
    headers: Record<string, string> = {},
  ): Promise<NetworkResponse<T>> {
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    try {
      logger.debug(`POST request to: ${url}`);

      const response = await this.makeRequest<T>(url, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      logger.error(`POST request failed to ${url}:`, error);
      throw error;
    }
  }

  async get<T = unknown>(
    url: string,
    headers: Record<string, string> = {},
  ): Promise<NetworkResponse<T>> {
    try {
      logger.debug(`GET request to: ${url}`);

      const response = await this.makeRequest<T>(url, {
        method: "GET",
        headers,
      });

      return response;
    } catch (error) {
      logger.error(`GET request failed to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Perform a read-only reachability probe. Any real HTTP response, including
   * 4xx/5xx (for example 405 when OPTIONS is unsupported), proves that the
   * service is reachable.
   */
  async options(url: string): Promise<NetworkResponse<unknown>> {
    logger.debug(`OPTIONS request to: ${url}`);
    return this.makeRequest(url, { method: "OPTIONS" }, true);
  }

  private async makeRequest<T = unknown>(
    url: string,
    options: RequestInit,
    acceptAnyHttpStatus: boolean = false,
  ): Promise<NetworkResponse<T>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const timeoutId = setTimeout(() => {
        xhr.abort();
        reject(new NetworkError(`Request timeout after ${this.timeout}ms`));
      }, this.timeout);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          clearTimeout(timeoutId);

          try {
            if (
              (xhr.status >= 200 && xhr.status < 300) ||
              (acceptAnyHttpStatus && xhr.status > 0)
            ) {
              let responseData;
              try {
                responseData = xhr.responseText
                  ? JSON.parse(xhr.responseText)
                  : null;
              } catch {
                responseData = xhr.responseText;
              }

              logger.info(`HTTP ${xhr.status} response received`);

              resolve({
                status: xhr.status,
                data: responseData as T,
                headers: this.parseHeaders(xhr.getAllResponseHeaders()),
              });
            } else {
              logger.error(
                `HTTP ${xhr.status} Error Response:`,
                xhr.responseText,
              );
              reject(
                new NetworkError(
                  `HTTP ${xhr.status}: ${xhr.statusText}`,
                  xhr.status,
                  xhr.responseText,
                ),
              );
            }
          } catch (error) {
            reject(
              new NetworkError("Request processing failed", undefined, error),
            );
          }
        }
      };

      xhr.onerror = () => {
        clearTimeout(timeoutId);
        reject(new NetworkError("Network request failed"));
      };

      xhr.onabort = () => {
        clearTimeout(timeoutId);
        reject(new NetworkError("Request was aborted"));
      };

      xhr.open(options.method || "GET", url);

      // 设置请求头
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value as string);
        });
      }

      xhr.send(options.body as string);
    });
  }

  private parseHeaders(headerString: string): Record<string, string> {
    const headers: Record<string, string> = {};
    if (!headerString) return headers;

    headerString.split("\r\n").forEach((line) => {
      const parts = line.split(": ");
      if (parts.length === 2) {
        headers[parts[0].toLowerCase()] = parts[1];
      }
    });

    return headers;
  }
}

// 重试机制工具函数
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries) {
        logger.error(`Operation failed after ${maxRetries} retries:`, error);
        throw error;
      }

      const waitTime = delay * Math.pow(2, i);
      logger.warn(
        `Operation failed, retrying in ${waitTime}ms (attempt ${i + 1}/${maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  throw new Error("Max retries exceeded");
}
