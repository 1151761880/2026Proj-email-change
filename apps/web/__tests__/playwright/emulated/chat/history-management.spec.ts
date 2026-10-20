import { expect } from "@playwright/test";
import { test } from "../playwright-test";
import { getEmailAccountId } from "../account-test-helpers";
import { cleanupSeededChat, getChatState, seedChat } from "./chat-test-helpers";

const SERVER_ACTION_TIMEOUT_MS = 120_000;

test.afterEach(async () => {
  await cleanupSeededChat();
});

test("opens, renames, starts fresh from, and deletes persisted chats", async ({
  page,
}) => {
  const emailAccountId = await getEmailAccountId(page);
  await seedChat(emailAccountId);

  await page.goto(`/${emailAccountId}/assistant`);
  await expect(page).toHaveURL(new RegExp(`/${emailAccountId}/assistant`));
  await expect(page.getByTestId("chat-input")).toBeVisible();

  await page.getByRole("button", { name: "对话历史" }).click();
  await page.getByRole("menuitem", { name: "Inbox planning" }).click();
  await expect(
    page.getByText("Help me make a plan for today's inbox."),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Start with unread mail, then review anything awaiting a reply.",
    ),
  ).toBeVisible();

  await page.getByRole("button", { name: "对话历史" }).click();
  const chatRow = page
    .getByRole("menuitem", { name: "Inbox planning" })
    .locator("..");
  await chatRow.getByRole("button", { name: "对话选项" }).click();
  await page.getByRole("menuitem", { name: "重命名" }).click();

  const renameDialog = page.getByRole("dialog", { name: "重命名对话" });
  await renameDialog.getByRole("textbox").fill("Daily inbox plan");
  const saveButton = renameDialog.getByRole("button", { name: "保存" });
  await expect(saveButton).toBeEnabled({ timeout: 60_000 });
  await saveButton.click();
  await expect
    .poll(() => getChatState(emailAccountId), {
      timeout: SERVER_ACTION_TIMEOUT_MS,
    })
    .toMatchObject({ isDeleted: false, name: "Daily inbox plan" });
  await expect(renameDialog).toBeHidden({ timeout: 60_000 });

  await page.getByRole("button", { name: "新建对话" }).click();
  await expect(page.getByTestId("chat-input")).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Help me handle my inbox today" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "对话历史" }).click();
  const renamedRow = page
    .getByRole("menuitem", { name: "Daily inbox plan" })
    .locator("..");
  await renamedRow.getByRole("button", { name: "对话选项" }).click();
  await page.getByRole("menuitem", { name: "删除" }).click();

  const deleteDialog = page.getByRole("alertdialog", { name: "删除对话？" });
  await expect(deleteDialog).toContainText("Daily inbox plan");
  const deleteButton = deleteDialog.getByRole("button", { name: "删除" });
  await expect(deleteButton).toBeEnabled({ timeout: 60_000 });
  await deleteButton.click();
  await expect
    .poll(() => getChatState(emailAccountId), {
      timeout: SERVER_ACTION_TIMEOUT_MS,
    })
    .toMatchObject({ isDeleted: true, name: null });
  await expect(deleteDialog).toBeHidden({ timeout: 60_000 });

  await page.getByRole("button", { name: "对话历史" }).click();
  await expect(
    page.getByRole("menuitem", { name: "暂无历史对话" }),
  ).toBeVisible();
});
