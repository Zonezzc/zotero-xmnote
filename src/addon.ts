import { config } from "../package.json";
import hooks from "./hooks";
import { createZToolkit } from "./utils/ztoolkit";
import { ExportDialog } from "./modules/ui/exportDialog";
import { getDataExporter } from "./modules/exporter";
import { configManager } from "./modules/config/settings";
import { getXMnoteApiClient } from "./modules/xmnote/api";

class Addon {
  public data: {
    alive: boolean;
    config: typeof config;
    // Env type, see build.js
    env: "development" | "production";
    initialized?: boolean;
    ztoolkit: ZToolkit;
    locale?: {
      current: any;
    };
  };
  // Lifecycle hooks
  public hooks: typeof hooks;
  // APIs
  public api: object;

  constructor() {
    this.data = {
      alive: true,
      config,
      env: __env__,
      initialized: false,
      ztoolkit: createZToolkit(),
    };
    this.hooks = hooks;
    this.api = {
      ExportDialog,
      getDataExporter,
      configManager,
      getXMnoteApiClient,
    };
  }
}

export default Addon;
