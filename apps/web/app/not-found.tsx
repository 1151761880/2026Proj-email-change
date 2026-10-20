"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ErrorPage } from "@/components/ErrorPage";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { Button } from "@/components/ui/button";
import { createClientLogger } from "@/utils/logger-client";

const logger = createClientLogger("not-found");

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    logger.warn("Page not found", { pathname });
  }, [pathname]);

  return (
    <BasicLayout>
      <ErrorPage
        title="页面不存在"
        description="请求的页面不存在。可返回首页或查看使用文档。"
        button={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/">返回首页</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/llms.txt">助手使用说明</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="https://docs.getinboxzero.com">使用文档</Link>
            </Button>
          </div>
        }
      />
    </BasicLayout>
  );
}
