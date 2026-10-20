import { Button } from "@/components/Button";
import { PageHeading, TypographyP } from "@/components/Typography";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { CardBasic } from "@/components/ui/card";

// same component as not-found
export default function ThankYouPage() {
  return (
    <BasicLayout>
      <div className="pb-40 pt-60">
        <CardBasic className="mx-auto max-w-xl text-center">
          <PageHeading>感谢使用！</PageHeading>
          <div className="mt-2">
            <TypographyP>
              高级版购买成功，感谢支持！
            </TypographyP>
          </div>
          <Button className="mt-4" size="xl" link={{ href: "/setup" }}>
            继续
          </Button>
        </CardBasic>
      </div>
    </BasicLayout>
  );
}
