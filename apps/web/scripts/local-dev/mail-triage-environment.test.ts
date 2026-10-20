import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { readMailTriageEnvironment } from "./mail-triage-environment";

it("loads only the triage service and never imports unrelated production credentials", () => {
  const directory = mkdtempSync(join(tmpdir(), "triage-env-"));
  try {
    const path = join(directory, ".env.local");
    writeFileSync(
      path,
      "MAIL_TRIAGE_API_KEY=triage-test-key\nMAIL_TRIAGE_MODEL=test-model\nDATABASE_URL=production-db\nOPENAI_API_KEY=unrelated-secret\n",
      "utf8",
    );
    expect(readMailTriageEnvironment(path)).toEqual({
      MAIL_TRIAGE_API_KEY: "triage-test-key",
      MAIL_TRIAGE_MODEL: "test-model",
    });
    expect(readMailTriageEnvironment(join(directory, "absent"))).toEqual({});
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
