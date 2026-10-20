import { describe, expect, it } from "vitest";
import { createTriageFixtureMessages } from "./fixtures";
import {
  getArchiveBlockReason,
  validateTriageSuggestions,
  type TriageModelResult,
} from "./schema";

describe("mail triage candidate protection", () => {
  it("blocks starred marketing without blocking its unstarred same-sender message", () => {
    const messages = createTriageFixtureMessages().filter(({ id }) =>
      ["M03", "M04"].includes(id),
    );
    const suggestions = validateTriageSuggestions(
      messages,
      makeResults(messages, "marketing"),
    );
    expect(getArchiveBlockReason(messages[0], suggestions[0])).toBeNull();
    expect(getArchiveBlockReason(messages[1], suggestions[1])).toBe("星标保护");
    expect(
      getArchiveBlockReason({ ...messages[1], starred: false }, suggestions[1]),
    ).toBeNull();
  });

  it("fails closed for invented quotes, missing results and duplicate results", () => {
    const messages = createTriageFixtureMessages().slice(0, 3);
    const result = makeResults(messages, "information");
    result.suggestions[0].evidence[0].quote = "这是虚构的引用";
    result.suggestions = [
      result.suggestions[0],
      result.suggestions[1],
      result.suggestions[1],
    ];
    const suggestions = validateTriageSuggestions(messages, result);
    expect(
      suggestions.every(({ category }) => category === "manual_review"),
    ).toBe(true);
    expect(
      messages.every(
        (message, index) =>
          getArchiveBlockReason(message, suggestions[index]) !== null,
      ),
    ).toBe(true);
  });

  it("protects action-required messages and invalidates changed message content", () => {
    const messages = createTriageFixtureMessages().slice(0, 1);
    const suggestions = validateTriageSuggestions(
      messages,
      makeResults(messages, "action_required"),
    );
    expect(getArchiveBlockReason(messages[0], suggestions[0])).toContain(
      "待处理",
    );
    expect(
      getArchiveBlockReason(
        { ...messages[0], body: "正文更新" },
        suggestions[0],
      ),
    ).toContain("重新分析");
  });
});

/** Produce schema-valid scripted predictions without using the runtime classifier. */
function makeResults(
  messages: ReturnType<typeof createTriageFixtureMessages>,
  category: "marketing" | "information" | "action_required",
): TriageModelResult {
  return {
    suggestions: messages.map((message) => ({
      messageId: message.id,
      category,
      evidence: [{ field: "body", quote: message.body }],
      explanation: "测试依据",
    })),
  };
}
