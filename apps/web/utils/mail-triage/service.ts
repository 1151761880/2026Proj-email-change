import { randomUUID } from "node:crypto";
import { createTriageFixtureMessages } from "./fixtures";
import {
  MAIL_TRIAGE_FAILURE_MESSAGE,
  MAIL_TRIAGE_TIMEOUT_MS,
  getArchiveBlockReason,
  triageMessagesSchema,
  validateTriageSuggestions,
  type TriageMessage,
  type TriageModelResult,
  type TriageState,
} from "./schema";

export type TriageSnapshot = { version: number; state: TriageState };
export type TriageStore = {
  read(accountId: string): Promise<TriageSnapshot>;
  save(
    accountId: string,
    expectedVersion: number,
    state: TriageState,
  ): Promise<boolean>;
};

/** Create independent synthetic mailbox state; no real provider messages or rules are touched. */
export function createInitialTriageState(
  messages = createTriageFixtureMessages(),
): TriageState {
  return {
    messages: triageMessagesSchema.parse(messages),
    suggestions: [],
    logs: [],
    analysisToken: null,
    analysisStartedAt: null,
    lastError: null,
  };
}

/** Invalidate old suggestions before analysis and discard responses that finish after timeout or reset. */
export async function analyzeMailbox(
  store: TriageStore,
  accountId: string,
  analyze: (
    messages: TriageMessage[],
    signal: AbortSignal,
  ) => Promise<TriageModelResult>,
) {
  const snapshot = await store.read(accountId);
  assertNotAnalyzing(snapshot.state);
  const token = randomUUID();
  const analyzingState: TriageState = {
    ...snapshot.state,
    suggestions: [],
    analysisToken: token,
    analysisStartedAt: Date.now(),
    lastError: null,
  };
  await saveOrThrow(store, accountId, snapshot.version, analyzingState);
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let nextState: TriageState;
  try {
    const deadline = new Promise<never>((_resolve, reject) => {
      timeout = setTimeout(() => {
        controller.abort();
        reject(new Error("分析服务超时（15 秒）"));
      }, MAIL_TRIAGE_TIMEOUT_MS);
    });
    const result = await Promise.race([
      analyze(analyzingState.messages, controller.signal),
      deadline,
    ]);
    nextState = {
      ...analyzingState,
      suggestions: validateTriageSuggestions(analyzingState.messages, result),
      analysisToken: null,
      analysisStartedAt: null,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "服务不可用";
    nextState = {
      ...analyzingState,
      analysisToken: null,
      analysisStartedAt: null,
      lastError: `${MAIL_TRIAGE_FAILURE_MESSAGE}。${reason}`,
    };
  } finally {
    clearTimeout(timeout);
  }
  const current = await store.read(accountId);
  if (current.state.analysisToken !== token) return current;
  await saveOrThrow(store, accountId, current.version, nextState);
  return store.read(accountId);
}

/** Atomically archive exactly the permitted selected IDs and append one successful log per ID. */
export async function archiveMailboxMessages(
  store: TriageStore,
  accountId: string,
  input: { version: number; messageIds: string[]; requestId: string },
) {
  const snapshot = await store.read(accountId);
  const selectedIds = new Set(input.messageIds);
  if (!selectedIds.size || selectedIds.size !== input.messageIds.length)
    throw new Error("请选择不同的邮件 ID");
  const existingLogs = snapshot.state.logs.filter(
    ({ requestId }) => requestId === input.requestId,
  );
  if (existingLogs.length) {
    if (
      existingLogs.length !== selectedIds.size ||
      existingLogs.some(({ messageId }) => !selectedIds.has(messageId))
    )
      throw new Error("相同请求不能使用不同的邮件 ID");
    return snapshot;
  }
  assertNotAnalyzing(snapshot.state);
  if (snapshot.version !== input.version)
    throw new Error("邮箱已变化，请刷新后重新确认");
  for (const id of selectedIds) {
    const message = snapshot.state.messages.find((item) => item.id === id);
    if (!message) throw new Error("所选邮件不存在");
    const suggestion = snapshot.state.suggestions.find(
      ({ messageId }) => messageId === id,
    );
    const blockReason = getArchiveBlockReason(message, suggestion);
    if (blockReason) throw new Error(`${id}：${blockReason}`);
  }
  const timestamp = new Date().toISOString();
  const nextState: TriageState = {
    ...snapshot.state,
    messages: snapshot.state.messages.map((message) =>
      selectedIds.has(message.id) ? { ...message, inbox: false } : message,
    ),
    logs: [
      ...snapshot.state.logs,
      ...input.messageIds.map((messageId) => ({
        requestId: input.requestId,
        messageId,
        action: "archive" as const,
        timestamp,
        result: "success" as const,
        reason: null,
      })),
    ],
  };
  const saved = await store.save(accountId, snapshot.version, nextState);
  if (!saved) {
    const current = await store.read(accountId);
    const repeated = current.state.logs.filter(
      ({ requestId }) => requestId === input.requestId,
    );
    if (
      repeated.length === selectedIds.size &&
      repeated.every(({ messageId }) => selectedIds.has(messageId))
    )
      return current;
    throw new Error("邮箱已变化，请刷新后重新确认");
  }
  return store.read(accountId);
}

/** Change a synthetic star and invalidate analysis so stale selections cannot be submitted. */
export async function changeMailboxStar(
  store: TriageStore,
  accountId: string,
  version: number,
  messageId: string,
  starred: boolean,
) {
  const snapshot = await store.read(accountId);
  assertNotAnalyzing(snapshot.state);
  if (!snapshot.state.messages.some(({ id }) => id === messageId))
    throw new Error("邮件不存在");
  await saveOrThrow(store, accountId, version, {
    ...snapshot.state,
    messages: snapshot.state.messages.map((message) =>
      message.id === messageId ? { ...message, starred } : message,
    ),
    suggestions: [],
    analysisToken: null,
    analysisStartedAt: null,
    lastError: null,
  });
  return store.read(accountId);
}

/** Replace only this synthetic mailbox, clearing its suggestions and logs for repeatable acceptance. */
export async function resetTriageMailbox(
  store: TriageStore,
  accountId: string,
  version: number,
  messages?: TriageMessage[],
) {
  await saveOrThrow(
    store,
    accountId,
    version,
    createInitialTriageState(messages),
  );
  return store.read(accountId);
}

/** Reject concurrent analysis while allowing recovery from a terminated request. */
function assertNotAnalyzing(state: TriageState) {
  if (
    state.analysisToken &&
    Date.now() - (state.analysisStartedAt ?? 0) < MAIL_TRIAGE_TIMEOUT_MS
  )
    throw new Error("正在分析，请稍后重试");
}

/** Apply an optimistic version guard to prevent concurrent operations from overwriting each other. */
async function saveOrThrow(
  store: TriageStore,
  accountId: string,
  version: number,
  state: TriageState,
) {
  if (!(await store.save(accountId, version, state)))
    throw new Error("邮箱已变化，请刷新后重新操作");
}
