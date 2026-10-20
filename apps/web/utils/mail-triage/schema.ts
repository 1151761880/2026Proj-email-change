import { z } from "zod";

export const MAIL_TRIAGE_TIMEOUT_MS = 15_000;
export const MAIL_TRIAGE_MAX_MESSAGES = 50;
export const MAIL_TRIAGE_FAILURE_MESSAGE = "分析失败，邮件未被修改，请重试";

export const triageCategorySchema = z.enum([
  "action_required",
  "information",
  "marketing",
  "manual_review",
]);

export const triageMessageSchema = z.object({
  id: z.string().min(1),
  from: z.string().email(),
  subject: z.string().min(1).max(1000),
  body: z.string().min(1).max(30_000),
  starred: z.boolean(),
  inbox: z.boolean(),
});

export const triageMessagesSchema = z
  .array(triageMessageSchema)
  .min(1)
  .max(MAIL_TRIAGE_MAX_MESSAGES)
  .refine(
    (messages) =>
      new Set(messages.map((message) => message.id)).size === messages.length,
    {
      message: "邮件 ID 必须唯一",
    },
  );

export const triageModelResultSchema = z.object({
  suggestions: z.array(
    z.object({
      messageId: z.string(),
      category: triageCategorySchema,
      evidence: z
        .array(
          z.object({
            field: z.enum(["subject", "body"]),
            quote: z.string().min(1),
          }),
        )
        .min(1),
      explanation: z.string().min(1),
    }),
  ),
});

export const triageSuggestionSchema =
  triageModelResultSchema.shape.suggestions.element.extend({
    evidence: z.array(
      triageModelResultSchema.shape.suggestions.element.shape.evidence.element,
    ),
    sourceSubject: z.string(),
    sourceBody: z.string(),
    evidenceValid: z.boolean(),
  });

export const triageLogSchema = z.object({
  requestId: z.string(),
  messageId: z.string(),
  action: z.literal("archive"),
  timestamp: z.string(),
  result: z.enum(["success", "failure"]),
  reason: z.string().nullable(),
});

export const triageStateSchema = z.object({
  messages: triageMessagesSchema,
  suggestions: z.array(triageSuggestionSchema),
  logs: z.array(triageLogSchema),
  analysisToken: z.string().nullable(),
  analysisStartedAt: z.number().nullable(),
  lastError: z.string().nullable(),
});

export type TriageMessage = z.infer<typeof triageMessageSchema>;
export type TriageSuggestion = z.infer<typeof triageSuggestionSchema>;
export type TriageModelResult = z.infer<typeof triageModelResultSchema>;
export type TriageState = z.infer<typeof triageStateSchema>;

/** Return the reason an individual message cannot be offered for archiving. */
export function getArchiveBlockReason(
  message: TriageMessage,
  suggestion?: TriageSuggestion,
): string | null {
  if (!message.inbox) return "已归档";
  if (message.starred) return "星标保护";
  if (!suggestion) return "请先生成整理建议";
  if (
    suggestion.sourceSubject !== message.subject ||
    suggestion.sourceBody !== message.body
  )
    return "邮件已变化，请重新分析";
  if (
    !suggestion.evidenceValid ||
    !suggestion.evidence.length ||
    suggestion.evidence.some(
      ({ field, quote }) => !quote.trim() || !message[field].includes(quote),
    )
  )
    return "依据无效，需人工核查";
  if (suggestion.category === "action_required") return "待处理，保留在收件箱";
  if (suggestion.category === "manual_review") return "需人工核查";
  return null;
}

/** Validate literal quotations and turn missing, duplicated or unsupported decisions into manual review. */
export function validateTriageSuggestions(
  messages: TriageMessage[],
  result: TriageModelResult,
): TriageSuggestion[] {
  const messageIds = new Set(messages.map((message) => message.id));
  if (
    result.suggestions.some(
      (suggestion) => !messageIds.has(suggestion.messageId),
    )
  ) {
    throw new Error("分析结果包含未知邮件 ID");
  }
  return messages.map((message) => {
    const matches = result.suggestions.filter(
      (suggestion) => suggestion.messageId === message.id,
    );
    const suggestion = matches[0];
    const evidenceValid =
      matches.length === 1 &&
      Boolean(suggestion?.evidence.length) &&
      suggestion.evidence.every(
        ({ field, quote }) =>
          quote.trim().length > 0 && message[field].includes(quote),
      );
    return {
      messageId: message.id,
      category: evidenceValid ? suggestion.category : "manual_review",
      evidence: evidenceValid ? suggestion.evidence : [],
      explanation: evidenceValid
        ? suggestion.explanation
        : "结果缺失、重复或引用无法定位到邮件原文，请人工核查。",
      sourceSubject: message.subject,
      sourceBody: message.body,
      evidenceValid,
    };
  });
}
