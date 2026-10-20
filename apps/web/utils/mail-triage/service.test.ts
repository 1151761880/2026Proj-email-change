import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createTriageFixtureMessages } from "./fixtures";
import type { TriageModelResult, TriageState } from "./schema";
import {
  analyzeMailbox,
  archiveMailboxMessages,
  createInitialTriageState,
  changeMailboxStar,
  type TriageStore,
} from "./service";

describe("human-confirmed mailbox triage", () => {
  it("T1 only archives the explicitly selected message IDs and preserves all messages", async () => {
    const store = createMemoryStore();
    const analyzed = await analyzeMailbox(store, "account", async (messages) =>
      predictions(messages),
    );
    expect(analyzed.state.messages.filter(({ inbox }) => inbox)).toHaveLength(
      12,
    );
    const archived = await archiveMailboxMessages(store, "account", {
      version: analyzed.version,
      messageIds: ["M02", "M03"],
      requestId: randomUUID(),
    });
    expect(
      archived.state.messages.filter(({ inbox }) => !inbox).map(({ id }) => id),
    ).toEqual(["M02", "M03"]);
    expect(archived.state.messages).toHaveLength(12);
    expect(archived.state.logs.map(({ messageId }) => messageId)).toEqual([
      "M02",
      "M03",
    ]);
    expect(archived.state.messages.find(({ id }) => id === "M04")?.inbox).toBe(
      true,
    );
  });

  it("T2 rejects protected IDs, then allows M04 only after unstar, reanalysis and confirmation", async () => {
    const store = createMemoryStore();
    let analyzed = await analyzeMailbox(store, "account", async (messages) =>
      predictions(messages),
    );
    await expect(
      archiveMailboxMessages(store, "account", {
        version: analyzed.version,
        messageIds: ["M03", "M04"],
        requestId: randomUUID(),
      }),
    ).rejects.toThrow("星标保护");
    expect((await store.read("account")).state.logs).toHaveLength(0);
    await expect(
      archiveMailboxMessages(store, "account", {
        version: analyzed.version,
        messageIds: ["M05"],
        requestId: randomUUID(),
      }),
    ).rejects.toThrow("待处理");
    await changeMailboxStar(store, "account", analyzed.version, "M04", false);
    analyzed = await analyzeMailbox(store, "account", async (messages) =>
      predictions(messages),
    );
    expect(analyzed.state.messages.every(({ inbox }) => inbox)).toBe(true);
    const archived = await archiveMailboxMessages(store, "account", {
      version: analyzed.version,
      messageIds: ["M04"],
      requestId: randomUUID(),
    });
    expect(archived.state.messages.find(({ id }) => id === "M04")?.inbox).toBe(
      false,
    );
  });

  it("T3 preserves inbox, stars and successful logs on failure and allows a retry", async () => {
    const store = createMemoryStore();
    await analyzeMailbox(store, "account", async (messages) =>
      predictions(messages),
    );
    const failed = await analyzeMailbox(store, "account", async () => {
      throw new Error("HTTP 503");
    });
    expect(failed.state.lastError).toContain("分析失败");
    expect(failed.state.messages.filter(({ inbox }) => inbox)).toHaveLength(12);
    expect(
      failed.state.messages
        .filter(({ starred }) => starred)
        .map(({ id }) => id),
    ).toEqual(["M04"]);
    expect(failed.state.logs).toHaveLength(0);
    expect(failed.state.suggestions).toHaveLength(0);
    const retry = await analyzeMailbox(store, "account", async (messages) =>
      predictions(messages),
    );
    expect(retry.state.lastError).toBeNull();
    expect(retry.state.suggestions).toHaveLength(12);
  });

  it("bounds a hung analysis and prevents its late response from restoring stale suggestions", async () => {
    vi.useFakeTimers();
    try {
      const store = createMemoryStore();
      let finish!: (result: TriageModelResult) => void;
      const pending = analyzeMailbox(
        store,
        "account",
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      );
      await vi.advanceTimersByTimeAsync(15_001);
      const failed = await pending;
      expect(failed.state.lastError).toContain("超时");
      finish(predictions(createTriageFixtureMessages()));
      await vi.advanceTimersByTimeAsync(1);
      expect((await store.read("account")).state.suggestions).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("rejects stale selections and makes repeated archive confirmation idempotent", async () => {
    const store = createMemoryStore();
    const analyzed = await analyzeMailbox(store, "account", async (messages) =>
      predictions(messages),
    );
    const input = {
      version: analyzed.version,
      messageIds: ["M02"],
      requestId: randomUUID(),
    };
    await archiveMailboxMessages(store, "account", input);
    const repeated = await archiveMailboxMessages(store, "account", input);
    expect(repeated.state.logs).toHaveLength(1);
    await expect(
      archiveMailboxMessages(store, "account", {
        ...input,
        requestId: randomUUID(),
      }),
    ).rejects.toThrow("已变化");
    await expect(
      archiveMailboxMessages(store, "account", {
        ...input,
        messageIds: ["M03"],
      }),
    ).rejects.toThrow("不同");
  });
});

/** Keep independent task-sheet truth in the test, outside the classifier and fixture messages. */
function predictions(
  messages: ReturnType<typeof createTriageFixtureMessages>,
): TriageModelResult {
  const required = new Set(["M01", "M05", "M07", "M10"]);
  const marketing = new Set(["M03", "M04", "M09", "M12"]);
  return {
    suggestions: messages.map((message) => ({
      messageId: message.id,
      category: required.has(message.id)
        ? "action_required"
        : marketing.has(message.id)
          ? "marketing"
          : "information",
      evidence: [{ field: "body", quote: message.body }],
      explanation: "独立预设的测试预测",
    })),
  };
}

/** Provide atomic versioned storage for service-level behavior tests. */
function createMemoryStore(): TriageStore {
  let version = 0;
  let state: TriageState = createInitialTriageState();
  return {
    async read() {
      return { version, state: structuredClone(state) };
    },
    async save(_accountId, expectedVersion, nextState) {
      if (version !== expectedVersion) return false;
      version += 1;
      state = structuredClone(nextState);
      return true;
    },
  };
}
