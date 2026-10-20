"use client";

import { useAction } from "next-safe-action/hooks";
import { Switch } from "@/components/ui/switch";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { toastError, toastSuccess } from "@/components/Toast";
import { useUser } from "@/hooks/useUser";
import { updateDecisionModelSettingsAction } from "@/utils/actions/settings";
import { getActionErrorMessage } from "@/utils/error";

export function DecisionModelSection() {
  const { data, mutate } = useUser();

  const { execute, isExecuting } = useAction(
    updateDecisionModelSettingsAction,
    {
      onSuccess: () => {
        toastSuccess({ description: "设置已更新！" });
      },
      onError: (error) => {
        toastError({
          description: getActionErrorMessage(error.error, {
            prefix: "Failed to update settings",
          }),
        });
      },
      onSettled: () => {
        mutate();
      },
    },
  );

  if (!data) return null;

  return (
    <Item size="sm">
      <ItemContent>
        <ItemTitle>专用决策模型</ItemTitle>
        <ItemDescription>
          可指定用于规则匹配等结构化决策的模型，不可用时回退到当前 AI 模型。
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Switch
          aria-label="专用决策模型"
          checked={data.decisionModelEnabled}
          onCheckedChange={(decisionModelEnabled) => {
            mutate({ ...data, decisionModelEnabled }, false);
            execute({ decisionModelEnabled });
          }}
          disabled={isExecuting}
        />
      </ItemActions>
    </Item>
  );
}
