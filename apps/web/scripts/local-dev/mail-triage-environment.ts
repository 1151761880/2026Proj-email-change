import { existsSync, readFileSync } from "node:fs";
import { parse } from "dotenv";

const MAIL_TRIAGE_ENVIRONMENT_KEYS = [
  "MAIL_TRIAGE_API_KEY",
  "MAIL_TRIAGE_BASE_URL",
  "MAIL_TRIAGE_MODEL",
] as const;

/** Load only the explicitly configured synthetic-mail analysis service, excluding all other credentials. */
export function readMailTriageEnvironment(
  path: string,
): Record<string, string> {
  if (!existsSync(path)) return {};
  const values = parse(readFileSync(path, "utf8"));
  return Object.fromEntries(
    MAIL_TRIAGE_ENVIRONMENT_KEYS.flatMap((key) =>
      values[key] ? [[key, values[key]]] : [],
    ),
  );
}
