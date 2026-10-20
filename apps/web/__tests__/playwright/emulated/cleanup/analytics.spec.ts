import { expect } from "@playwright/test";
import { test } from "../playwright-test";
import {
  cleanUpFixture,
  type CleanupFixture,
  openCleanupFeature,
  prepareCleanupFixture,
} from "./cleanup-test-helpers";

let fixture: CleanupFixture | undefined;

test.beforeEach(async ({ page }) => {
  fixture = undefined;
  fixture = await prepareCleanupFixture(page);
});

test.afterEach(async () => {
  if (fixture) await cleanUpFixture(fixture);
});

test("shows seeded traffic and updates the reporting granularity", async ({
  page,
}) => {
  if (!fixture) throw new Error("Cleanup fixture was not initialized");
  await openCleanupFeature(page, fixture, "stats");
  await expect(page.getByRole("heading", { name: "统计分析" })).toBeVisible();
  const onboardingDialog = page.getByRole("dialog", {
    name: "邮件统计",
  });
  await expect(onboardingDialog).toBeVisible();
  await onboardingDialog.getByRole("button", { name: "开始使用" }).click();

  await expect(
    page.getByText("analytics-sender@example.com", { exact: true }).first(),
  ).toBeVisible({ timeout: 60_000 });

  await expect(
    page.getByText("analytics-recipient@example.com", { exact: true }).first(),
  ).toBeVisible({ timeout: 60_000 });

  await page.getByRole("button", { name: "Group by week" }).click();
  await page.getByRole("menuitemcheckbox", { name: "天" }).click();
  await expect(
    page.getByRole("button", { name: "Group by day" }),
  ).toBeVisible();

  await page.getByRole("button", { name: /最近一个月/ }).click();
  await page.getByText("最近一周", { exact: true }).click();
  await expect(page.getByRole("button", { name: /最近一周/ })).toBeVisible();
  await expect(
    page.getByText("analytics-sender@example.com", { exact: true }).first(),
  ).toBeVisible({ timeout: 60_000 });
});
