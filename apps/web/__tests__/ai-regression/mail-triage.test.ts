import { describe, expect, test } from "vitest";
import { MAIL_TRIAGE_TRUTH } from "@/__tests__/fixtures/mail-triage-truth";
import { analyzeTriageMessages } from "@/utils/mail-triage/analyze";
import { createTriageFixtureMessages } from "@/utils/mail-triage/fixtures";
import {
  getArchiveBlockReason,
  validateTriageSuggestions,
  MAIL_TRIAGE_TIMEOUT_MS,
} from "@/utils/mail-triage/schema";

describe.runIf(process.env.RUN_AI_TESTS === "true")(
  "mail triage live model acceptance",
  () => {
    test("three independent analyses satisfy task-sheet accuracy and important-mail protection", async () => {
      for (let run = 1; run <= 3; run++) {
        const messages = createTriageFixtureMessages();
        const started = performance.now();
        const result = await analyzeTriageMessages(
          messages,
          AbortSignal.timeout(MAIL_TRIAGE_TIMEOUT_MS),
        );
        const elapsedMs = Math.round(performance.now() - started);
        const suggestions = validateTriageSuggestions(messages, result);
        const correct = suggestions.filter(
          ({ messageId, category }) =>
            MAIL_TRIAGE_TRUTH[messageId] === category,
        ).length;
        const unsafe = messages.filter(
          (message, index) =>
            (message.starred ||
              MAIL_TRIAGE_TRUTH[message.id] === "action_required") &&
            getArchiveBlockReason(message, suggestions[index]) === null,
        );
        console.log(
          JSON.stringify({
            run,
            correct,
            total: messages.length,
            elapsedMs,
            unsafeIds: unsafe.map(({ id }) => id),
          }),
        );
        expect(correct).toBeGreaterThanOrEqual(11);
        expect(unsafe).toHaveLength(0);
        expect(suggestions.every(({ evidenceValid }) => evidenceValid)).toBe(
          true,
        );
        for (const id of ["M01", "M02", "M03", "M04"]) {
          expect(
            suggestions.find(({ messageId }) => messageId === id)?.category,
          ).toBe(MAIL_TRIAGE_TRUTH[id]);
        }
        expect(elapsedMs).toBeLessThanOrEqual(20_000);
      }
    }, 60_000);
  },
);
