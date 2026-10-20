import { expect } from "@playwright/test";
import { test } from "../playwright-test";
import {
  cleanUpMeetingBotFixture,
  type MeetingBotFixture,
  openMeetings,
  prepareMeetingBotFixture,
} from "./meeting-bot-test-helpers";

let fixture: MeetingBotFixture | undefined;

test.beforeEach(async ({ page }) => {
  fixture = undefined;
  fixture = await prepareMeetingBotFixture(page);
});

test.afterEach(async () => {
  if (fixture) await cleanUpMeetingBotFixture(fixture);
});

test("enables the notetaker and persists meeting choices, notes, and settings", async ({
  page,
}) => {
  if (!fixture) throw new Error("The Meeting Bot fixture was not prepared");
  await openMeetings(page, fixture);

  await expect(
    page.getByRole("heading", { name: "自动记录会议笔记" }),
  ).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "开始使用" }).click();
  await expect(
    page.getByRole("heading", { name: "需要参加哪些会议？" }),
  ).toBeVisible();
  await page
    .getByRole("group", { name: "参加的会议范围" })
    .getByText("仅我手动启用的会议", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "开始记录我的会议" })
    .click();

  await expect(
    page.getByRole("heading", { name: "会议", exact: true }),
  ).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("heading", { name: "即将开始" })).toBeVisible();

  const upcomingToggle = page.getByRole("switch", {
    name: "Record Product planning with notetaker",
  });
  await expect(upcomingToggle).toBeVisible({ timeout: 60_000 });
  await expect(upcomingToggle).not.toBeChecked();
  await upcomingToggle.click();
  await expect(upcomingToggle).toBeChecked();

  await page.getByRole("button", { name: "Recorded product review" }).click();
  const meetingDialog = page.getByRole("dialog", {
    name: "Recorded product review",
  });
  await expect(meetingDialog).toContainText(
    "The team finalized the launch plan for onboarding improvements.",
  );
  await expect(meetingDialog).toContainText(
    "Release the onboarding improvements on Friday.",
  );
  await expect(meetingDialog).toContainText(
    "Prepare the customer announcement.",
  );
  await expect(meetingDialog).toContainText(
    "We will ship the onboarding improvements on Friday.",
  );
  await expect(meetingDialog).toContainText("跟进草稿已准备好");
  await meetingDialog.getByRole("button", { name: "关闭" }).click();

  await page.getByRole("button", { name: "设置" }).click();
  const settingsDialog = page.getByRole("dialog", {
    name: "会议记录设置",
  });
  const recapToggle = settingsDialog.getByRole("switch", {
    name: "通过邮件发送笔记",
  });
  await expect(recapToggle).toBeChecked();
  await recapToggle.click();
  await expect(page.getByText("设置已保存", { exact: true })).toBeVisible();
  await settingsDialog.getByRole("button", { name: "关闭" }).click();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "会议", exact: true }),
  ).toBeVisible({ timeout: 60_000 });
  await expect(
    page.getByRole("switch", {
      name: "Record Product planning with notetaker",
    }),
  ).toBeChecked({ timeout: 60_000 });

  await page.getByRole("button", { name: "设置" }).click();
  const persistedSettingsDialog = page.getByRole("dialog", {
    name: "会议记录设置",
  });
  await expect(
    persistedSettingsDialog.getByRole("radio", {
      name: "仅我手动启用的会议",
    }),
  ).toBeChecked();
  await expect(
    persistedSettingsDialog.getByRole("switch", {
      name: "通过邮件发送笔记",
    }),
  ).not.toBeChecked();
});
