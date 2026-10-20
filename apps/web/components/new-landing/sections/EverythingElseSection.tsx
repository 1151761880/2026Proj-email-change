import Image from "next/image";
import { BlurFade } from "@/components/new-landing/common/BlurFade";
import { CardWrapper } from "@/components/new-landing/common/CardWrapper";
import { DisplayCard } from "@/components/new-landing/common/DisplayCard";
import {
  Section,
  SectionContent,
} from "@/components/new-landing/common/Section";
import {
  SectionHeading,
  SectionSubtitle,
} from "@/components/new-landing/common/Typography";
import { Analytics } from "@/components/new-landing/icons/Analytics";
import { ChatTwo } from "@/components/new-landing/icons/ChatTwo";
import { Link } from "@/components/new-landing/icons/Link";

export function EverythingElseSection() {
  return (
    <Section>
      <SectionHeading>贴合实际工作方式</SectionHeading>
      <SectionSubtitle>
        灵活配置邮件流程，快速完成设置。
      </SectionSubtitle>
      <SectionContent
        noMarginTop
        className="mt-5 flex flex-col items-center gap-5 sm:mx-10 md:mx-40 lg:mx-0"
      >
        <CardWrapper className="w-full grid grid-cols-1 lg:grid-cols-3 gap-5">
          <BlurFade inView>
            <DisplayCard
              title="了解邮箱数据，更好地管理邮件"
              description="了解主要发件人和邮件来源，并据此整理收件箱。"
              icon={<Analytics />}
            >
              <Image
                src="/images/new-landing/metrics.svg"
                alt="metrics"
                width={1000}
                height={400}
              />
            </DisplayCard>
          </BlurFade>
          <BlurFade delay={0.25} inView>
            <DisplayCard
              title="结合日程和空闲时间起草回复"
              description="连接日历和 CRM，根据实际日程及客户资料起草回复。"
              icon={<Link />}
            >
              <Image
                src="/images/new-landing/integrations.png"
                alt="应用集成"
                width={1000}
                height={400}
              />
            </DisplayCard>
          </BlurFade>
          <BlurFade delay={0.25 * 2} inView>
            <DisplayCard
              title="用自然语言配置邮件流程"
              description="用自然语言配置规则，让收件箱符合你的工作方式。"
              icon={<ChatTwo />}
            >
              <Image
                src="/images/new-landing/create-rules.png"
                alt="自定义"
                width={1000}
                height={400}
              />
            </DisplayCard>
          </BlurFade>
        </CardWrapper>
      </SectionContent>
    </Section>
  );
}
