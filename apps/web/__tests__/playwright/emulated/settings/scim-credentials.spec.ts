import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { expect } from "@playwright/test";
import { Client } from "pg";
import { test } from "../playwright-test";
import { capturePlaywrightCheckpoint } from "../playwright-evidence";

test("admin creates and revokes an expiring SCIM credential", async ({
  page,
  request,
}, testInfo) => {
  test.skip(
    process.env.PLAYWRIGHT_SCIM_TEST !== "true",
    "Run with PLAYWRIGHT_SCIM_TEST=true",
  );
  const providerId = `scim-test-${randomUUID()}`;
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    await db.query(
      'INSERT INTO "Organization" (id, name, slug, "createdAt", "updatedAt") VALUES ($1, $2, $1, NOW(), NOW())',
      [providerId, "SCIM test organization"],
    );
    await db.query(
      'INSERT INTO "ssoProvider" (id, issuer, "providerId", "organizationId", domain) VALUES ($1, $2, $1, $1, $3)',
      [providerId, "https://idp.example.com", "example.com"],
    );
    await page.goto("/admin");
    const section = page.getByRole("region", { name: "SCIM 用户管理" });
    await expect(section).toBeVisible();
    await capturePlaywrightCheckpoint(
      section,
      testInfo,
      "scim-credential-admin",
    );
    await section
      .getByLabel("单点登录服务 ID", { exact: true })
      .fill(providerId);
    await section.getByLabel("凭据到期时间").fill("2099-01-01T12:00");
    await section
      .getByRole("button", { name: "创建 SCIM 连接" })
      .click();
    const issued = section.getByLabel(
      "新 SCIM 凭据，请在离开前保存",
    );
    await expect(issued).toBeVisible();
    const value = await issued.inputValue();
    const token = value.split("\n")[0].replace("Bearer token: ", "");
    const connectionId = value.split("\n")[1].replace("Connection ID: ", "");
    const credentialId = value.split("\n")[2].replace("Credential ID: ", "");
    assert(token && connectionId && credentialId);
    const headers = { Authorization: `Bearer ${token}` };
    expect(
      (await request.get("/api/auth/scim/v2/Users", { headers })).status(),
    ).toBe(200);
    await section.getByLabel("待撤销的单点登录服务 ID").fill(providerId);
    await section
      .getByLabel("连接 ID", { exact: true })
      .fill(connectionId);
    await section
      .getByLabel("凭据 ID", { exact: true })
      .fill(credentialId);
    await section
      .getByRole("button", { name: "撤销 SCIM 凭据" })
      .click();
    await expect(
      page.getByText("SCIM 凭据已撤销", { exact: true }),
    ).toBeVisible();
    expect(
      (await request.get("/api/auth/scim/v2/Users", { headers })).status(),
    ).toBe(401);
    await section
      .getByRole("button", { name: "清除屏幕上的凭据" })
      .click();
    await expect(issued).toBeHidden();
  } finally {
    try {
      await db.query(
        'DELETE FROM "scimConnectionBinding" WHERE "provisioningDomainId" = $1',
        [providerId],
      );
      await db.query(
        'DELETE FROM "scimManagedConnection" WHERE "provisioningDomainId" = $1',
        [providerId],
      );
      await db.query('DELETE FROM "Organization" WHERE id = $1', [providerId]);
    } finally {
      await db.end();
    }
  }
});
