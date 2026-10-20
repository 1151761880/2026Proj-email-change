"use client";

import { useCallback } from "react";
import { Toggle } from "@/components/Toggle";
import { toastSuccess } from "@/components/Toast";
import { useAccount } from "@/providers/EmailAccountProvider";
import { LoadingContent } from "@/components/LoadingContent";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingCard } from "@/components/SettingCard";
import { useEmailAccountFull } from "@/hooks/useEmailAccountFull";
import { useAction } from "next-safe-action/hooks";
import { updateReferralSignatureAction } from "@/utils/actions/email-account";
import { createSettingActionErrorHandler } from "@/utils/actions/error-handling";
import { env } from "@/env";
import { BRAND_NAME } from "@/utils/branding";

export function ReferralSignatureSetting() {
  const { data, isLoading, error, mutate } = useEmailAccountFull();
  const { emailAccountId } = useAccount();

  const { execute } = useAction(
    updateReferralSignatureAction.bind(null, emailAccountId),
    {
      onSuccess: () => {
        toastSuccess({
          description: "推荐签名设置已更新！",
        });
      },
      onError: createSettingActionErrorHandler({
        mutate,
        prefix: "Failed to update referral signature setting",
      }),
      onSettled: () => {
        mutate();
      },
    },
  );

  const handleToggle = useCallback(
    (enabled: boolean) => {
      if (!data) return;

      const optimisticData = {
        ...data,
        includeReferralSignature: enabled,
      };
      mutate(optimisticData, false);

      execute({ enabled });
    },
    [data, mutate, execute],
  );

  if (env.NEXT_PUBLIC_DISABLE_REFERRAL_SIGNATURE) {
    return null;
  }

  return (
    <SettingCard
      title="包含推荐签名"
      description={`在回复草稿中添加“由 ${BRAND_NAME} 起草”和推荐链接。每成功推荐一位用户可获得一个月额度。`}
      right={
        <LoadingContent
          loading={isLoading}
          error={error}
          loadingComponent={<Skeleton className="h-8 w-32" />}
        >
          <Toggle
            name="referral-signature"
            enabled={data?.includeReferralSignature ?? false}
            onChange={handleToggle}
          />
        </LoadingContent>
      }
    />
  );
}
