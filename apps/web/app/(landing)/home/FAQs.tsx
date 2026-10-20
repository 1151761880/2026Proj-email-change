import { Anchor } from "@/components/new-landing/common/Anchor";
import { Card, CardContent } from "@/components/new-landing/common/Card";
import { CardWrapper } from "@/components/new-landing/common/CardWrapper";
import {
  Section,
  SectionContent,
} from "@/components/new-landing/common/Section";
import {
  Paragraph,
  SectionHeading,
} from "@/components/new-landing/common/Typography";
import { env } from "@/env";
import { BRAND_NAME } from "@/utils/branding";

const faqs: {
  question: string;
  answer: React.ReactNode;
  answerText?: string;
}[] = [
  {
    question: `Which email providers does ${BRAND_NAME} support?`,
    answer:
      "We support Gmail, Google Workspace, and Microsoft Outlook email accounts.",
  },
  {
    question: "How can I request a feature?",
    answer: (
      <span>
        通过邮件或以下平台提交问题：{" "}
        <Anchor href="/github" newTab>
          GitHub
        </Anchor>
        。欢迎提供改进邮件使用体验的建议。
      </span>
    ),
    answerText:
      "通过邮件或 GitHub 提交问题，帮助改进邮件使用体验。",
  },
  {
    question: `Will ${BRAND_NAME} replace my current email client?`,
    answer: (
      <span>
        可以继续使用原有邮箱。 {BRAND_NAME} 支持 Gmail 和 Outlook。助手在后台工作时，你可以继续正常使用邮箱。 {BRAND_NAME} 也提供自己的{" "}
        <Anchor href="/email-client">邮件客户端</Anchor> ，支持网页、桌面和 iPhone。
      </span>
    ),
    answerText: `${BRAND_NAME} 支持 Gmail 和 Outlook，助手在后台工作时可继续使用原有邮箱。${BRAND_NAME} 也提供网页、桌面和 iPhone 邮件客户端。`,
  },
  {
    question: "Is there a mobile app?",
    answer: (
      <span>
        支持 iOS 和 Android，可随时整理收件箱和管理助手。更多信息请查看{" "}
        <Anchor href="/mobile-app">移动应用</Anchor> page.
      </span>
    ),
    answerText:
      "支持 iOS 和 Android，可随时整理收件箱和管理助手，详情见移动应用页面。",
  },
  {
    question: "Is the code open-source?",
    answer: (
      <span>
        可以通过以下位置查看原始开源项目的源码：{" "}
        <Anchor href="/github" newTab>
          GitHub 仓库
        </Anchor>
        .
      </span>
    ),
    answerText:
      "可通过 GitHub 仓库查看原始开源项目的完整源码。",
  },
  {
    question: "Do you offer refunds?",
    answer: (
      <span>
        如需申请退款，请发送{" "}
        <Anchor href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>email</Anchor>{" "}
        ，并在升级后 14 天内联系服务提供方。
      </span>
    ),
    answerText:
      "如需申请退款，请在升级后 14 天内通过邮件联系服务提供方。",
  },
  {
    question: `Can I try ${BRAND_NAME} for free?`,
    answer:
      "Absolutely! All plans include a 7-day free trial. A credit card is required to start your trial, but you won't be charged until the trial ends. Cancel anytime during the trial to avoid being charged.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs
    .map((faq) => {
      const text = typeof faq.answer === "string" ? faq.answer : faq.answerText;
      if (!text) return null;
      return {
        "@type": "Question" as const,
        name: faq.question,
        acceptedAnswer: { "@type": "Answer" as const, text },
      };
    })
    .filter(Boolean),
};

export function FAQs() {
  return (
    <Section>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify on controlled object is safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SectionHeading>常见问题</SectionHeading>
      <SectionContent>
        <CardWrapper>
          <dl className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <Card
                variant="extra-rounding"
                className="gap-4"
                key={faq.question}
              >
                <CardContent>
                  <Paragraph
                    as="dt"
                    color="gray-900"
                    className="font-semibold tracking-tight mb-4"
                  >
                    {faq.question}
                  </Paragraph>
                  <dd>
                    <Paragraph>{faq.answer}</Paragraph>
                  </dd>
                </CardContent>
              </Card>
            ))}
          </dl>
        </CardWrapper>
      </SectionContent>
    </Section>
  );
}
