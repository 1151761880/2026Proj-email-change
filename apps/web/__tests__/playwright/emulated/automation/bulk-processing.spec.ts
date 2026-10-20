import { expect } from "@playwright/test";
import { test } from "../playwright-test";
import { getEmailAccountId } from "../account-test-helpers";
import { markAutomationOnboardingViewed } from "./automation-tabs-test-helpers";

for (const tier of ["PLUS_MONTHLY", "PROFESSIONAL_MONTHLY"] as const) {
  test(`explains historical read-email access for ${tier}`, async ({
    page,
  }) => {
    const emailAccountId = await getEmailAccountId(page);
    await markAutomationOnboardingViewed(page);
    await page.route("**/api/user/me", async (route) => {
      const response = await route.fetch();
      const user = await response.json();
      await route.fulfill({
        response,
        json: {
          ...user,
          premium: {
            ...user.premium,
            tier,
            stripeSubscriptionStatus: "active",
          },
        },
      });
    });

    await page.goto(`/${emailAccountId}/automation`);
    const dialog = page.getByRole("dialog", { name: "批量处理邮件" });
    await expect(async () => {
      if (!(await dialog.isVisible())) {
        await page.getByRole("button", { name: "处理历史邮件" }).click();
      }
      await expect(dialog).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 30_000 });
    await expect(
      dialog.getByText("对收件箱中的已有邮件执行规则。"),
    ).toBeVisible();
    const generateDraftReplies = dialog.getByRole("switch", {
      name: "生成回复草稿",
    });
    await expect(generateDraftReplies).not.toBeChecked();
    await generateDraftReplies.click();
    await expect(generateDraftReplies).toBeChecked();
    await generateDraftReplies.click();
    await expect(generateDraftReplies).not.toBeChecked();

    const includeRead = dialog.getByRole("switch", {
      name: "包含已读邮件",
    });

    if (tier === "PLUS_MONTHLY") {
      await expect(includeRead).toHaveCount(0);
      await expect(
        dialog.getByRole("button", {
          name: "Upgrade to use include read emails",
        }),
      ).toBeVisible();
    } else {
      await expect(includeRead).toBeEnabled();
      await includeRead.click();
      await expect(includeRead).toBeChecked();
    }
  });
}
