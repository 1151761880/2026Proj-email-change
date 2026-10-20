"use server";

import { actionClient } from "@/utils/actions/safe-action";
import { SafeError } from "@/utils/error";
import { analyzeTriageMessages } from "@/utils/mail-triage/analyze";
import {
  analyzeMailbox,
  archiveMailboxMessages,
  changeMailboxStar,
  resetTriageMailbox,
} from "@/utils/mail-triage/service";
import { triageStore } from "@/utils/mail-triage/store";
import {
  analyzeMailTriageSchema,
  archiveMailTriageSchema,
  resetMailTriageSchema,
  starMailTriageSchema,
} from "./mail-triage.validation";

export const analyzeMailTriageAction = actionClient
  .metadata({ name: "analyzeMailTriage" })
  .inputSchema(analyzeMailTriageSchema)
  .action(async ({ ctx: { emailAccountId }, parsedInput: { scenario } }) => {
    try {
      return await analyzeMailbox(
        triageStore,
        emailAccountId,
        async (messages, signal) => {
          if (scenario === "unavailable")
            throw new Error("模拟分析接口 HTTP 503");
          if (scenario === "timeout") {
            return new Promise<never>((_resolve, reject) => {
              signal.addEventListener(
                "abort",
                () => reject(new Error("分析服务超时（15 秒）")),
                { once: true },
              );
            });
          }
          return analyzeTriageMessages(messages, signal);
        },
      );
    } catch (error) {
      throw new SafeError(
        error instanceof Error ? error.message : "分析失败，请重试",
      );
    }
  });

export const archiveMailTriageAction = actionClient
  .metadata({ name: "archiveMailTriage" })
  .inputSchema(archiveMailTriageSchema)
  .action(async ({ ctx: { emailAccountId }, parsedInput }) => {
    try {
      return await archiveMailboxMessages(
        triageStore,
        emailAccountId,
        parsedInput,
      );
    } catch (error) {
      throw new SafeError(
        error instanceof Error ? error.message : "归档失败，邮件未被修改",
      );
    }
  });

export const resetMailTriageAction = actionClient
  .metadata({ name: "resetMailTriage" })
  .inputSchema(resetMailTriageSchema)
  .action(
    async ({ ctx: { emailAccountId }, parsedInput: { version, messages } }) => {
      try {
        return await resetTriageMailbox(
          triageStore,
          emailAccountId,
          version,
          messages,
        );
      } catch (error) {
        throw new SafeError(
          error instanceof Error ? error.message : "重置失败，请重试",
        );
      }
    },
  );

export const starMailTriageAction = actionClient
  .metadata({ name: "starMailTriage" })
  .inputSchema(starMailTriageSchema)
  .action(
    async ({
      ctx: { emailAccountId },
      parsedInput: { version, messageId, starred },
    }) => {
      try {
        return await changeMailboxStar(
          triageStore,
          emailAccountId,
          version,
          messageId,
          starred,
        );
      } catch (error) {
        throw new SafeError(
          error instanceof Error ? error.message : "星标修改失败，请重试",
        );
      }
    },
  );
