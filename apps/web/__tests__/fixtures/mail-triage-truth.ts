import type { z } from "zod";
import type { triageCategorySchema } from "@/utils/mail-triage/schema";

// Task-sheet ground truth stays outside production data and model prompts.
export const MAIL_TRIAGE_TRUTH: Record<
  string,
  z.infer<typeof triageCategorySchema>
> = {
  M01: "action_required",
  M02: "information",
  M03: "marketing",
  M04: "marketing",
  M05: "action_required",
  M06: "information",
  M07: "action_required",
  M08: "information",
  M09: "marketing",
  M10: "action_required",
  M11: "information",
  M12: "marketing",
};
