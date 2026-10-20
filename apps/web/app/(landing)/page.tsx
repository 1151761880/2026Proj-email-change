import type { Metadata } from "next";
import { Hero, HeroContent } from "@/app/(landing)/home/Hero";
import { Pricing } from "@/components/new-landing/sections/Pricing";
import { Awards } from "@/components/new-landing/sections/Awards";
import { EverythingElseSection } from "@/components/new-landing/sections/EverythingElseSection";
import { StartedInMinutes } from "@/components/new-landing/sections/StartedInMinutes";
import { BulkUnsubscribe } from "@/components/new-landing/sections/BulkUnsubscribe";
import { OrganizedInbox } from "@/components/new-landing/sections/OrganizedInbox";
import { PreWrittenDrafts } from "@/components/new-landing/sections/PreWrittenDrafts";
import { ManageFromAnywhere } from "@/components/new-landing/sections/ManageFromAnywhere";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { FAQs } from "@/app/(landing)/home/FAQs";
import { FinalCTA } from "@/app/(landing)/home/FinalCTA";
import { WordReveal } from "@/components/new-landing/common/WordReveal";
import { env } from "@/env";
import { BRAND_NAME } from "@/utils/branding";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function NewLanding() {
  if (env.NEXT_PUBLIC_BYPASS_PREMIUM_CHECKS) {
    return (
      <BasicLayout>
        <Hero
          title={`适合自主部署团队的 ${BRAND_NAME}`}
          subtitle={`在自己的服务器部署 ${BRAND_NAME}，自动管理收件箱并掌控数据。`}
        />
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      <Hero
        title={
          <WordReveal
            spaceBetween="w-2 md:w-3"
            words={[
              "十组邮件小助手",
              "让邮件",
              <em key="actually">井然有序</em>,
            ]}
          />
        }
        subtitle={`${BRAND_NAME} 自动整理收件箱和日历，按你的风格起草回复，帮助及时处理重要邮件。`}
      >
        <HeroContent />
      </Hero>
      <OrganizedInbox
        title={
          <>
            自动整理。
            <br />
            及时处理重要邮件。
          </>
        }
        subtitle="面对大量邮件，智能助手会自动添加标签，帮助你安排处理顺序。"
      />
      <PreWrittenDrafts
        title="回复草稿已准备好"
        subtitle="查看收件箱时，需要回复的邮件已有符合你风格的草稿，等待确认发送。"
      />
      <ManageFromAnywhere />
      <StartedInMinutes
        title="快速开始"
        subtitle="快速配置，开始整理邮件和起草回复。"
      />
      <BulkUnsubscribe />
      <EverythingElseSection />
      <Awards />
      <Pricing />
      <FinalCTA />
      <FAQs />
    </BasicLayout>
  );
}
