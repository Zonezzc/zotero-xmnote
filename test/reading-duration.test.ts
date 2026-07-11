import { assert } from "chai";

import { ReadingDurationEstimator } from "../src/modules/reading/duration-estimator";
import type { XMnoteEntry } from "../src/modules/xmnote/types";

function localTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): number {
  return Math.floor(
    new Date(year, month - 1, day, hour, minute).getTime() / 1000,
  );
}

describe("ReadingDurationEstimator", function () {
  it("aggregates estimated sessions by local day and keeps the last position", function () {
    const estimator = new ReadingDurationEstimator({
      maxSessionGap: 1800,
      minSessionDuration: 600,
      singleNoteEstimate: 600,
      readingSpeedFactor: 1,
    });
    const notes: XMnoteEntry[] = [
      { page: 10, time: localTimestamp(2025, 1, 2, 10, 0) },
      { page: 12, time: localTimestamp(2025, 1, 2, 10, 10) },
      { page: 20, time: localTimestamp(2025, 1, 2, 11, 0) },
    ];

    const result = estimator.estimateFromNotes(notes);

    assert.lengthOf(result.sessions, 2);
    assert.deepEqual(result.fuzzyReadingDurations, [
      {
        date: localTimestamp(2025, 1, 2, 0, 0),
        durationSeconds: 1200,
        position: 20,
      },
    ]);
    assert.strictEqual(result.totalReadingTime, 1200);
  });

  it("creates a positive fuzzy estimate for a single note", function () {
    const estimator = new ReadingDurationEstimator({ singleNoteEstimate: 600 });
    const result = estimator.estimateFromNotes([
      { page: 5, time: localTimestamp(2025, 1, 3, 14, 30) },
    ]);

    assert.deepEqual(result.fuzzyReadingDurations, [
      {
        date: localTimestamp(2025, 1, 3, 0, 0),
        durationSeconds: 600,
        position: 5,
      },
    ]);
  });

  it("never fabricates precise intervals and ignores future timestamps", function () {
    const estimator = new ReadingDurationEstimator();
    const futureTime = Math.floor(Date.now() / 1000) + 3600;
    const result = estimator.estimateFromNotes([{ page: 1, time: futureTime }]);

    assert.notProperty(result, "preciseReadingDurations");
    assert.isEmpty(result.fuzzyReadingDurations);
    assert.isEmpty(result.sessions);
  });
});
