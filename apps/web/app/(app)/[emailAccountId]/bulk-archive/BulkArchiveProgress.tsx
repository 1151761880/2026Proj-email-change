"use client";

import { useEffect } from "react";
import { ProgressPanel } from "@/components/ProgressPanel";
import { useArchiveQueueProgress } from "@/store/archive-sender-queue";
import { useAccount } from "@/providers/EmailAccountProvider";

export function BulkArchiveProgress({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const { emailAccountId } = useAccount();
  const progress = useArchiveQueueProgress(emailAccountId);
  const totalItems = progress?.totalItems ?? 0;
  const completedItems = progress?.completedItems ?? 0;
  const failedItems = progress?.failedItems ?? 0;
  const activeItems = progress?.activeItems ?? 0;
  const settledItems = progress?.settledItems ?? 0;
  const hasActiveProgress = activeItems > 0;
  const hasSettledProgress = !!totalItems && settledItems === totalItems;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    if (hasSettledProgress) {
      timeoutId = setTimeout(() => {
        onComplete?.();
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [hasSettledProgress, onComplete]);

  if ((!hasActiveProgress && !hasSettledProgress) || !totalItems) {
    return null;
  }

  const failedSuffix = failedItems ? ` ${failedItems} failed.` : "";

  return (
    <ProgressPanel
      totalItems={totalItems}
      remainingItems={activeItems}
      inProgressText={`正在归档 ${Math.min(settledItems + 1, totalItems)} / ${totalItems} 位发件人的邮件…${failedSuffix}`}
      completedText={
        failedItems
          ? `归档结束：成功 ${completedItems} 项，失败 ${failedItems} 项。`
          : `归档完成！已处理 ${completedItems} 位发件人！`
      }
      itemLabel="senders"
    />
  );
}
