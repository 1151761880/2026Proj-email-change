"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { env } from "@/env";
import { LoadingContent } from "@/components/LoadingContent";
import { usePremium } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import {
  PricingFrequencyToggle,
  frequencies,
  DiscountBadge,
  type Frequency,
} from "@/app/(app)/premium/PricingFrequencyToggle";
import { getUserTier, hasActiveAppleSubscription } from "@/utils/premium";
import {
  getPremiumTierName,
  shouldShowLegacyStripePricingNotice,
  type Tier,
  tiers,
} from "@/app/(app)/premium/config";
import { AlertBasic } from "@/components/Alert";
import { TooltipExplanation } from "@/components/TooltipExplanation";
import { toastError } from "@/components/Toast";
import {
  generateCheckoutSessionAction,
  getBillingPortalUrlAction,
} from "@/utils/actions/premium";
import type { PremiumTier } from "@/generated/prisma/enums";
import { LoadingMiniSpinner } from "@/components/Loading";
import { cn } from "@/utils";
import { ManageSubscription } from "@/app/(app)/premium/ManageSubscription";
import { captureException } from "@/utils/error";
import { redirectToSafeUrl } from "@/utils/redirect";
import type { CheckoutReturnTo } from "@/utils/actions/premium.validation";

export type PricingProps = {
  header?: React.ReactNode;
  showSkipUpgrade?: boolean;
  className?: string;
  displayTiers?: Tier[];
  checkoutReturnTo?: CheckoutReturnTo;
};

export default function Pricing(props: PricingProps) {
  const posthog = usePostHog();
  const { premium, isPremium, isLoading, error, data, canManageBilling } =
    usePremium();
  const hasTrackedPricingView = useRef(false);

  const isLoggedIn = !!data?.id;
  const pricingSource = props.showSkipUpgrade
    ? "welcome_upgrade"
    : "app_premium";
  const displayedTiers = props.displayTiers || tiers;
  const hasActiveAppleManagedSubscription = hasActiveAppleSubscription(
    premium?.appleExpiresAt || null,
    premium?.appleRevokedAt || null,
    premium?.appleSubscriptionStatus || null,
  );
  const hasExistingSubscription = Boolean(
    isPremium ||
      premium?.stripeSubscriptionId ||
      premium?.lemonSqueezyCustomerId ||
      hasActiveAppleManagedSubscription,
  );
  const isLegacyStripePlan = shouldShowLegacyStripePricingNotice(premium);

  const defaultFrequency = frequencies[1];
  const [chosenFrequency, setFrequency] = useState<
    (typeof frequencies)[number] | null
  >(null);
  const frequency = chosenFrequency ?? defaultFrequency;

  const userPremiumTier = getUserTier(premium);

  const header = props.header || (
    <div className="mb-12">
      <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
        <h2 className="font-title text-base leading-7 text-blue-600">
          价格方案
        </h2>
        <p className="mt-2 font-title text-4xl text-gray-900 sm:text-5xl">
          免费试用，灵活付费
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
        无隐藏费用，可随时取消。
      </p>
    </div>
  );

  const router = useRouter();

  useEffect(() => {
    if (isLoading || hasTrackedPricingView.current) {
      return;
    }

    hasTrackedPricingView.current = true;
    posthog.capture("pricing_page_viewed", {
      source: pricingSource,
      isLoggedIn,
      hasExistingSubscription,
      showSkipUpgrade: Boolean(props.showSkipUpgrade),
      displayedTiers: displayedTiers.map((tier) => tier.name),
      frequency: frequency.value,
      defaultFrequency: defaultFrequency.value,
      frequencySource: chosenFrequency ? "user_selected" : "default",
    });
  }, [
    chosenFrequency,
    defaultFrequency.value,
    displayedTiers,
    frequency.value,
    hasExistingSubscription,
    isLoading,
    isLoggedIn,
    posthog,
    pricingSource,
    props.showSkipUpgrade,
  ]);

  if (isLoggedIn && !canManageBilling) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <AlertBasic
          variant="blue"
          title="无账单管理权限"
          description="仅组织所有者和管理员可管理账单。"
        />
      </div>
    );
  }

  return (
    <LoadingContent loading={isLoading} error={error}>
      <div
        id="pricing"
        className={cn(
          "relative isolate mx-auto max-w-7xl bg-white px-6 pt-6 sm:pt-10 lg:px-8",
          props.className,
        )}
      >
        {header}

        {hasExistingSubscription && (
          <div className="mb-8 mt-8 text-center">
            <ManageSubscription premium={premium ?? null} />

            {userPremiumTier && (
              <Button className="ml-2" asChild>
                <Link href="/setup">
                  <SparklesIcon className="mr-2 h-4 w-4" />
                  进入应用
                </Link>
              </Button>
            )}

            {hasActiveAppleManagedSubscription && (
              <div className="mx-auto mt-4 max-w-2xl text-left">
                <AlertBasic
                  variant="blue"
                  title="通过 App Store 管理"
                  description="此订阅由 Apple 计费。请在 iPhone 或 iPad 的订阅设置中修改或取消。"
                />
              </div>
            )}

            {isLegacyStripePlan && (
              <div className="mx-auto mt-4 max-w-2xl text-left">
                <AlertBasic
                  variant="blue"
                  title="原有套餐价格"
                  description={`你正在使用原有的 ${getPremiumTierName(premium?.tier)} Stripe 套餐。下方为新订阅价格，可能高于你的实际账单金额。`}
                />
              </div>
            )}
          </div>
        )}

        <PricingFrequencyToggle
          frequency={frequency}
          setFrequency={(nextFrequency) => {
            posthog.capture("pricing_frequency_changed", {
              source: pricingSource,
              previousFrequency: frequency.value,
              frequency: nextFrequency.value,
              defaultFrequency: defaultFrequency.value,
            });
            setFrequency(nextFrequency);
          }}
        >
          <div className="ml-1">
            <DiscountBadge>最高节省 20%</DiscountBadge>
          </div>
        </PricingFrequencyToggle>

        <div
          className={cn(
            "isolate mx-auto mt-6 grid grid-cols-1 gap-y-8 gap-4 sm:mt-10",
            displayedTiers.length === 2
              ? "max-w-3xl lg:grid-cols-2"
              : "max-w-7xl lg:mx-0 lg:max-w-none lg:grid-cols-3",
          )}
        >
          {displayedTiers.map((tier) => (
            <PriceTier
              key={tier.name}
              tier={tier}
              userPremiumTier={userPremiumTier}
              frequency={frequency}
              defaultFrequency={defaultFrequency}
              frequencySource={chosenFrequency ? "user_selected" : "default"}
              stripeSubscriptionId={premium?.stripeSubscriptionId}
              stripeSubscriptionStatus={premium?.stripeSubscriptionStatus}
              hasActiveAppleManagedSubscription={
                hasActiveAppleManagedSubscription
              }
              isLoggedIn={isLoggedIn}
              router={router}
              userId={data?.id}
              pricingSource={pricingSource}
              checkoutReturnTo={props.checkoutReturnTo}
            />
          ))}
        </div>
      </div>
    </LoadingContent>
  );
}

function PriceTier({
  tier,
  userPremiumTier,
  frequency,
  defaultFrequency,
  frequencySource,
  stripeSubscriptionId,
  stripeSubscriptionStatus,
  hasActiveAppleManagedSubscription,
  isLoggedIn,
  router,
  userId,
  pricingSource,
  checkoutReturnTo,
}: {
  tier: Tier;
  userPremiumTier: PremiumTier | null;
  frequency: Frequency;
  defaultFrequency: Frequency;
  frequencySource: "default" | "user_selected";
  stripeSubscriptionId: string | null | undefined;
  stripeSubscriptionStatus: string | null | undefined;
  hasActiveAppleManagedSubscription: boolean;
  isLoggedIn: boolean;
  router: ReturnType<typeof useRouter>;
  userId: string | null | undefined;
  pricingSource: "welcome_upgrade" | "app_premium";
  checkoutReturnTo?: CheckoutReturnTo;
}) {
  const posthog = usePostHog();
  const [loading, setLoading] = useState(false);

  const isCurrentPlan = tier.tiers[frequency.value] === userPremiumTier;
  const hasActiveStripeSubscription =
    !!stripeSubscriptionId &&
    !!stripeSubscriptionStatus &&
    ["active", "trialing"].includes(stripeSubscriptionStatus);

  function getCTAText() {
    if (isCurrentPlan) return "当前套餐";
    if (userPremiumTier && !tier.ctaLink) return "切换至此套餐";
    return tier.cta;
  }

  return (
    <div className="flex flex-col rounded-3xl bg-white p-6 ring-1 ring-gray-200 sm:p-8 xl:p-10">
      <div className="flex-1">
        <div className="flex items-center justify-between gap-x-4">
          <h3
            id={tier.name}
            className={cn(
              tier.mostPopular ? "text-blue-600" : "text-gray-900",
              "font-title text-lg leading-8",
            )}
          >
            {tier.name}
          </h3>
          {tier.mostPopular ? <DiscountBadge>热门</DiscountBadge> : null}
        </div>
        <p className="mt-4 text-sm leading-6 text-gray-600">
          {tier.description}
        </p>
        <p className="mt-6 flex items-baseline gap-x-1">
          {tier.price[frequency.value] === 0 ? (
            <span className="text-4xl font-bold tracking-tight text-gray-900">
              联系我们
            </span>
          ) : (
            <>
              <span className="text-4xl font-bold tracking-tight text-gray-900">
                ${tier.price[frequency.value]}
              </span>
              <span className="text-sm font-semibold leading-6 text-gray-600">
                /user
              </span>
            </>
          )}

          {!!tier.discount?.[frequency.value] && (
            <DiscountBadge>
              <span className="tracking-wide">
                节省 {tier.discount[frequency.value].toFixed(0)}%
              </span>
            </DiscountBadge>
          )}
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {tier.price[frequency.value] ? frequency.priceSuffix : "\u00A0"}
        </p>

        <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
          {tier.features.map((feature) => (
            <li key={feature.text} className="flex gap-x-3">
              <CheckIcon
                className="h-6 w-5 flex-none text-blue-600"
                aria-hidden="true"
              />
              <span className="flex items-center gap-2">
                {feature.text}
                {feature.tooltip && (
                  <TooltipExplanation text={feature.tooltip} />
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          const upgradeToTier = tier.tiers[frequency.value];

          posthog.capture("pricing_cta_clicked", {
            source: pricingSource,
            tier: tier.name,
            billingTier: upgradeToTier ?? null,
            frequency: frequency.value,
            defaultFrequency: defaultFrequency.value,
            frequencySource,
            cta: getCTAText(),
            isCurrentPlan,
            isLoggedIn,
            hasExternalCta: Boolean(tier.ctaLink),
            hasActiveStripeSubscription,
          });

          // Handle enterprise tier differently - redirect to sales page
          if (tier.ctaLink) {
            redirectToSafeUrl(tier.ctaLink, { allowExternal: true });
            return;
          }

          if (!isLoggedIn) {
            router.push("/login");
            return;
          }

          setLoading(true);

          async function load() {
            if (tier.tiers[frequency.value] === userPremiumTier) {
              toast.info("你已使用此套餐");
              return;
            }

            if (hasActiveAppleManagedSubscription) {
              toast.info(
                "此订阅通过 App Store 管理。请在 iPhone 或 iPad 的订阅设置中修改或取消。",
              );
              return;
            }

            let result:
              | Awaited<ReturnType<typeof getBillingPortalUrlAction>>
              | Awaited<ReturnType<typeof generateCheckoutSessionAction>>;

            if (hasActiveStripeSubscription) {
              result = await getBillingPortalUrlAction({ tier: upgradeToTier });
            } else {
              result = await generateCheckoutSessionAction({
                tier: upgradeToTier,
                returnTo: checkoutReturnTo,
              });
            }

            if (!result?.data?.url || result?.serverError) {
              const description = hasActiveStripeSubscription
                ? `We couldn't open the plan change page. Your subscription has not been changed. Please contact support at ${env.NEXT_PUBLIC_SUPPORT_EMAIL}`
                : result?.serverError ||
                  `Error creating checkout session. Please contact support at ${env.NEXT_PUBLIC_SUPPORT_EMAIL}`;

              captureException(new Error("打开 Stripe 账单页面失败"), {
                extra: {
                  tier: upgradeToTier,
                  frequency: frequency.value,
                  userId,
                  serverError: result?.serverError,
                  result,
                },
              });
              toastError({
                description,
              });
              return;
            }

            redirectToSafeUrl(result.data.url, { allowExternal: true });
          }

          try {
            await load();
          } catch (error) {
            console.error(error);
            toastError({
              description:
                error instanceof Error
                  ? error.message
                  : `Error creating checkout session. Please contact support at ${env.NEXT_PUBLIC_SUPPORT_EMAIL}`,
            });
          } finally {
            setLoading(false);
          }
        }}
        aria-describedby={tier.name}
        className={cn(
          tier.mostPopular
            ? "bg-blue-600 text-white shadow-sm hover:bg-blue-500"
            : "text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300",
          "mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
        )}
      >
        {loading ? (
          <div className="flex items-center justify-center py-1">
            <LoadingMiniSpinner />
          </div>
        ) : (
          getCTAText()
        )}
      </button>
    </div>
  );
}
