import type { Metadata } from "next";
import Link from "next/link";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { ErrorPage } from "@/components/ErrorPage";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "更新十组邮件小助手桌面端",
};

export default function DesktopUpdateRequiredPage() {
  return (
    <BasicLayout>
      <ErrorPage
        title="更新桌面应用后登录"
        description="此版本的十组邮件小助手桌面端已无法完成登录。请下载最新版本，重新打开后登录。"
        button={
          <Button asChild>
            <Link href="/desktop">下载最新桌面应用</Link>
          </Button>
        }
      />
    </BasicLayout>
  );
}
