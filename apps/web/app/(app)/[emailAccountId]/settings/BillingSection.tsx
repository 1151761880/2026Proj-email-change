"use client";

import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { usePremium } from "@/hooks/usePremium";
import {
  ManageSubscription,
  ViewInvoicesButton,
} from "@/app/(app)/premium/ManageSubscription";
import { LoadingContent } from "@/components/LoadingContent";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toastError } from "@/components/Toast";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemSeparator,
} from "@/components/ui/item";
import {
  getPremiumTierName,
  shouldShowLegacyStripePricingNotice,
} from "@/app/(app)/premium/config";
import { hasActiveAppleSubscription } from "@/utils/premium";
import { getActionErrorMessage } from "@/utils/error";
import { updateStripeInvoiceEmailsAction } from "@/utils/actions/premium";

export function BillingSection() {
  const {
    data,
    premium,
    isPremium,
    isLoading,
    tier,
    mutate,
    canManageBilling,
  } = usePremium();
  const isLegacyStripePlan = shouldShowLegacyStripePricingNotice(premium);
  const hasAppleSubscription = hasActiveAppleSubscription(
    premium?.appleExpiresAt || null,
    premium?.appleRevokedAt || null,
    premium?.appleSubscriptionStatus || null,
  );
  const { execute, isExecuting } = useAction(updateStripeInvoiceEmailsAction, {
    onError: (error) => {
      toastError({
        description: getActionErrorMessage(error.error, {
          prefix: "Failed to update invoice emails",
        }),
      });
    },
    onSettled: () => {
      mutate();
    },
  });

  const handleInvoiceEmailToggle = (enabled: boolean) => {
    if (!data?.premium) return;

    mutate(
      {
        ...data,
        premium: {
          ...data.premium,
          stripeInvoiceEmailsEnabled: enabled,
        },
      },
      false,
    );
    execute({ enabled });
  };

  if (!canManageBilling) return null;

  return (
    <LoadingContent loading={isLoading}>
      {premium && isPremium ? (
        <Item size="sm">
          <ItemContent>
            <ItemTitle>{getPremiumTierName(tier)} plan</ItemTitle>
            {hasAppleSubscription ? (
              <ItemDescription>
                此订阅由 Apple 计费，请在 iPhone 或 iPad 的订阅设置中管理或取消。
              </ItemDescription>
            ) : isLegacyStripePlan ? (
              <ItemDescription>
                你正在使用原有 Stripe 套餐价格，应用其他位置显示的是新订阅价格。
              </ItemDescription>
            ) : null}
          </ItemContent>
          <ItemActions>
            <ManageSubscription premium={premium} />
            <ViewInvoicesButton premium={premium} />
            {!hasAppleSubscription && (
              <Button asChild variant="outline" size="sm">
                <Link href="/premium">更改套餐</Link>
              </Button>
            )}
          </ItemActions>
        </Item>
      ) : (
        <Item size="sm">
          <ItemContent>
            <ItemTitle>暂无有效套餐</ItemTitle>
          </ItemContent>
          <ItemActions>
            {premium && <ViewInvoicesButton premium={premium} />}
            <Button asChild variant="outline" size="sm">
              <Link href="/premium">升级</Link>
            </Button>
          </ItemActions>
        </Item>
      )}

      {premium?.stripeCustomerId && (
        <>
          <ItemSeparator />
          <Item size="sm">
            <ItemContent>
              <ItemTitle>通过邮件发送已付款发票</ItemTitle>
              <ItemDescription>
                自动将每份 Stripe 发票发送到帐单邮箱。
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Switch
                aria-label="通过邮件发送已付款 Stripe 发票"
                checked={premium.stripeInvoiceEmailsEnabled}
                disabled={isExecuting}
                onCheckedChange={handleInvoiceEmailToggle}
              />
            </ItemActions>
          </Item>
        </>
      )}
    </LoadingContent>
  );
}
