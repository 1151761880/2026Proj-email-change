"use client";

import { useCallback } from "react";
import { Toggle } from "@/components/Toggle";
import { enableMultiRuleSelectionAction } from "@/utils/actions/rule";
import { createSettingActionErrorHandler } from "@/utils/actions/error-handling";
import { SettingCard } from "@/components/SettingCard";
import { useEmailAccountFull } from "@/hooks/useEmailAccountFull";
import { useAction } from "next-safe-action/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingContent } from "@/components/LoadingContent";
import { TooltipExplanation } from "@/components/TooltipExplanation";

export function MultiRuleSetting() {
  const { data, isLoading, error, mutate } = useEmailAccountFull();

  const { execute } = useAction(
    enableMultiRuleSelectionAction.bind(null, data?.id ?? ""),
    {
      onSuccess: () => {
        mutate();
      },
      onError: createSettingActionErrorHandler({
        mutate,
        prefix: "There was an error",
      }),
    },
  );

  const enabled = data?.multiRuleSelectionEnabled ?? false;

  const handleToggle = useCallback(
    (enable: boolean) => {
      if (!data) return;

      const optimisticData = {
        ...data,
        multiRuleSelectionEnabled: enable,
      };
      mutate(optimisticData, false);

      execute({ enable });
    },
    [data, mutate, execute],
  );

  return (
    <SettingCard
      title={
        <div className="flex items-center gap-1.5">
          <span>多规则匹配</span>
          <TooltipExplanation
            side="top"
            text="关闭后，AI 不会主动为一封邮件选择多条自定义规则。十组邮件小助手在少数特殊情况下仍可能应用多条规则。"
          />
        </div>
      }
      description="允许 AI 在适当时为同一封邮件选择多条规则。"
      right={
        <LoadingContent
          loading={isLoading}
          error={error}
          loadingComponent={<Skeleton className="h-8 w-32" />}
        >
          <Toggle
            name="multi-rule-selection"
            enabled={enabled}
            onChange={handleToggle}
            disabled={isLoading}
          />
        </LoadingContent>
      }
    />
  );
}
