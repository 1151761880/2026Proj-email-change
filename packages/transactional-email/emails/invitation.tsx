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

export type InvitationEmailProps = {
  baseUrl: string;
  organizationName: string;
  inviterName: string;
  invitationId: string;
  unsubscribeToken: string;
};

type InvitationEmailComponent = FC<InvitationEmailProps> & {
  PreviewProps: InvitationEmailProps;
};

const InvitationEmail: InvitationEmailComponent = ({
  baseUrl = "https://www.getinboxzero.com",
  organizationName,
  inviterName,
  invitationId,
  unsubscribeToken,
}: InvitationEmailProps) => {
  const acceptUrl = `${baseUrl}/organizations/invitations/${invitationId}/accept`;

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

              <Text className="mx-0 mb-8 mt-0 p-0 text-center text-2xl font-normal">
                你受邀加入 {organizationName}
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-4 pb-4">
              <Text className="text-[18px] text-gray-900 mb-6 mt-0 text-center">
                邀请人： {inviterName} 邀请加入 {organizationName}.
              </Text>

              <Text className="text-[16px] text-gray-700 mb-8 mt-0 text-center">
                接受邀请请点击下方按钮：
              </Text>

              {/* CTA Button */}
              <Section className="text-center mb-8">
                <Button
                  href={acceptUrl}
                  className="bg-blue-600 text-white px-8 py-4 rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
                >
                  接受邀请
                </Button>
              </Section>
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

export default InvitationEmail;

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
        你受邀加入十组邮件小助手中的组织，因此收到此邮件。
      </Text>
      <div className="mt-2">
        <Link
          href={`${baseUrl}/api/unsubscribe?token=${unsubscribeToken}`}
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

InvitationEmail.PreviewProps = {
  baseUrl: "https://www.getinboxzero.com",
  organizationName: "Apple Inc.",
  inviterName: "Eduardo Lelis",
  invitationId: "cmf5pzul7000lf1zrlatybrr7",
  unsubscribeToken: "preview-token-123",
};
