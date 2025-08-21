// 首选项面板脚本

import { configManager } from "./settings";
import { getXMnoteApiClient } from "../xmnote/api";
import { logger } from "../../utils/logger";
import type {
  ImportOptions,
  PluginConfig,
  UIConfig,
  XMnoteConfig,
} from "./types";

export function registerPrefsScripts(window: Window) {
  // 初始化首选项界面
  initializePrefsUI(window);

  // 绑定事件处理器
  bindEventHandlers(window);

  // 加载当前配置
  loadCurrentConfig(window);
}

function initializePrefsUI(window: Window) {
  logger.info("Initializing XMnote preferences UI");

  // 这里可以添加额外的UI初始化逻辑
  const doc = window.document;

  // 确保所有元素都存在
  const requiredElements = [
    "xmnote-server-ip",
    "xmnote-server-port",
    "xmnote-server-timeout",
    "xmnote-test-connection",
    "xmnote-include-notes",
    "xmnote-include-annotations",
    "xmnote-include-metadata",
    "xmnote-include-current-page",
    "xmnote-include-reading-duration",
    "xmnote-punctuation-comma",
    "xmnote-punctuation-period",
    "xmnote-punctuation-question-mark",
    "xmnote-punctuation-exclamation-mark",
    "xmnote-punctuation-colon",
    "xmnote-punctuation-semicolon",
    "xmnote-punctuation-parentheses",
    "xmnote-punctuation-brackets",
    "xmnote-punctuation-braces",
    "xmnote-punctuation-double-quotes",
    "xmnote-punctuation-single-quotes",
    "xmnote-reading-duration-enabled",
    "xmnote-reading-duration-max-session-gap",
    "xmnote-reading-duration-min-session-duration",
    "xmnote-reading-duration-max-session-duration",
    "xmnote-reading-duration-single-note-estimate",
    "xmnote-reading-duration-reading-speed-factor",
    "xmnote-batch-size",
    "xmnote-retry-count",
    "xmnote-show-progress",
    "xmnote-show-notifications",
    "xmnote-language",
    "xmnote-reset-defaults",
    "xmnote-save-config",
  ];

  const missingElements = requiredElements.filter(
    (id) => !doc.getElementById(id),
  );
  if (missingElements.length > 0) {
    logger.warn("Missing UI elements:", missingElements);
  }
}

function bindEventHandlers(window: Window) {
  const doc = window.document;

  // 测试连接按钮
  const testButton = doc.getElementById(
    "xmnote-test-connection",
  ) as HTMLButtonElement;
  if (testButton) {
    testButton.addEventListener("click", () => handleTestConnection(window));
  }

  // 保存配置按钮
  const saveButton = doc.getElementById(
    "xmnote-save-config",
  ) as HTMLButtonElement;
  if (saveButton) {
    saveButton.addEventListener("click", () => handleSaveConfig(window));
  }

  // 重置默认值按钮
  const resetButton = doc.getElementById(
    "xmnote-reset-defaults",
  ) as HTMLButtonElement;
  if (resetButton) {
    resetButton.addEventListener("click", () => handleResetDefaults(window));
  }

  // 实时验证输入
  const ipInput = doc.getElementById("xmnote-server-ip") as HTMLInputElement;
  if (ipInput) {
    ipInput.addEventListener("input", () => validateInput(window));
  }

  const portInput = doc.getElementById(
    "xmnote-server-port",
  ) as HTMLInputElement;
  if (portInput) {
    portInput.addEventListener("input", () => validateInput(window));
  }
}

function loadCurrentConfig(window: Window) {
  try {
    const config = configManager.getConfig();
    const doc = window.document;

    // 服务器配置
    setInputValue(doc, "xmnote-server-ip", config.xmnoteServer.ip);
    setInputValue(
      doc,
      "xmnote-server-port",
      config.xmnoteServer.port.toString(),
    );
    setInputValue(
      doc,
      "xmnote-server-timeout",
      (config.xmnoteServer.timeout || 30000).toString(),
    );

    // 导入选项
    setCheckboxValue(
      doc,
      "xmnote-include-notes",
      config.importOptions.includeNotes,
    );
    setCheckboxValue(
      doc,
      "xmnote-include-annotations",
      config.importOptions.includeAnnotations,
    );
    setCheckboxValue(
      doc,
      "xmnote-include-metadata",
      config.importOptions.includeMetadata,
    );
    setCheckboxValue(
      doc,
      "xmnote-include-current-page",
      config.importOptions.includeCurrentPage,
    );
    setCheckboxValue(
      doc,
      "xmnote-include-reading-duration",
      config.importOptions.includeReadingDuration,
    );

    // 标点符号替换选项
    setCheckboxValue(
      doc,
      "xmnote-punctuation-comma",
      config.importOptions.punctuationOptions.comma,
    );
    setCheckboxValue(
      doc,
      "xmnote-punctuation-period",
      config.importOptions.punctuationOptions.period,
    );
    setCheckboxValue(
      doc,
      "xmnote-punctuation-question-mark",
      config.importOptions.punctuationOptions.questionMark,
    );
    setCheckboxValue(
      doc,
      "xmnote-punctuation-exclamation-mark",
      config.importOptions.punctuationOptions.exclamationMark,
    );
    setCheckboxValue(
      doc,
      "xmnote-punctuation-colon",
      config.importOptions.punctuationOptions.colon,
    );
    setCheckboxValue(
      doc,
      "xmnote-punctuation-semicolon",
      config.importOptions.punctuationOptions.semicolon,
    );
    setCheckboxValue(
      doc,
      "xmnote-punctuation-parentheses",
      config.importOptions.punctuationOptions.parentheses,
    );
    setCheckboxValue(
      doc,
      "xmnote-punctuation-brackets",
      config.importOptions.punctuationOptions.brackets,
    );
    setCheckboxValue(
      doc,
      "xmnote-punctuation-braces",
      config.importOptions.punctuationOptions.braces,
    );
    setCheckboxValue(
      doc,
      "xmnote-punctuation-double-quotes",
      config.importOptions.punctuationOptions.doubleQuotes,
    );
    setCheckboxValue(
      doc,
      "xmnote-punctuation-single-quotes",
      config.importOptions.punctuationOptions.singleQuotes,
    );
    setInputValue(
      doc,
      "xmnote-batch-size",
      config.importOptions.batchSize.toString(),
    );
    setInputValue(
      doc,
      "xmnote-retry-count",
      config.importOptions.retryCount.toString(),
    );

    // 阅读时长配置
    setCheckboxValue(
      doc,
      "xmnote-reading-duration-enabled",
      config.importOptions.readingDuration.enabled,
    );
    setInputValue(
      doc,
      "xmnote-reading-duration-max-session-gap",
      config.importOptions.readingDuration.maxSessionGap.toString(),
    );
    setInputValue(
      doc,
      "xmnote-reading-duration-min-session-duration",
      config.importOptions.readingDuration.minSessionDuration.toString(),
    );
    setInputValue(
      doc,
      "xmnote-reading-duration-max-session-duration",
      config.importOptions.readingDuration.maxSessionDuration.toString(),
    );
    setInputValue(
      doc,
      "xmnote-reading-duration-single-note-estimate",
      config.importOptions.readingDuration.singleNoteEstimate.toString(),
    );
    setInputValue(
      doc,
      "xmnote-reading-duration-reading-speed-factor",
      config.importOptions.readingDuration.readingSpeedFactor.toString(),
    );

    // UI配置
    setCheckboxValue(doc, "xmnote-show-progress", config.ui.showProgress);
    setCheckboxValue(
      doc,
      "xmnote-show-notifications",
      config.ui.showNotifications,
    );
    setSelectValue(doc, "xmnote-language", config.ui.language);

    logger.info("Configuration loaded into preferences UI");
  } catch (error) {
    logger.error("Failed to load configuration into UI:", error);
    showStatus(window, "Failed to load configuration", "error");
  }
}

async function handleTestConnection(window: Window) {
  const doc = window.document;
  const statusElement = doc.getElementById(
    "xmnote-connection-status",
  ) as HTMLElement;
  const testButton = doc.getElementById(
    "xmnote-test-connection",
  ) as HTMLButtonElement;

  if (!statusElement || !testButton) return;

  try {
    // 禁用按钮并显示测试状态
    testButton.disabled = true;
    statusElement.textContent = "测试中...";
    statusElement.style.color = "#666";

    // 获取当前配置
    const config = getConfigFromUI(window);
    if (!config) {
      throw new Error("Invalid configuration");
    }

    // 执行连接测试
    const apiClient = getXMnoteApiClient();
    apiClient.configure(config.xmnoteServer);

    const success = await apiClient.testConnection();

    if (success) {
      statusElement.textContent = "✓ 连接成功";
      statusElement.style.color = "#28a745";
      showStatus(window, "Connection test successful", "success");
    } else {
      statusElement.textContent = "✗ 连接失败";
      statusElement.style.color = "#dc3545";
      showStatus(window, "Connection test failed", "error");
    }
  } catch (error) {
    logger.error("Connection test error:", error);
    statusElement.textContent = "✗ 连接错误";
    statusElement.style.color = "#dc3545";
    showStatus(
      window,
      `Connection error: ${error instanceof Error ? error.message : String(error)}`,
      "error",
    );
  } finally {
    testButton.disabled = false;
  }
}

function handleSaveConfig(window: Window) {
  try {
    const config = getConfigFromUI(window);
    if (!config) {
      throw new Error("Invalid configuration");
    }

    // 验证配置
    const validation = configManager.validateConfig(config);
    if (!validation.isValid) {
      throw new Error(
        `Configuration validation failed: ${validation.errors.join(", ")}`,
      );
    }

    // 保存配置
    configManager.saveConfig(config);

    // 重新配置API客户端
    const apiClient = getXMnoteApiClient();
    apiClient.configure(config.xmnoteServer);

    showStatus(window, "Configuration saved successfully", "success");
    logger.info("Configuration saved from preferences UI");

    if (validation.warnings.length > 0) {
      logger.warn("Configuration warnings:", validation.warnings);
    }
  } catch (error) {
    logger.error("Failed to save configuration:", error);
    showStatus(
      window,
      `Failed to save: ${error instanceof Error ? error.message : String(error)}`,
      "error",
    );
  }
}

function handleResetDefaults(window: Window) {
  try {
    configManager.resetToDefaults();
    loadCurrentConfig(window);
    showStatus(window, "Configuration reset to defaults", "success");
    logger.info("Configuration reset to defaults");
  } catch (error) {
    logger.error("Failed to reset configuration:", error);
    showStatus(
      window,
      `Failed to reset: ${error instanceof Error ? error.message : String(error)}`,
      "error",
    );
  }
}

function validateInput(window: Window) {
  const config = getConfigFromUI(window);
  if (!config) return;

  const validation = configManager.validateConfig(config);
  const doc = window.document;

  // 清除之前的验证状态
  clearValidationStatus(doc);

  if (!validation.isValid) {
    // 显示第一个错误
    showStatus(window, validation.errors[0], "warning");
  }
}

function getConfigFromUI(window: Window): PluginConfig | null {
  try {
    const doc = window.document;

    const xmnoteServer: XMnoteConfig = {
      ip: getInputValue(doc, "xmnote-server-ip") || "192.168.1.100",
      port: parseInt(getInputValue(doc, "xmnote-server-port") || "8080"),
      timeout: parseInt(getInputValue(doc, "xmnote-server-timeout") || "30000"),
    };

    const importOptions: ImportOptions = {
      includeNotes: getCheckboxValue(doc, "xmnote-include-notes"),
      includeAnnotations: getCheckboxValue(doc, "xmnote-include-annotations"),
      includeMetadata: getCheckboxValue(doc, "xmnote-include-metadata"),
      includeCurrentPage: getCheckboxValue(doc, "xmnote-include-current-page"),
      includeReadingDuration: getCheckboxValue(
        doc,
        "xmnote-include-reading-duration",
      ),
      punctuationOptions: {
        comma: getCheckboxValue(doc, "xmnote-punctuation-comma"),
        period: getCheckboxValue(doc, "xmnote-punctuation-period"),
        questionMark: getCheckboxValue(doc, "xmnote-punctuation-question-mark"),
        exclamationMark: getCheckboxValue(
          doc,
          "xmnote-punctuation-exclamation-mark",
        ),
        colon: getCheckboxValue(doc, "xmnote-punctuation-colon"),
        semicolon: getCheckboxValue(doc, "xmnote-punctuation-semicolon"),
        parentheses: getCheckboxValue(doc, "xmnote-punctuation-parentheses"),
        brackets: getCheckboxValue(doc, "xmnote-punctuation-brackets"),
        braces: getCheckboxValue(doc, "xmnote-punctuation-braces"),
        doubleQuotes: getCheckboxValue(doc, "xmnote-punctuation-double-quotes"),
        singleQuotes: getCheckboxValue(doc, "xmnote-punctuation-single-quotes"),
      },
      readingDuration: {
        enabled: getCheckboxValue(doc, "xmnote-reading-duration-enabled"),
        maxSessionGap: parseInt(
          getInputValue(doc, "xmnote-reading-duration-max-session-gap") ||
            "1800",
        ),
        minSessionDuration: parseInt(
          getInputValue(doc, "xmnote-reading-duration-min-session-duration") ||
            "600",
        ),
        maxSessionDuration: parseInt(
          getInputValue(doc, "xmnote-reading-duration-max-session-duration") ||
            "14400",
        ),
        singleNoteEstimate: parseInt(
          getInputValue(doc, "xmnote-reading-duration-single-note-estimate") ||
            "600",
        ),
        readingSpeedFactor: parseFloat(
          getInputValue(doc, "xmnote-reading-duration-reading-speed-factor") ||
            "1.2",
        ),
      },
      batchSize: parseInt(getInputValue(doc, "xmnote-batch-size") || "10"),
      retryCount: parseInt(getInputValue(doc, "xmnote-retry-count") || "3"),
      timeoutMs: xmnoteServer.timeout || 30000,
    };

    const ui: UIConfig = {
      showProgress: getCheckboxValue(doc, "xmnote-show-progress"),
      showNotifications: getCheckboxValue(doc, "xmnote-show-notifications"),
      language: (getSelectValue(doc, "xmnote-language") || "zh-CN") as
        | "en-US"
        | "zh-CN",
    };

    return {
      xmnoteServer,
      importOptions,
      ui,
    };
  } catch (error) {
    logger.error("Failed to get configuration from UI:", error);
    return null;
  }
}

function showStatus(
  window: Window,
  message: string,
  type: "success" | "error" | "warning",
) {
  const doc = window.document;
  const statusElement = doc.getElementById(
    "xmnote-config-status",
  ) as HTMLElement;

  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.style.display = "block";

  // 设置样式
  switch (type) {
    case "success":
      statusElement.style.backgroundColor = "#d4edda";
      statusElement.style.color = "#155724";
      statusElement.style.border = "1px solid #c3e6cb";
      break;
    case "error":
      statusElement.style.backgroundColor = "#f8d7da";
      statusElement.style.color = "#721c24";
      statusElement.style.border = "1px solid #f5c6cb";
      break;
    case "warning":
      statusElement.style.backgroundColor = "#fff3cd";
      statusElement.style.color = "#856404";
      statusElement.style.border = "1px solid #ffeaa7";
      break;
  }

  // 3秒后自动隐藏
  setTimeout(() => {
    statusElement.style.display = "none";
  }, 3000);
}

function clearValidationStatus(doc: Document) {
  // 这里可以清除输入框的验证状态样式
}

// 工具函数
function getInputValue(doc: Document, id: string): string {
  const element = doc.getElementById(id) as HTMLInputElement;
  return element ? element.value : "";
}

function setInputValue(doc: Document, id: string, value: string) {
  const element = doc.getElementById(id) as HTMLInputElement;
  if (element) {
    element.value = value;
  }
}

function getCheckboxValue(doc: Document, id: string): boolean {
  const element = doc.getElementById(id) as HTMLInputElement;
  return element ? element.checked : false;
}

function setCheckboxValue(doc: Document, id: string, value: boolean) {
  const element = doc.getElementById(id) as HTMLInputElement;
  if (element) {
    element.checked = value;
  }
}

function getSelectValue(doc: Document, id: string): string {
  const element = doc.getElementById(id) as HTMLSelectElement;
  return element ? element.value : "";
}

function setSelectValue(doc: Document, id: string, value: string) {
  const element = doc.getElementById(id) as HTMLSelectElement;
  if (element) {
    element.value = value;
  }
}
