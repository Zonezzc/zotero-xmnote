import { assert } from "chai";

const nativeMenuIDs = [
  "zotero-xmnote-tools-menu",
  "zotero-xmnote-selected-item-menu",
  "zotero-xmnote-item-context-menu",
  "zotero-xmnote-collection-context-menu",
];

const legacyMenuIDs = [
  "zotero-xmnote-export-menu",
  "zotero-xmnote-export-selected-menu",
  "zotero-itemmenu-xmnote-quick-export",
  "zotero-itemmenu-xmnote-export-with-options",
  "zotero-collectionmenu-xmnote-export",
];

describe("Zotero 7/8/9 compatibility", function () {
  it("runs on a declared Zotero major version", function () {
    const majorVersion = Number.parseInt(Zotero.version.split(".")[0], 10);
    assert.include([7, 8, 9], majorVersion);
  });

  it("initializes the XMnote plugin", function () {
    const plugin = (Zotero as any).zonezzc;
    assert.isTrue(plugin?.data?.initialized);
    assert.isFunction(plugin?.api?.getDataExporter);
    assert.isFunction(plugin?.api?.getXMnoteApiClient);
  });

  it("registers menus through the API available in this Zotero version", function () {
    const menuManager = (Zotero as any).MenuManager;

    if (typeof menuManager?.registerMenu === "function") {
      const registeredMenuIDs = menuManager._menuManager.options
        .filter((option: any) => option.pluginID === "zotero-xmnote")
        .map((option: any) => option.menuID);
      assert.includeMembers(registeredMenuIDs, nativeMenuIDs);
      return;
    }

    const document = Zotero.getMainWindow().document;
    for (const menuID of legacyMenuIDs) {
      assert.exists(
        document.getElementById(menuID),
        `Legacy menu ${menuID} should be registered`,
      );
    }
  });
});
