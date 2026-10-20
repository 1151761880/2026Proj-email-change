"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCardIcon } from "lucide-react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { LoadingContent } from "@/components/LoadingContent";
import { toastError } from "@/components/Toast";
import type { GetTrialPreviewResponse } from "@/app/api/user/trial-preview/route";
import { endStripeTrialAction } from "@/utils/actions/premium";
import { formatDateSimple } from "@/utils/date";
import { formatStripeAmount } from "@/utils/stripe-amount";

export function EndTrialButton({
  variant,
  size,
  className,
}: Pick<ButtonProps, "variant" | "size" | "className">) {
  const [open, setOpen] = useState(false);
  const [endingTrial, setEndingTrial] = useState(false);
  const { mutate } = useSWRConfig();

  // Revalidate on focus: a dialog left open in a background tab must not
  // charge an amount that no longer matches what is on screen.
  const {
    data: preview,
    isLoading,
    isValidating,
    error,
  } = useSWR<GetTrialPreviewResponse>(open ? "/api/user/trial-preview" : null);

  const endTrial = async () => {
    setEndingTrial(true);
    const result = await endStripeTrialAction().finally(() => {
      setEndingTrial(false);
    });

    if (result?.serverError) {
      toastError({ description: result.serverError });
      return;
    }

    setOpen(false);

    if (result?.data?.status === "active") {
      toast.success("付费套餐已启用。");
    } else {
      toast.message("Your trial has ended.");
    }

    await Promise.all([
      mutate("/api/user/me"),
      mutate("/api/user/ai-automation-status"),
    ]);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <CreditCardIcon className="mr-2 h-4 w-4" />
          立即启用付费套餐
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>结束免费试用并立即付款？</AlertDialogTitle>
          <LoadingContent loading={isLoading} error={error}>
            {preview && (
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  <p>
                    将从你的付款账户扣款{" "}
                    <span className="font-semibold text-foreground">
                      {formatStripeAmount(preview.amountDue, preview.currency)}
                    </span>{" "}
                    ，立即启用 {preview.planName} plan
                    {preview.interval
                      ? `，计费周期：${billingCadence[preview.interval]}`
                      : ""}
                    .
                  </p>
                  {preview.trialEnd && (
                    <p>
                      试用期间可继续使用十组邮件小助手的全部付费功能，免费试用结束时间： {formatDateSimple(new Date(preview.trialEnd))}，届时将自动扣款。
                    </p>
                  )}
                  <p>
                    需要其他套餐或按月付款？{" "}
                    <Link href="/premium" className="underline">
                      请先更改套餐
                    </Link>
                    .
                  </p>
                </div>
              </AlertDialogDescription>
            )}
          </LoadingContent>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>继续免费试用</AlertDialogCancel>
          <Button
            loading={endingTrial}
            disabled={!preview || isValidating}
            onClick={endTrial}
          >
            {preview
              ? `立即支付 ${formatStripeAmount(preview.amountDue, preview.currency)}`
              : "立即付款"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const billingCadence: Record<
  NonNullable<GetTrialPreviewResponse["interval"]>,
  string
> = {
  day: "daily",
  week: "weekly",
  month: "monthly",
  year: "yearly",
};
