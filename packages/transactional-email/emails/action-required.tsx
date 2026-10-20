import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { FC } from "react";

export type ActionRequiredEmailProps = {
  baseUrl: string;
  email: string;
  unsubscribeToken: string;
  errorType: string;
  errorMessage: string;
  actionUrl: string;
  actionLabel: string;
};

type ActionRequiredEmailComponent = FC<ActionRequiredEmailProps> & {
  PreviewProps: ActionRequiredEmailProps;
};

const ActionRequiredEmail: ActionRequiredEmailComponent = ({
  baseUrl = "https://www.getinboxzero.com",
  email,
  unsubscribeToken,
  errorType,
  errorMessage,
  actionUrl,
  actionLabel,
}: ActionRequiredEmailProps) => {
  const fullActionUrl = actionUrl.startsWith("http")
    ? actionUrl
    : `${baseUrl}${actionUrl}`;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto w-full max-w-[600px] p-0">
            {/* Header */}
            <Section className="p-4 text-center">
              <Link href={baseUrl} className="text-[15px]">
                <Img
                  src={"https://www.getinboxzero.com/icon.png"}
                  width="40"
                  height="40"
                  alt="十组邮件小助手"
                  className="mx-auto my-0"
                />
              </Link>

              <Text className="mx-0 mb-8 mt-4 p-0 text-center text-2xl font-normal">
                <span className="font-semibold tracking-tighter">
                  十组邮件小助手
                </span>
              </Text>

              <Text className="mx-0 mb-8 mt-0 p-0 text-center text-2xl font-normal text-gray-900">
                需要处理： {errorType}
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-4 pb-4">
              <Text className="text-[16px] text-gray-700 mb-6 mt-0">你好，</Text>

              <Text className="text-[16px] text-gray-700 mb-6 mt-0">
                你的十组邮件小助手账户出现问题（
                <strong>{email}</strong>):
              </Text>

              <Text className="text-[16px] text-gray-700 mb-6 mt-0 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {errorMessage}
              </Text>

              <Text className="text-[16px] text-gray-700 mb-8 mt-0">
                问题解决前，邮件自动化规则和智能助手功能将暂停。
              </Text>

              {/* CTA Button */}
              <Section className="text-center mb-8">
                <Button
                  href={fullActionUrl}
                  className="bg-blue-600 text-white px-8 py-4 rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
                >
                  {actionLabel}
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-500 mb-8 mt-0">
                需要帮助时，请查看支持页面或回复此邮件。
              </Text>
            </Section>

            {/* Footer */}
            <Hr className="border-solid border-gray-200 my-6" />
            <Footer baseUrl={baseUrl} unsubscribeToken={unsubscribeToken} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ActionRequiredEmail;

function Footer({
  baseUrl,
  unsubscribeToken,
}: {
  baseUrl: string;
  unsubscribeToken: string;
}) {
  return (
    <Section className="mt-8 text-center text-sm text-gray-500">
      <Text className="m-0">
        由于邮箱已连接十组邮件小助手，你收到此邮件。
      </Text>
      <div className="mt-2">
        <Link
          href={`${baseUrl}/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`}
          className="text-gray-500 underline mr-4"
        >
          退订
        </Link>
        <Link
          href={`${baseUrl}/support`}
          className="text-gray-500 underline mr-4"
        >
          支持
        </Link>
        <Link href={`${baseUrl}/privacy`} className="text-gray-500 underline">
          隐私政策
        </Link>
      </div>
    </Section>
  );
}

ActionRequiredEmail.PreviewProps = {
  baseUrl: "https://www.getinboxzero.com",
  email: "user@example.com",
  unsubscribeToken: "preview-token-123",
  errorType: "API Key Issue",
  errorMessage:
    "OpenAI API 密钥无效，请在设置中更新以继续使用 AI 功能。",
  actionUrl: "/settings",
  actionLabel: "更新 API 密钥",
};
