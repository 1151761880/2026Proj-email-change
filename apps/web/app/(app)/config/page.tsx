import fs from "node:fs";
import path from "node:path";
import { env } from "@/env";
import { auth } from "@/utils/auth";
import { isAdmin } from "@/utils/admin";
import {
  hasGoogleOauthConfig,
  hasMicrosoftOauthConfig,
} from "@/utils/oauth/provider-config";
import { getConfiguredRolePrimaryModelEntry } from "@/utils/llms/model";
import { PageWrapper } from "@/components/PageWrapper";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminConfigPage() {
  const session = await auth();

  const isUserAdmin = await isAdmin({ email: session?.user.email });

  const version = getVersion();
  const defaultLlm = getConfiguredRolePrimaryModelEntry("default");
  const economyLlm = getConfiguredRolePrimaryModelEntry("economy");

  const info = {
    version,
    environment: process.env.NODE_ENV,
    baseUrl: env.NEXT_PUBLIC_BASE_URL,
    features: {
      emailSendEnabled: env.NEXT_PUBLIC_EMAIL_SEND_ENABLED,
      contactsEnabled: env.NEXT_PUBLIC_CONTACTS_ENABLED,
      gmailOtherContactsEnabled: env.NEXT_PUBLIC_GMAIL_OTHER_CONTACTS_ENABLED,
      aiModelSettingsDisabled: env.NEXT_PUBLIC_AI_MODEL_SETTINGS_DISABLED,
      bypassPremiumChecks: env.NEXT_PUBLIC_BYPASS_PREMIUM_CHECKS ?? false,
    },
    providers: {
      google: hasGoogleOauthConfig(),
      microsoft: hasMicrosoftOauthConfig(),
      microsoftTenantConfigured:
        hasMicrosoftOauthConfig() &&
        !!env.MICROSOFT_TENANT_ID &&
        env.MICROSOFT_TENANT_ID !== "common",
    },
    llm: {
      defaultProvider: defaultLlm?.provider ?? "not configured",
      defaultModel: defaultLlm?.modelName ?? "not configured",
      economyProvider: economyLlm?.provider ?? "not configured",
      economyModel: economyLlm?.modelName ?? "not configured",
    },
    integrations: {
      redis: !!env.REDIS_HTTP_URL || !!env.REDIS_URL,
      qstash: !!env.QSTASH_TOKEN,
      tinybird: !!env.TINYBIRD_TOKEN,
      sentry: !!env.NEXT_PUBLIC_SENTRY_DSN,
      posthog: !!env.NEXT_PUBLIC_POSTHOG_KEY,
      stripe: !!env.STRIPE_SECRET_KEY,
      lemonSqueezy: !!env.LEMON_SQUEEZY_API_KEY,
    },
  };

  return (
    <PageWrapper className="max-w-2xl mx-auto">
      <PageHeader title="应用配置" />

      <div className="space-y-4 mt-4">
        <Section title="应用">
          <Row label="版本" value={info.version} />
          <Row label="环境" value={info.environment} />
          <Row label="基础地址" value={info.baseUrl} />
        </Section>

        <Section title="功能">
          <Row
            label="邮件发送"
            value={info.features.emailSendEnabled ? "Enabled" : "Disabled"}
          />
          <Row
            label="联系人"
            value={info.features.contactsEnabled ? "Enabled" : "Disabled"}
          />
          <Row
            label="Gmail 其他联系人"
            value={
              info.features.gmailOtherContactsEnabled ? "Enabled" : "Disabled"
            }
          />
          <Row
            label="AI 模型设置"
            value={
              info.features.aiModelSettingsDisabled ? "Disabled" : "Enabled"
            }
          />
          <Row
            label="跳过高级版限制"
            value={info.features.bypassPremiumChecks ? "Yes" : "No"}
          />
        </Section>

        <Section title="登录服务">
          <Row
            label="Google"
            value={info.providers.google ? "Configured" : "Not configured"}
          />
          <Row
            label="Microsoft"
            value={info.providers.microsoft ? "Configured" : "Not configured"}
          />
          <Row
            label="Microsoft 租户"
            value={
              info.providers.microsoftTenantConfigured
                ? "Single tenant"
                : "Multitenant (common)"
            }
          />
        </Section>

        {isUserAdmin && (
          <>
            <Section title="大模型配置">
              <Row label="默认服务商" value={info.llm.defaultProvider} />
              <Row label="默认模型" value={info.llm.defaultModel} />
              <Row label="经济型服务商" value={info.llm.economyProvider} />
              <Row label="经济型模型" value={info.llm.economyModel} />
            </Section>

            <Section title="集成">
              <Row
                label="Redis"
                value={
                  info.integrations.redis ? "Configured" : "Not configured"
                }
              />
              <Row
                label="QStash"
                value={
                  info.integrations.qstash ? "Configured" : "Not configured"
                }
              />
              <Row
                label="Tinybird"
                value={
                  info.integrations.tinybird ? "Configured" : "Not configured"
                }
              />
              <Row
                label="Sentry"
                value={
                  info.integrations.sentry ? "Configured" : "Not configured"
                }
              />
              <Row
                label="PostHog"
                value={
                  info.integrations.posthog ? "Configured" : "Not configured"
                }
              />
              <Row
                label="Stripe"
                value={
                  info.integrations.stripe ? "Configured" : "Not configured"
                }
              />
              <Row
                label="Lemon Squeezy"
                value={
                  info.integrations.lemonSqueezy
                    ? "Configured"
                    : "Not configured"
                }
              />
            </Section>
          </>
        )}
      </div>
    </PageWrapper>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <h2 className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">
        {title}
      </h2>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | boolean }) {
  const displayValue =
    typeof value === "boolean" ? (value ? "Yes" : "No") : value;

  return (
    <div className="flex justify-between px-4 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-mono text-sm text-slate-900">{displayValue}</span>
    </div>
  );
}

// Read version at build time
function getVersion(): string {
  try {
    const versionPath = path.join(process.cwd(), "../../version.txt");
    return fs.readFileSync(versionPath, "utf-8").trim();
  } catch {
    return "unknown";
  }
}
