import type { Metadata } from "next";
import Link from "next/link";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { ErrorPage } from "@/components/ErrorPage";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "应用登录未完成",
};

export default function AppSignInErrorPage() {
  return (
    <BasicLayout>
      <ErrorPage
        title="应用登录未完成"
        description="请返回应用重新登录。若十组邮件小助手桌面端持续出现此问题，请安装最新版本。"
        button={
          <Button asChild>
            <Link href="/desktop">获取最新桌面应用</Link>
          </Button>
        }
      />
    </BasicLayout>
  );
}
