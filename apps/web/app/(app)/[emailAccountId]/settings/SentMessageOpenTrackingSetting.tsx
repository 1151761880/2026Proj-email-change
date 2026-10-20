"use client";

import { useCallback } from "react";
import { useAction } from "next-safe-action/hooks";
import { Switch } from "@/components/ui/switch";
import { LoadingContent } from "@/components/LoadingContent";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemSeparator,
} from "@/components/ui/item";
import { useEmailAccountFull } from "@/hooks/useEmailAccountFull";
import { createSettingActionErrorHandler } from "@/utils/actions/error-handling";
import { updateSentMessageOpenTrackingAction } from "@/utils/actions/email-account";

export function SentMessageOpenTrackingSetting({
  emailAccountId,
}: {
  emailAccountId: string;
}) {
  const { data, isLoading, error, mutate } =
    useEmailAccountFull(emailAccountId);

  const { execute, isExecuting } = useAction(
    updateSentMessageOpenTrackingAction.bind(null, emailAccountId),
    {
      onSuccess: () => {
        mutate();
      },
      onError: createSettingActionErrorHandler({
        mutate,
        prefix: "Failed to update read status setting",
      }),
    },
  );

  const handleToggle = useCallback(
    (enabled: boolean) => {
      if (!data) return;

      mutate({ ...data, sentMessageOpenTrackingEnabled: enabled }, false);

      execute({ enabled });
    },
    [data, execute, mutate],
  );

  return (
    <LoadingContent
      loading={isLoading}
      error={error}
      loadingComponent={
        <>
          <ItemSeparator />
          <Item size="sm">
            <ItemContent>
              <ItemTitle>阅读状态</ItemTitle>
              <ItemDescription>
                查看收件人何时打开你发送的邮件。
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Skeleton className="h-5 w-9 rounded-full" />
            </ItemActions>
          </Item>
        </>
      }
    >
      {data && (
        <>
          <ItemSeparator />
          <Item size="sm">
            <ItemContent>
              <ItemTitle>阅读状态</ItemTitle>
              <ItemDescription>
                查看收件人何时打开邮件。部分应用会阻止追踪，因此“未打开”状态不一定准确。
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Switch
                aria-label="启用或关闭阅读状态"
                checked={data.sentMessageOpenTrackingEnabled}
                disabled={isExecuting}
                onCheckedChange={handleToggle}
              />
            </ItemActions>
          </Item>
        </>
      )}
    </LoadingContent>
  );
}
