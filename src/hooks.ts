import { getString, initLocale } from "./utils/locale";
import { registerPrefsScripts as registerXMnotePrefsScripts } from "./modules/config/preferences";
import { createZToolkit } from "./utils/ztoolkit";
import { logger } from "./utils/logger";
import { configManager } from "./modules/config/settings";

async function onStartup() {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);

  initLocale();

  logger.info("Starting XMnote plugin initialization");

  // 注册首选项面板
  registerXMnotePrefs();

  // 初始化配置管理器
  configManager.getConfig();

  // 注册XMnote菜单项
  try {
    const { MenuHandler } = await import("./modules/ui/menuHandler");
    const menuHandler = MenuHandler.getInstance();
    menuHandler.registerMenuItems();

    // 注册右键菜单
    const { ContextMenuHandler } = await import("./modules/ui/contextMenu");
    ContextMenuHandler.registerItemContextMenu();
    ContextMenuHandler.registerCollectionContextMenu();

    logger.info("XMnote menus and context menus registered successfully");
  } catch (error) {
    logger.error("Failed to register XMnote menus:", error);
  }

  await Promise.all(
    Zotero.getMainWindows().map((win) => onMainWindowLoad(win)),
  );

  // Mark initialized as true to confirm plugin loading status
  // outside of the plugin (e.g. scaffold testing process)
  addon.data.initialized = true;
}

async function onMainWindowLoad(win: _ZoteroTypes.MainWindow): Promise<void> {
  // Create ztoolkit for every window
  addon.data.ztoolkit = createZToolkit();

  win.MozXULElement.insertFTLIfNeeded(
    `${addon.data.config.addonRef}-mainWindow.ftl`,
  );

  const popupWin = new ztoolkit.ProgressWindow(addon.data.config.addonName, {
    closeOnClick: true,
    closeTime: -1,
  })
    .createLine({
      text: getString("startup-begin"),
      type: "default",
      progress: 0,
    })
    .show();

  await Zotero.Promise.delay(1000);
  popupWin.changeLine({
    progress: 30,
    text: `[30%] ${getString("startup-begin")}`,
  });

  await Zotero.Promise.delay(1000);

  popupWin.changeLine({
    progress: 100,
    text: `[100%] ${getString("startup-finish")}`,
  });
  popupWin.startCloseTimer(5000);
}

async function onMainWindowUnload(win: Window): Promise<void> {
  ztoolkit.unregisterAll();
}

function onShutdown(): void {
  logger.info("Shutting down XMnote plugin");

  ztoolkit.unregisterAll();
  // Remove addon object
  addon.data.alive = false;
  // @ts-expect-error - Plugin instance is not typed
  delete Zotero[addon.data.config.addonInstance];
}

async function onMenuCommand(command: string): Promise<void> {
  logger.info(`Menu command received: ${command}`);

  const { MenuHandler } = await import("./modules/ui/menuHandler");
  const menuHandler = MenuHandler.getInstance();

  switch (command) {
    case "export-all":
      await menuHandler.handleExportAll();
      break;
    case "export-selected":
      await menuHandler.handleExportSelected();
      break;
    default:
      logger.warn(`Unknown menu command: ${command}`);
  }
}

/**
 * This function is just an example of dispatcher for Notify events.
 * Any operations should be placed in a function to keep this funcion clear.
 */
async function onNotify(
  event: string,
  type: string,
  ids: Array<string | number>,
  extraData: { [key: string]: any },
) {
  // You can add your code to the corresponding notify type
  ztoolkit.log("notify", event, type, ids, extraData);
}

/**
 * This function is just an example of dispatcher for Preference UI events.
 * Any operations should be placed in a function to keep this funcion clear.
 * @param type event type
 * @param data event data
 */
async function onPrefsEvent(type: string, data: { [key: string]: any }) {
  switch (type) {
    case "load":
      registerXMnotePrefsScripts(data.window);
      break;
    default:
      return;
  }
}

function onShortcuts(type: string) {
  // TODO: Add shortcut handlers as needed
}

function onDialogEvents(type: string) {
  // TODO: Add dialog event handlers as needed
}

// 注册XMnote首选项面板
function registerXMnotePrefs() {
  try {
    Zotero.PreferencePanes.register({
      pluginID: addon.data.config.addonID,
      src: rootURI + "content/preferences.xhtml",
      label: "XMnote",
      image: `chrome://${addon.data.config.addonRef}/content/icons/favicon.png`,
    });
    logger.info("XMnote preferences panel registered");
  } catch (error) {
    logger.error("Failed to register preferences panel:", error);
  }
}

// Add your hooks here. For element click, etc.
// Keep in mind hooks only do dispatch. Don't add code that does real jobs in hooks.
// Otherwise the code would be hard to read and maintain.

export default {
  onStartup,
  onShutdown,
  onMainWindowLoad,
  onMainWindowUnload,
  onNotify,
  onPrefsEvent,
  onShortcuts,
  onDialogEvents,
  onMenuCommand,
};
