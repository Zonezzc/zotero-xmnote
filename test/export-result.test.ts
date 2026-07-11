import { assert } from "chai";
import { createExportOutcome } from "../src/modules/exporter";
import type { BatchImportResult } from "../src/modules/xmnote/types";

function importResult(
  success: number,
  failedMessages: Array<string | undefined>,
): BatchImportResult {
  return {
    total: success + failedMessages.length,
    success,
    failed: failedMessages.length,
    results: [
      ...Array.from({ length: success }, () => ({ success: true })),
      ...failedMessages.map((message) => ({ success: false, message })),
    ],
  };
}

describe("XMnote export outcome", function () {
  it("treats a fully accepted request as pending confirmation", function () {
    const outcome = createExportOutcome({
      totalItems: 2,
      processedItems: 2,
      importResult: importResult(2, []),
      duration: 1200,
    });

    assert.isTrue(outcome.success);
    assert.equal(outcome.successfulImports, 2);
    assert.equal(outcome.failedImports, 0);
    assert.include(outcome.summary, "XMnote accepted 2");
    assert.include(outcome.summary, "confirm the accepted items");
    assert.notInclude(outcome.summary, "imported successfully");
  });

  it("reports accepted and failed counts for a partial result", function () {
    const outcome = createExportOutcome({
      totalItems: 3,
      processedItems: 3,
      importResult: importResult(2, ["invalid ISBN"]),
      duration: 500,
    });

    assert.isFalse(outcome.success);
    assert.equal(outcome.successfulImports, 2);
    assert.equal(outcome.failedImports, 1);
    assert.deepEqual(outcome.errors, ["invalid ISBN"]);
    assert.include(outcome.summary, "XMnote accepted 2");
    assert.include(outcome.summary, "1 failed");
  });

  it("reports an all-failed result without losing error messages", function () {
    const result = importResult(0, ["invalid request", "network rejected"]);
    const outcome = createExportOutcome({
      totalItems: 2,
      processedItems: 2,
      importResult: result,
      duration: 100,
    });

    assert.isFalse(outcome.success);
    assert.equal(outcome.successfulImports, 0);
    assert.equal(outcome.failedImports, 2);
    assert.deepEqual(outcome.errors, ["invalid request", "network rejected"]);
    assert.include(outcome.summary, "XMnote accepted 0");
    assert.include(outcome.summary, "2 failed");
    assert.strictEqual(outcome.details, result);
  });

  it("keeps dry runs side-effect-free in both result and summary", function () {
    const outcome = createExportOutcome({
      totalItems: 4,
      processedItems: 4,
      importResult: null,
      duration: 0,
      dryRun: true,
    });

    assert.isTrue(outcome.success);
    assert.equal(outcome.successfulImports, 0);
    assert.equal(outcome.failedImports, 0);
    assert.isNull(outcome.details);
    assert.include(outcome.summary, "dry run - no data was sent");
    assert.notInclude(outcome.summary, "accepted");
  });
});
