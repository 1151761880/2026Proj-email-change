import prisma from "@/utils/prisma";
import { createInitialTriageState, type TriageStore } from "./service";
import { triageStateSchema } from "./schema";

export const triageStore: TriageStore = {
  /** Load or initialize the account-scoped synthetic mailbox from persistent storage. */
  async read(accountId) {
    const mailbox = await prisma.mailTriageMailbox.upsert({
      where: { emailAccountId: accountId },
      create: { emailAccountId: accountId, state: createInitialTriageState() },
      update: {},
    });
    return {
      version: mailbox.version,
      state: triageStateSchema.parse(mailbox.state),
    };
  },
  /** Persist mailbox changes and logs together only when the version still matches. */
  async save(accountId, expectedVersion, state) {
    const result = await prisma.mailTriageMailbox.updateMany({
      where: { emailAccountId: accountId, version: expectedVersion },
      data: { state, version: { increment: 1 } },
    });
    return result.count === 1;
  },
};
