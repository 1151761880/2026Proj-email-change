"use client";

import Link from "next/link";
import { EarlyAccessFeatures } from "@/app/(app)/early-access/EarlyAccessFeatures";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isGoogleProvider } from "@/utils/email/provider-types";
import { prefixPath } from "@/utils/path";
import { useAccount } from "@/providers/EmailAccountProvider";

export default function RequestAccessPage() {
  const { emailAccountId, provider } = useAccount();

  return (
    <div className="container px-2 pt-2 sm:px-4 sm:pt-8">
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-8">
        <EarlyAccessFeatures />
        <Card>
          <CardHeader>
            <CardTitle>邮箱</CardTitle>
            <CardDescription>
              在十组邮件小助手中打开收件箱。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailAccountId ? (
              <Button asChild>
                <Link href={prefixPath(emailAccountId, "/mail")}>
                  打开邮箱
                </Link>
              </Button>
            ) : (
              <Button disabled>打开邮箱</Button>
            )}
          </CardContent>
        </Card>
        {isGoogleProvider(provider) && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>发件人分类</CardTitle>
                <CardDescription>
                  按发件人对邮件分类，并执行批量操作或应用规则。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/smart-categories">发件人分类</Link>
                </Button>
              </CardContent>
            </Card>
            {/* <Card>
              <CardHeader>
                <CardTitle>Bulk archive</CardTitle>
                <CardDescription>
                  Archive emails from multiple senders at once, organized by
                  category.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/bulk-archive">Bulk Archive</Link>
                </Button>
              </CardContent>
            </Card> */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Quick bulk archive</CardTitle>
                <CardDescription>
                  Quickly archive emails from multiple senders at once, grouped
                  by AI confidence level.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/quick-bulk-archive">Quick Bulk Archive</Link>
                </Button>
              </CardContent>
            </Card> */}
          </>
        )}
        <Card>
          <CardHeader>
            <CardTitle>抢先体验</CardTitle>
            <CardDescription>
              告诉我们你希望增加的功能。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/waitlist" target="_blank">
                反馈表单
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
