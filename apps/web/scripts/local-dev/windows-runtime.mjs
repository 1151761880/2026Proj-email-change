import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  createWriteStream,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const ROOT_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const RUNTIME_DIR = join(ROOT_DIR, ".context/native");
const REDIS_SHA256 =
  "7c8cebd50347eaa1d9e784da842ed47a4f33394637835531d6614777b950ee85";

/** Prepare portable development services inside this checkout without registering Windows services. */
async function main() {
  if (process.platform !== "win32")
    throw new Error("This helper is for Windows only.");
  if (Number(process.versions.node.split(".")[0]) !== 24)
    throw new Error("Run the initial setup with Node.js 24.");
  mkdirSync(RUNTIME_DIR, { recursive: true });
  const nodeDir = join(RUNTIME_DIR, "node");
  mkdirSync(nodeDir, { recursive: true });
  const localNode = join(nodeDir, "node.exe");
  if (!existsSync(localNode)) copyFileSync(process.execPath, localNode);
  await Promise.all([
    prepareArchive(
      "PostgreSQL",
      "https://get.enterprisedb.com/postgresql/postgresql-16.15-1-windows-x64-binaries.zip",
      join(RUNTIME_DIR, "postgresql"),
      "pgsql/bin/postgres.exe",
    ),
    prepareArchive(
      "Redis",
      "https://github.com/redis-windows/redis-windows/releases/download/8.10.2/Redis-8.10.2-Windows-x64-msys2.zip",
      join(RUNTIME_DIR, "redis"),
      "Redis-8.10.2-Windows-x64-msys2/redis-server.exe",
      REDIS_SHA256,
    ),
  ]);
  console.log("[native] Portable services ready. Use Start-ProjectEmail.cmd.");
}

/** Download and extract a pinned public runtime archive, reusing an existing installation. */
async function prepareArchive(
  name,
  url,
  destination,
  executable,
  expectedDigest,
) {
  if (existsSync(join(destination, executable))) return;
  mkdirSync(destination, { recursive: true });
  const archive = join(RUNTIME_DIR, `${name.toLowerCase()}.zip`);
  if (!existsSync(archive)) {
    console.log(`[native] Downloading ${name}`);
    const response = await fetch(url, { signal: AbortSignal.timeout(180_000) });
    if (!response.ok || !response.body)
      throw new Error(`${name} download failed: HTTP ${response.status}`);
    await pipeline(Readable.fromWeb(response.body), createWriteStream(archive));
  }
  if (
    expectedDigest &&
    createHash("sha256").update(readFileSync(archive)).digest("hex") !==
      expectedDigest
  )
    throw new Error(`${name} archive checksum mismatch`);
  execFileSync("tar.exe", ["-xf", archive, "-C", destination], {
    windowsHide: true,
    timeout: 120_000,
    stdio: "inherit",
  });
  if (!existsSync(join(destination, executable)))
    throw new Error(`${name} archive did not contain ${executable}`);
  console.log(`[native] ${name} ready`);
}

main().catch((error) => {
  console.error(`[native] ${error.message}`);
  process.exitCode = 1;
});
