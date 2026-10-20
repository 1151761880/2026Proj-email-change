import { expect } from "@playwright/test";
import { getEmailAccountId } from "../account-test-helpers";
import { capturePlaywrightCheckpoint } from "../playwright-evidence";
import { test } from "../playwright-test";

test("inspects an account's engine queue", async ({ page }, testInfo) => {
  const emailAccountId = await getEmailAccountId(page);
  await page.goto(`/${emailAccountId}/debug`);
  await page.getByRole("link", { name: "邮件队列", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "邮件队列", exact: true }),
  ).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText("此状态暂无操作。")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "待处理操作", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "连接" })).toBeVisible();
  await capturePlaywrightCheckpoint(page, testInfo, "mail-queue-empty");
});
