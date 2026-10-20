"use client";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemSeparator,
} from "@/components/ui/item";
import { resetAnalyticsAction } from "@/utils/actions/user";

export function ResetAnalyticsSection({
  emailAccountId,
}: {
  emailAccountId: string;
}) {
  const { executeAsync: executeResetAnalytics } = useAction(
    resetAnalyticsAction.bind(null, emailAccountId),
  );

  return (
    <>
      <ItemSeparator />
      <Item size="sm">
        <ItemContent>
          <ItemTitle>重置统计数据</ItemTitle>
          <ItemDescription>永久删除全部统计数据</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              toast.promise(() => executeResetAnalytics(), {
                loading: "正在重置统计数据…",
                success: () =>
                  "统计数据已重置！在退订或统计页面点击“加载更多”重新加载数据。",
                error: (err: unknown) =>
                  `重置统计数据失败：${err instanceof Error ? err.message : "未知错误"}`,
              });
            }}
          >
            重置
          </Button>
        </ItemActions>
      </Item>
    </>
  );
}
