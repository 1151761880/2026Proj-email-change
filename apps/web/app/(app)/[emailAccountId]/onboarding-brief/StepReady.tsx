"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { PageHeading, TypographyP } from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { CardBasic } from "@/components/ui/card";
import { IconCircle } from "@/app/(app)/[emailAccountId]/onboarding/IconCircle";
import { getGmailBasicSearchUrl } from "@/utils/url";
import { useAccount } from "@/providers/EmailAccountProvider";
import { isGoogleProvider } from "@/utils/email/provider-types";
import {
  PricingFrequencyToggle,
  frequencies,
  DiscountBadge,
} from "@/app/(app)/premium/PricingFrequencyToggle";
import { generateCheckoutSessionAction } from "@/utils/actions/premium";
import { toastError } from "@/components/Toast";
import { redirectToSafeUrl } from "@/utils/redirect";

const PRICING_FEATURES = [
  "Briefs for every external meeting",
  "Google Calendar & Outlook",
  "LinkedIn & web research",
  "Sent 1-24 hours before (you choose)",
];

export function StepReady() {
  const { emailAccount } = useAccount();
  const [frequency, setFrequency] = useState(frequencies[1]);
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const tier =
        frequency.value === "annually" ? "STARTER_ANNUALLY" : "STARTER_MONTHLY";

      const result = await generateCheckoutSessionAction({
        tier,
        offer: "BRIEF_MY_MEETING",
      });

      if (!result?.data?.url) {
        toastError({ description: "创建付款会话失败" });
        return;
      }

      redirectToSafeUrl(result.data.url, { allowExternal: true });
    } catch {
      toastError({ description: "创建付款会话失败" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex justify-center">
        <IconCircle size="lg">
          <Sparkles className="size-6" />
        </IconCircle>
      </div>

      <div className="text-center">
        <PageHeading className="mt-4">
          提前做好每次会议的准备
        </PageHeading>
        <TypographyP className="mt-2 max-w-lg mx-auto">
          每次外部会议前都会自动收到类似简报。
        </TypographyP>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <PricingFrequencyToggle
          frequency={frequency}
          setFrequency={setFrequency}
        >
          <div className="ml-1">
            <DiscountBadge>赠送 2 个月！</DiscountBadge>
          </div>
        </PricingFrequencyToggle>

        <CardBasic className="mt-4 p-6 w-full">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                会前简报专业版
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                ${frequency.value === "annually" ? "7.50" : "9"}
                <span className="text-base font-normal text-muted-foreground">
                  /month
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {frequency.value === "annually"
                  ? "按年计费（90 美元 / 年）"
                  : "按月计费"}
              </p>
            </div>
            <div className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
              免费试用 7 天
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {PRICING_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-50">
                  <CheckIcon className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </CardBasic>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        <Button
          size="lg"
          className="w-full"
          onClick={handleCheckout}
          loading={loading}
        >
          开始免费试用
          <ChevronRightIcon className="ml-2 h-4 w-4" />
        </Button>

        {emailAccount?.email &&
          isGoogleProvider(emailAccount?.account?.provider) && (
            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link
                href={getGmailBasicSearchUrl(
                  emailAccount.email,
                  "from:(getinboxzero.com) subject:(Briefing for)",
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                在 Gmail 查看测试简报
              </Link>
            </Button>
          )}
      </div>
    </>
  );
}
