import { env } from "@/env";
import type { PremiumTier } from "@/generated/prisma/enums";

type Feature = { text: string; tooltip?: string };

export type Tier = {
  name: string;
  tiers: { monthly: PremiumTier; annually: PremiumTier };
  price: { monthly: number; annually: number };
  discount: { monthly: number; annually: number };
  quantity?: number;
  description: string;
  features: Feature[];
  cta: string;
  ctaLink?: string;
  mostPopular?: boolean;
};

const pricing: Record<PremiumTier, number> = {
  BASIC_MONTHLY: 16,
  BASIC_ANNUALLY: 8,
  PRO_MONTHLY: 16,
  PRO_ANNUALLY: 10,
  STARTER_MONTHLY: 20,
  STARTER_ANNUALLY: 18,
  PLUS_MONTHLY: 35,
  PLUS_ANNUALLY: 28,
  PROFESSIONAL_MONTHLY: 50,
  PROFESSIONAL_ANNUALLY: 42,
  COPILOT_MONTHLY: 500,
  LIFETIME: 299,
};

const variantIdToTier: Record<number, PremiumTier> = {
  [env.NEXT_PUBLIC_BASIC_MONTHLY_VARIANT_ID]: "BASIC_MONTHLY",
  [env.NEXT_PUBLIC_BASIC_ANNUALLY_VARIANT_ID]: "BASIC_ANNUALLY",
  [env.NEXT_PUBLIC_PRO_MONTHLY_VARIANT_ID]: "PRO_MONTHLY",
  [env.NEXT_PUBLIC_PRO_ANNUALLY_VARIANT_ID]: "PRO_ANNUALLY",
  [env.NEXT_PUBLIC_BUSINESS_MONTHLY_VARIANT_ID]: "STARTER_MONTHLY",
  [env.NEXT_PUBLIC_BUSINESS_ANNUALLY_VARIANT_ID]: "STARTER_ANNUALLY",
  [env.NEXT_PUBLIC_COPILOT_MONTHLY_VARIANT_ID]: "COPILOT_MONTHLY",
};

export const BRIEF_MY_MEETING_PRICE_ID_MONTHLY =
  "price_1SjoaXKGf8mwZWHnOdyaf2IN";
export const BRIEF_MY_MEETING_PRICE_ID_ANNUALLY =
  "price_1SjoawKGf8mwZWHnfAeShYhb";

const INCLUDED_EMAIL_ACCOUNT_PRICE_IDS = [
  env.NEXT_PUBLIC_STRIPE_PLUS_MONTHLY_PRICE_ID,
  env.NEXT_PUBLIC_STRIPE_BUSINESS_PLUS_MONTHLY_PRICE_ID,
];

const STRIPE_PRICE_ID_CONFIG: Record<
  PremiumTier,
  {
    // active price id
    priceId?: string;
    // Allow handling of old price ids
    oldPriceIds?: string[];
  }
> = {
  BASIC_MONTHLY: { priceId: "price_1RfeDLKGf8mwZWHn6UW8wJcY" },
  BASIC_ANNUALLY: { priceId: "price_1RfeDLKGf8mwZWHn5kfC8gcM" },
  PRO_MONTHLY: {},
  PRO_ANNUALLY: {},
  STARTER_MONTHLY: {
    priceId: env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    oldPriceIds: [
      "price_1T9FhCKGf8mwZWHn1olNzv6X",
      "price_1S5u73KGf8mwZWHn8VYFdALA",
      "price_1RMSnIKGf8mwZWHnlHP0212n",
      "price_1RfoILKGf8mwZWHnDiUMj6no",
      "price_1RfeAFKGf8mwZWHnnnPzFEky",
      "price_1RfSoHKGf8mwZWHnxTsSDTqW",
      "price_1Rg0QfKGf8mwZWHnDsiocBVD",
      "price_1Rg0LEKGf8mwZWHndYXYg7ie",
      "price_1Rg03pKGf8mwZWHnWMNeQzLc",
      BRIEF_MY_MEETING_PRICE_ID_MONTHLY,
    ],
  },
  STARTER_ANNUALLY: {
    priceId: env.NEXT_PUBLIC_STRIPE_BUSINESS_ANNUALLY_PRICE_ID,
    oldPriceIds: [
      "price_1S5u6uKGf8mwZWHnEvPWuQzG",
      "price_1S1QGGKGf8mwZWHnYpUcqNua",
      "price_1RMSnIKGf8mwZWHnymtuW2s0",
      "price_1RfSoxKGf8mwZWHngHcug4YM",
      // brief my meeting
      BRIEF_MY_MEETING_PRICE_ID_ANNUALLY,
    ],
  },
  PLUS_MONTHLY: {
    priceId: env.NEXT_PUBLIC_STRIPE_PLUS_MONTHLY_PRICE_ID,
  },
  PLUS_ANNUALLY: {
    priceId: env.NEXT_PUBLIC_STRIPE_PLUS_ANNUALLY_PRICE_ID,
  },
  PROFESSIONAL_MONTHLY: {
    priceId: env.NEXT_PUBLIC_STRIPE_BUSINESS_PLUS_MONTHLY_PRICE_ID,
    oldPriceIds: [
      "price_1S5u6NKGf8mwZWHnZCfy4D5n",
      "price_1RMSoMKGf8mwZWHn5fAKBT19",
    ],
  },
  PROFESSIONAL_ANNUALLY: {
    priceId: env.NEXT_PUBLIC_STRIPE_BUSINESS_PLUS_ANNUALLY_PRICE_ID,
    oldPriceIds: [
      "price_1S5u6XKGf8mwZWHnba8HX1H2",
      "price_1RMSoMKGf8mwZWHnGjf6fRmh",
    ],
  },
  COPILOT_MONTHLY: {},
  LIFETIME: {},
};

const APPLE_PRODUCT_ID_CONFIG: Partial<Record<PremiumTier, string>> = {
  STARTER_MONTHLY: env.NEXT_PUBLIC_APPLE_IAP_STARTER_MONTHLY_PRODUCT_ID,
  STARTER_ANNUALLY: env.NEXT_PUBLIC_APPLE_IAP_STARTER_ANNUALLY_PRODUCT_ID,
};

/**
 * App Store products sold by the native iOS app. Both grant the `pro`
 * Superwall entitlement, which is the Starter tier (the same tier Stripe's
 * business prices and Lemon's business variants map to).
 */
const APPLE_STARTER_PRODUCT_IDS: Record<string, PremiumTier> = {
  "com.getinboxzero.starter.monthly.v2": "STARTER_MONTHLY",
  "com.getinboxzero.starter.annual.v2": "STARTER_ANNUALLY",
};

export function getStripeSubscriptionTier({
  priceId,
}: {
  priceId: string;
}): PremiumTier | null {
  const entries = Object.entries(STRIPE_PRICE_ID_CONFIG);

  for (const [tier, config] of entries) {
    if (config.priceId === priceId || config.oldPriceIds?.includes(priceId)) {
      return tier as PremiumTier;
    }
  }
  return null;
}

export function getStripePriceId({
  tier,
}: {
  tier: PremiumTier;
}): string | null {
  return STRIPE_PRICE_ID_CONFIG[tier]?.priceId ?? null;
}

export function hasIncludedEmailAccountsStripePriceId(
  priceId: string | null | undefined,
): boolean {
  if (!priceId) return false;

  return INCLUDED_EMAIL_ACCOUNT_PRICE_IDS?.includes(priceId) ?? false;
}

export function getAppleSubscriptionTier({
  productId,
}: {
  productId: string;
}): PremiumTier | null {
  const starterTier = APPLE_STARTER_PRODUCT_IDS[productId];
  if (starterTier) return starterTier;

  for (const [tier, configuredProductId] of Object.entries(
    APPLE_PRODUCT_ID_CONFIG,
  )) {
    if (configuredProductId === productId) {
      return tier as PremiumTier;
    }
  }

  return null;
}

export function hasLegacyStripePriceId({
  tier,
  priceId,
}: {
  tier: PremiumTier | null | undefined;
  priceId: string | null | undefined;
}): boolean {
  if (!priceId) return false;

  const resolvedTier = tier || getStripeSubscriptionTier({ priceId });
  if (!resolvedTier) return false;

  const tierConfig = STRIPE_PRICE_ID_CONFIG[resolvedTier];
  if (!tierConfig) return false;
  // We sometimes reuse a historical price as the active price again.
  if (tierConfig.priceId === priceId) return false;

  return tierConfig.oldPriceIds?.includes(priceId) ?? false;
}

export function shouldShowLegacyStripePricingNotice(
  premium:
    | {
        tier: PremiumTier | null | undefined;
        stripePriceId: string | null | undefined;
        stripeSubscriptionStatus: string | null | undefined;
      }
    | null
    | undefined,
): boolean {
  if (!premium?.stripeSubscriptionStatus) return false;
  if (!["active", "trialing"].includes(premium.stripeSubscriptionStatus)) {
    return false;
  }

  return hasLegacyStripePriceId({
    tier: premium.tier,
    priceId: premium.stripePriceId,
  });
}

export function getPremiumTierName(
  tier: PremiumTier | null | undefined,
): string {
  if (!tier) return "高级版";

  const tierMap: Partial<Record<PremiumTier, string>> = {
    STARTER_MONTHLY: "Starter",
    STARTER_ANNUALLY: "Starter",
    PLUS_MONTHLY: "Plus",
    PLUS_ANNUALLY: "Plus",
    PROFESSIONAL_MONTHLY: "Professional",
    PROFESSIONAL_ANNUALLY: "Professional",
    COPILOT_MONTHLY: "Enterprise",
    BASIC_MONTHLY: "Basic",
    BASIC_ANNUALLY: "Basic",
    PRO_MONTHLY: "Pro",
    PRO_ANNUALLY: "Pro",
    LIFETIME: "Lifetime",
  };

  return tierMap[tier] ?? "Premium";
}

function discount(monthly: number, annually: number) {
  return ((monthly - annually) / monthly) * 100;
}

export const starterTierName = "Starter";

const starterTier: Tier = {
  name: starterTierName,
  tiers: {
    monthly: "STARTER_MONTHLY",
    annually: "STARTER_ANNUALLY",
  },
  price: {
    monthly: pricing.STARTER_MONTHLY,
    annually: pricing.STARTER_ANNUALLY,
  },
  discount: {
    monthly: 0,
    annually: discount(pricing.STARTER_MONTHLY, pricing.STARTER_ANNUALLY),
  },
  description:
    "适合希望节省邮件处理时间的个人、创业者和管理者。",
  features: [
    {
      text: "自动分类并标记每封邮件",
    },
    {
      text: "按你的风格起草回复",
    },
    {
      text: "拦截陌生推广邮件",
    },
    {
      text: "批量退订和归档邮件",
    },
    {
      text: "邮件统计",
    },
    {
      text: "会前简报",
      tooltip:
        "会议前获取 AI 简报，包含参会者背景和相关邮件内容。",
    },
  ],
  cta: "Try free for 7 days",
  mostPopular: false,
};

const plusTier: Tier = {
  name: "进阶版",
  tiers: {
    monthly: "PLUS_MONTHLY",
    annually: "PLUS_ANNUALLY",
  },
  price: {
    monthly: pricing.PLUS_MONTHLY,
    annually: pricing.PLUS_ANNUALLY,
  },
  discount: {
    monthly: 0,
    annually: discount(pricing.PLUS_MONTHLY, pricing.PLUS_ANNUALLY),
  },
  description:
    "适合需要应用集成和更丰富知识库的用户。",
  features: [
    {
      text: "包含基础版全部功能，并提供：",
    },
    {
      text: "每位用户可使用 2 个邮箱账户",
      tooltip:
        "每位用户包含 2 个邮箱账户，额外账户按标准席位价格计费。",
    },
    {
      text: "AI 会议记录",
      tooltip:
        "会议助手参加视频会议，生成文字记录、摘要、总结邮件和跟进草稿。",
    },
    {
      text: "Slack 集成",
      tooltip:
        "自动将重要邮件和通知转发至 Slack 频道。",
    },
    {
      text: "应用集成",
      tooltip:
        "连接 Notion、Stripe、Monday.com 等应用，让 AI 结合相关数据起草回复和会前简报。",
    },
    {
      text: "邮件摘要",
      tooltip:
        "将指定规则匹配的邮件汇总为定时摘要。",
    },
    {
      text: "自动整理附件",
      tooltip:
        "自动将邮件附件整理到指定存储位置。",
    },
    {
      text: "不限容量的知识库",
      tooltip:
        "知识库用于辅助起草回复，可存储不限数量的内容。",
    },
  ],
  cta: "Try free for 7 days",
  mostPopular: true,
};

const professionalTier: Tier = {
  name: "专业版",
  tiers: {
    monthly: "PROFESSIONAL_MONTHLY",
    annually: "PROFESSIONAL_ANNUALLY",
  },
  price: {
    monthly: pricing.PROFESSIONAL_MONTHLY,
    annually: pricing.PROFESSIONAL_ANNUALLY,
  },
  discount: {
    monthly: 0,
    annually: discount(
      pricing.PROFESSIONAL_MONTHLY,
      pricing.PROFESSIONAL_ANNUALLY,
    ),
  },
  description: "适合邮件量较大的团队和成长型企业。",
  features: [
    {
      text: "包含进阶版全部功能，并提供：",
    },
    { text: "团队统计" },
    { text: "优先支持" },
    {
      text: "专属入门指导",
      tooltip:
        "提供免费的设置指导通话，可按需预约。",
    },
  ],
  cta: "Try free for 7 days",
  mostPopular: false,
};

const enterpriseTier: Tier = {
  name: "企业版",
  tiers: {
    monthly: "COPILOT_MONTHLY",
    annually: "COPILOT_MONTHLY",
  },
  price: { monthly: 0, annually: 0 },
  discount: { monthly: 0, annually: 0 },
  description:
    "适合有企业级安全与合规要求的组织。",
  features: [
    {
      text: "包含团队版全部功能，并提供：",
    },
    {
      text: "单点登录",
    },
    {
      text: "SCIM 用户管理",
    },
    {
      text: "本地部署（可选）",
    },
    {
      text: "高级安全和服务保障",
    },
    {
      text: "专属客户经理和培训",
    },
  ],
  cta: "Speak to sales",
  ctaLink: "https://www.getinboxzero.com/sales",
  mostPopular: false,
};

export function getLemonSubscriptionTier({
  variantId,
}: {
  variantId: number;
}): PremiumTier {
  const tier = variantIdToTier[variantId];
  if (!tier) throw new Error(`Unknown variant id: ${variantId}`);
  return tier;
}

export const tiers: Tier[] = [starterTier, plusTier, professionalTier];
export { enterpriseTier };
