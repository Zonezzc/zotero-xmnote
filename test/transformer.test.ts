import { assert } from "chai";

import { configManager } from "../src/modules/config/settings";
import { DataTransformerImpl } from "../src/modules/zotero/transformer";
import type { ZoteroAnnotation, ZoteroItem } from "../src/modules/zotero/types";

const testGlobal = globalThis as typeof globalThis & {
  ztoolkit?: { log: (...args: unknown[]) => void };
};
testGlobal.ztoolkit ??= { log: () => undefined };

function createItem(overrides: Partial<ZoteroItem> = {}): ZoteroItem {
  return {
    id: 1,
    title: "Mapping Test",
    itemType: "book",
    creators: [],
    tags: [],
    collections: [],
    numPages: 100,
    dateAdded: new Date(2025, 0, 1),
    ...overrides,
  };
}

function createAnnotation(pageLabel: string): ZoteroAnnotation {
  return {
    id: 2,
    parentItemID: 1,
    type: "highlight",
    text: "annotation",
    pageLabel,
    dateAdded: new Date(2025, 0, 2),
    dateModified: new Date(2025, 0, 2),
  };
}

describe("DataTransformerImpl mapping", function () {
  let originalGetImportOptions: typeof configManager.getImportOptions;

  before(function () {
    originalGetImportOptions = configManager.getImportOptions;
  });

  function configure(includeCurrentPage: boolean): void {
    const options = originalGetImportOptions.call(configManager);
    (configManager as any).getImportOptions = () => ({
      ...options,
      includeMetadata: true,
      includeCurrentPage,
      includeReadingDuration: false,
    });
  }

  afterEach(function () {
    (configManager as any).getImportOptions = originalGetImportOptions;
  });

  it("omits reading status fields without a trustworthy source", function () {
    configure(true);
    const result = new DataTransformerImpl().transformItem(
      createItem(),
      [],
      [],
      { includeReadingDuration: false },
    );

    assert.notProperty(result, "readingStatus");
    assert.notProperty(result, "readingStatusChangedDate");
  });

  it("keeps total pages but does not invent currentPage without annotations", function () {
    configure(true);
    const result = new DataTransformerImpl().transformItem(
      createItem(),
      [],
      [],
      { includeReadingDuration: false },
    );

    assert.strictEqual(result.totalPageCount, 100);
    assert.notProperty(result, "currentPage");
  });

  it("clamps annotation currentPage to totalPageCount", function () {
    configure(true);
    const result = new DataTransformerImpl().transformItem(
      createItem(),
      [],
      [createAnnotation("150")],
      { includeReadingDuration: false },
    );

    assert.strictEqual(result.totalPageCount, 100);
    assert.strictEqual(result.currentPage, 100);
  });

  it("preserves totalPageCount when current page export is disabled", function () {
    configure(false);
    const result = new DataTransformerImpl().transformItem(
      createItem(),
      [],
      [createAnnotation("50")],
      { includeReadingDuration: false },
    );

    assert.strictEqual(result.totalPageCount, 100);
    assert.notProperty(result, "currentPage");
  });
});
