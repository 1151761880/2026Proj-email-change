"use client";

import Link from "next/link";
import { SettingCard } from "@/components/SettingCard";
import { Button } from "@/components/ui/button";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useAccount } from "@/providers/EmailAccountProvider";
import { useIntegrationsEnabled } from "@/hooks/useFeatureFlags";

export function IntegrationsSetting() {
  const { emailAccountId } = useAccount();
  const { data, isLoading } = useIntegrations();
  const integrationsEnabled = useIntegrationsEnabled();

  // Wait for data so we don't flash the unconnected state
  if (!integrationsEnabled || isLoading) {
    return null;
  }

  const connectedIntegrations =
    data?.integrations.filter((i) => i.connection?.isActive && !i.comingSoon) ||
    [];

  const enabledToolsCount = connectedIntegrations.reduce(
    (count, i) =>
      count + (i.connection?.tools?.filter((t) => t.isEnabled).length || 0),
    0,
  );

  const hasConnectedIntegrations = connectedIntegrations.length > 0;

  return (
    <SettingCard
      title="集成"
      description={
        hasConnectedIntegrations
          ? `已连接 ${connectedIntegrations.map((i) => i.shortName || i.displayName).join(", ")}，启用 ${enabledToolsCount} 个工具`
          : "连接 CRM、数据库等工具，为简报提供更多相关信息"
      }
      right={
        <Button variant="outline" asChild>
          <Link href={`/${emailAccountId}/integrations`}>
            {hasConnectedIntegrations ? "管理" : "连接"}
          </Link>
        </Button>
      }
    />
  );
}
