CREATE TABLE "MailTriageMailbox" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailAccountId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "state" JSONB NOT NULL,
    CONSTRAINT "MailTriageMailbox_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MailTriageMailbox_emailAccountId_key" ON "MailTriageMailbox"("emailAccountId");
ALTER TABLE "MailTriageMailbox" ADD CONSTRAINT "MailTriageMailbox_emailAccountId_fkey" FOREIGN KEY ("emailAccountId") REFERENCES "EmailAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
