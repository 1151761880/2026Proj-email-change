import { expect } from "@playwright/test";
import { test } from "../playwright-test";
import {
  getIntegrationRow,
  getIntegrationToolCard,
  openIntegrations,
  resetIntegrationTestState,
  setupIntegrationTestState,
} from "./integration-test-helpers";

test.beforeEach(async () => {
  await setupIntegrationTestState();
});

test.afterEach(async () => {
  await resetIntegrationTestState();
});

test("persists which read tools are enabled", async ({ page }) => {
  test.setTimeout(360_000);
  await openIntegrations(page);

  const notionRow = getIntegrationRow(page, "Notion");
  await expect(notionRow.getByText("已连接", { exact: false })).toBeVisible({
    timeout: 60_000,
  });
  await notionRow.getByRole("button", { name: "集成操作" }).click();
  await page
    .getByRole("menuitem", { name: "Manage tools (1 of 2 on)" })
    .click();

  const fetchToolCard = getIntegrationToolCard(page, "notion-fetch");
  const fetchToolSwitch = fetchToolCard.getByRole("switch");
  await expect(fetchToolSwitch).toBeChecked();
  await fetchToolSwitch.click();
  await expect(page.getByText("工具已更新", { exact: true })).toBeVisible({
    timeout: 120_000,
  });

  await openIntegrations(page);
  await expect(notionRow.getByText("已连接", { exact: false })).toBeVisible({
    timeout: 60_000,
  });
  await notionRow.getByRole("button", { name: "集成操作" }).click();
  await expect(
    page.getByRole("menuitem", { name: "Manage tools (0 of 2 on)" }),
  ).toBeVisible();
});

test("persists pause state and disconnects the integration", async ({
  page,
}) => {
  test.setTimeout(360_000);
  await openIntegrations(page);

  const notionRow = getIntegrationRow(page, "Notion");
  await expect(notionRow.getByText("已连接", { exact: false })).toBeVisible({
    timeout: 60_000,
  });
  await notionRow.getByRole("button", { name: "集成操作" }).click();
  await page.getByRole("menuitem", { name: "暂停" }).click();
  await expect(page.getByText("Notion paused", { exact: true })).toBeVisible({
    timeout: 120_000,
  });

  await openIntegrations(page);
  await expect(notionRow.getByText("已暂停", { exact: true })).toBeVisible({
    timeout: 60_000,
  });
  await notionRow.getByRole("button", { name: "集成操作" }).click();
  await expect(page.getByRole("menuitem", { name: "继续" })).toBeVisible();
  await page.keyboard.press("Escape");

  page.once("dialog", (dialog) => dialog.accept());
  await notionRow.getByRole("button", { name: "集成操作" }).click();
  await page.getByRole("menuitem", { name: "断开连接" }).click();
  await expect(
    page.getByText("Disconnected successfully", { exact: true }),
  ).toBeVisible({ timeout: 120_000 });

  await openIntegrations(page);
  await expect(
    notionRow.getByRole("button", { name: "连接", exact: true }),
  ).toBeVisible({ timeout: 60_000 });
});
