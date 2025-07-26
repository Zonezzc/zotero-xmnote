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

export class NetworkClient {
  private timeout: number = 30000; // 默认30秒超时

  constructor(timeout?: number) {
    if (timeout) {
      this.timeout = timeout;
    }
  }

  async post(
    url: string,
    data: any,
    headers: Record<string, string> = {},
  ): Promise<any> {
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    try {
      logger.debug(`POST request to: ${url}`);
      logger.debug(`Request data:`, data);

      const response = await this.makeRequest(url, {
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

  async get(url: string, headers: Record<string, string> = {}): Promise<any> {
    try {
      logger.debug(`GET request to: ${url}`);

      const response = await this.makeRequest(url, {
        method: "GET",
        headers,
      });

      return response;
    } catch (error) {
      logger.error(`GET request failed to ${url}:`, error);
      throw error;
    }
  }

  private async makeRequest(url: string, options: RequestInit): Promise<any> {
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
            if (xhr.status >= 200 && xhr.status < 300) {
              let responseData;
              try {
                responseData = xhr.responseText
                  ? JSON.parse(xhr.responseText)
                  : null;
              } catch {
                responseData = xhr.responseText;
              }
              
              logger.info(`HTTP ${xhr.status} Response:`, responseData);
              
              resolve({
                status: xhr.status,
                data: responseData,
                headers: this.parseHeaders(xhr.getAllResponseHeaders()),
              });
            } else {
              logger.error(`HTTP ${xhr.status} Error Response:`, xhr.responseText);
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
