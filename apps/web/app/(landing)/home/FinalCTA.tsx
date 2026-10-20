import { CallToAction } from "@/components/new-landing/CallToAction";
import { PatternBanner } from "@/components/new-landing/PatternBanner";
import { BRAND_NAME } from "@/utils/branding";

export function FinalCTA() {
  return (
    <PatternBanner
      title={
        <>
          节省每天处理邮件的时间。
          <br />
          {`开始使用 ${BRAND_NAME}。`}
        </>
      }
      subtitle="减少邮件处理时间，专注更重要的工作。"
    >
      <CallToAction
        text="免费开始"
        buttonSize="lg"
        className="mt-6"
      />
    </PatternBanner>
  );
}
