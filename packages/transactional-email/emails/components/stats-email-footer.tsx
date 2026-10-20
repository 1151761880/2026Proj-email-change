import { Link, Section, Text } from "@react-email/components";

export function StatsEmailFooter({
  baseUrl,
  unsubscribeToken,
}: {
  baseUrl: string;
  unsubscribeToken: string;
}) {
  return (
    <Section>
      <Text>
        你已订阅十组邮件小助手统计更新，可在以下位置修改：{" "}
        <Link
          href={`${baseUrl}/settings#email-updates`}
          className="text-[15px]"
        >
          设置
        </Link>
        .
      </Text>

      <Link
        href={`${baseUrl}/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`}
        className="text-[15px]"
      >
        退订此类邮件
      </Link>
    </Section>
  );
}
