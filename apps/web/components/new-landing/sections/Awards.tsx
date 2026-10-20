import { Card, CardContent } from "@/components/new-landing/common/Card";
import { CardWrapper } from "@/components/new-landing/common/CardWrapper";
import {
  Section,
  SectionContent,
} from "@/components/new-landing/common/Section";
import {
  Paragraph,
  SectionHeading,
  SectionSubtitle,
} from "@/components/new-landing/common/Typography";
import { cn } from "@/utils";
import Image from "next/image";

type Award = {
  title: string;
  description: string;
  image: string;
  imageSize?: number;
  top?: string;
  hideOnMobile?: boolean;
};

const awards: Award[] = [
  {
    title: "SOC 2 合规",
    description: "安全与隐私保护",
    image: "/images/new-landing/awards/soc-award.png",
  },
  {
    title: "开源项目",
    description: "源码公开，便于开发者审查",
    image: "/images/new-landing/awards/github-trending-award.png",
    imageSize: 160,
    top: "top-2",
    hideOnMobile: true,
  },
  {
    title: "产品体验",
    description: "体验智能邮件管理",
    image: "/images/new-landing/awards/product-hunt-award.png",
    imageSize: 170,
  },
  {
    title: "开源社区",
    description: "源码开放，便于了解功能实现",
    image: "/images/new-landing/awards/github-stars-award.png",
    imageSize: 170,
    top: "top-3",
  },
];

const defaultAwardImageSize = 200;

export function Awards() {
  return (
    <Section>
      <SectionHeading>注重隐私，源码开放</SectionHeading>
      <SectionSubtitle>
        可自主部署十组邮件小助手，并根据实际部署配置管理邮件数据和 AI 服务。
      </SectionSubtitle>
      <SectionContent
        noMarginTop
        className="mt-20 gap-x-5 gap-y-20 lg:gap-y-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      >
        {awards.map((award) => (
          <CardWrapper
            padding="sm"
            rounded="sm"
            key={award.title}
            className={cn(award.hideOnMobile && "hidden md:block")}
          >
            <Card
              variant="extra-rounding"
              className="gap-3 h-full relative pt-24 text-center"
            >
              <CardContent>
                <Image
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 -translate-y-20",
                    award.top || "top-0",
                  )}
                  src={award.image}
                  alt={award.title}
                  width={award.imageSize || defaultAwardImageSize}
                  height={award.imageSize || defaultAwardImageSize}
                />
                <Paragraph color="gray-900" size="md" className="font-bold">
                  {award.title}
                </Paragraph>
                <Paragraph size="sm" className="mt-4">
                  {award.description}
                </Paragraph>
              </CardContent>
            </Card>
          </CardWrapper>
        ))}
      </SectionContent>
    </Section>
  );
}
