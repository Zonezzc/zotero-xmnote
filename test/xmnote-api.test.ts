import { assert } from "chai";
import type { NetworkClient, NetworkResponse } from "../src/utils/network";
import { XMnoteApiClientImpl } from "../src/modules/xmnote/api";
import type {
  XMnoteApiResponse,
  XMnoteNote,
} from "../src/modules/xmnote/types";
import { buildXMnoteApiUrl } from "../src/modules/xmnote/url";

const testGlobal = globalThis as typeof globalThis & {
  ztoolkit?: { log: (...args: unknown[]) => void };
};
testGlobal.ztoolkit ??= { log: () => undefined };

type XMnoteTransport = Pick<NetworkClient, "options" | "post">;

function createTransport(response: XMnoteApiResponse): {
  transport: XMnoteTransport;
  calls: { options: number; post: number };
} {
  const calls = { options: 0, post: 0 };
  return {
    calls,
    transport: {
      async options(): Promise<NetworkResponse<unknown>> {
        calls.options += 1;
        return { status: 405, data: null, headers: {} };
      },
      async post<T>(): Promise<NetworkResponse<T>> {
        calls.post += 1;
        return {
          status: 200,
          data: response as T,
          headers: {},
        };
      },
    },
  };
}

const validNote: XMnoteNote = {
  title: "API contract test",
  type: 1,
  locationUnit: 1,
};

describe("XMnote API contract", function () {
  describe("URL normalization", function () {
    it("keeps legacy host and port configuration working", function () {
      assert.equal(
        buildXMnoteApiUrl("xmnote.local", 8080),
        "http://xmnote.local:8080/send",
      );
      assert.equal(buildXMnoteApiUrl("::1", 8080), "http://[::1]:8080/send");
    });

    it("accepts complete HTTP(S) endpoints and ignores the legacy port", function () {
      assert.equal(
        buildXMnoteApiUrl("https://xmnote.example", 1),
        "https://xmnote.example/send",
      );
      assert.equal(
        buildXMnoteApiUrl("http://[::1]:8080/send/", 9999),
        "http://[::1]:8080/send",
      );
    });
  });

  it("uses only OPTIONS for a connection probe", async function () {
    const stub = createTransport({ code: 200 });
    const client = new XMnoteApiClientImpl(
      { ip: "xmnote.local", port: 8080 },
      stub.transport,
      0,
    );

    assert.isTrue(await client.testConnection());
    assert.equal(stub.calls.options, 1);
    assert.equal(stub.calls.post, 0);
  });

  it("does not send invalid notes", async function () {
    const stub = createTransport({ code: 200 });
    const client = new XMnoteApiClientImpl(
      { ip: "xmnote.local", port: 8080 },
      stub.transport,
      0,
    );

    const result = await client.importNote({
      ...validNote,
      currentPage: 10,
    });

    assert.isFalse(result.success);
    assert.equal(stub.calls.post, 0);
  });

  it("validates current API constraints for covers and durations", function () {
    const client = new XMnoteApiClientImpl(
      { ip: "xmnote.local", port: 8080 },
      createTransport({ code: 200 }).transport,
      0,
    );
    const validation = client.validateNote({
      ...validNote,
      cover: "YWJjZA==",
      readingStatus: 5,
      preciseReadingDurations: [
        { startTime: 1_700_000_001, endTime: 1_700_000_000 },
      ],
      fuzzyReadingDurations: [
        { date: Date.now() + 60_000, durationSeconds: 0 },
      ],
    });

    assert.isFalse(validation.isValid);
    assert.isTrue(
      validation.errors.some((error) => error.includes("coverBase64")),
    );
    assert.isTrue(
      validation.errors.some((error) => error.includes("must end after")),
    );
    assert.isTrue(
      validation.errors.some((error) => error.includes("date cannot")),
    );
    assert.isTrue(
      validation.errors.some((error) => error.includes("greater than 0")),
    );
  });

  it("treats body code 200 as accepted pending confirmation", async function () {
    const stub = createTransport({ code: 200, message: "received" });
    const client = new XMnoteApiClientImpl(
      { ip: "xmnote.local", port: 8080 },
      stub.transport,
      0,
    );

    const result = await client.importNote(validNote);

    assert.isTrue(result.success);
    assert.include(result.message, "pending confirmation");
    assert.notInclude(result.message, "imported successfully");
  });

  it("treats a non-200 body code as failure", async function () {
    const stub = createTransport({ code: 500, message: "invalid payload" });
    const client = new XMnoteApiClientImpl(
      { ip: "xmnote.local", port: 8080 },
      stub.transport,
      0,
    );

    const result = await client.importNote(validNote);

    assert.isFalse(result.success);
    assert.equal(result.statusCode, 500);
    assert.equal(result.message, "invalid payload");
  });
});
