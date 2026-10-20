import { z } from "zod";
import {
  MAIL_TRIAGE_MAX_MESSAGES,
  triageMessagesSchema,
} from "@/utils/mail-triage/schema";

export const analyzeMailTriageSchema = z.object({
  scenario: z.enum(["normal", "unavailable", "timeout"]).default("normal"),
});

export const archiveMailTriageSchema = z.object({
  version: z.number().int().nonnegative(),
  requestId: z.string().uuid(),
  messageIds: z.array(z.string().min(1)).min(1).max(MAIL_TRIAGE_MAX_MESSAGES),
});

export const resetMailTriageSchema = z.object({
  version: z.number().int().nonnegative(),
  messages: triageMessagesSchema.optional(),
});

export const starMailTriageSchema = z.object({
  version: z.number().int().nonnegative(),
  messageId: z.string().min(1),
  starred: z.boolean(),
});
