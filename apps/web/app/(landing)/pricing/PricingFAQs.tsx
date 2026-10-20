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

const pricingFaqs: {
  question: string;
  answer: React.ReactNode;
  answerText?: string;
}[] = [
  {
    question: `Can I try ${BRAND_NAME} for free?`,
    answer: "Yes! All plans include a 7-day free trial.",
  },
  {
    question: "Can I switch between plans?",
    answer:
      "Yes, you can upgrade or downgrade at any time. Changes take effect immediately and billing is prorated.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards through Stripe.",
  },
  {
    question: "Do you offer annual discounts?",
    answer: "Yes! Save up to 20% by choosing annual billing on any plan.",
  },
  {
    question:
      "Do you offer discounts for students, nonprofits, or open-source projects?",
    answer: (
      <span>
        请发送{" "}
        <Anchor href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>email</Anchor>{" "}
        ，联系服务提供方了解优惠方案。
      </span>
    ),
    answerText:
      "请通过邮件联系服务提供方了解优惠方案。",
  },
  {
    question: "What happens if I cancel?",
    answer:
      "You can cancel anytime. Your subscription will remain active until the end of the billing period.",
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
    question: "Need a custom plan for your enterprise?",
    answer: (
      <span>
        <Anchor href="https://www.getinboxzero.com/sales">
          联系销售团队
        </Anchor>{" "}
        了解定制价格、单点登录、SCIM、本地部署和专属支持。
      </span>
    ),
    answerText:
      "联系销售团队了解定制价格、单点登录、SCIM、本地部署和专属支持。",
  },
];

const pricingFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: pricingFaqs
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

export function PricingFAQs() {
  return (
    <Section>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify on controlled object is safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqJsonLd) }}
      />
      <SectionHeading>价格常见问题</SectionHeading>
      <SectionContent>
        <CardWrapper>
          <dl className="grid md:grid-cols-2 gap-6">
            {pricingFaqs.map((faq) => (
              <Card
                variant="extra-rounding"
                className="gap-4"
                key={typeof faq.question === "string" ? faq.question : ""}
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
