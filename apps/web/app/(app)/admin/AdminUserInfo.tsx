"use client";

import { useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAction } from "next-safe-action/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/Input";
import { toastError } from "@/components/Toast";
import { getActionErrorMessage } from "@/utils/error";
import { adminGetUserInfoAction } from "@/utils/actions/admin";
import {
  getUserInfoBody,
  type GetUserInfoBody,
} from "@/utils/actions/admin.validation";

export function AdminUserInfo() {
  const { execute, isExecuting, result } = useAction(adminGetUserInfoAction, {
    onError: (error) => {
      toastError({
        title: "查找用户失败",
        description: getActionErrorMessage(error.error),
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GetUserInfoBody>({
    resolver: zodResolver(getUserInfoBody),
  });

  const onSubmit: SubmitHandler<GetUserInfoBody> = useCallback(
    (data) => {
      execute({ email: data.email });
    },
    [execute],
  );

  const data = result.data;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>用户信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="email"
            name="email"
            label="邮件"
            placeholder="user@example.com"
            registerProps={register("email")}
            error={errors.email}
          />
          <Button type="submit" loading={isExecuting}>
            查询
          </Button>
        </form>

        {data && (
          <div className="space-y-3 text-sm">
            <InfoRow label="用户 ID" value={data.id} />
            <InfoRow label="创建时间" value={formatDate(data.createdAt)} />
            <InfoRow
              label="最后登录"
              value={data.lastLogin ? formatDate(data.lastLogin) : "Never"}
            />
            <InfoRow
              label="邮箱账户"
              value={String(data.emailAccountCount)}
            />
            <InfoRow
              label="高级版等级"
              value={data.premium?.tier || "None"}
            />
            <InfoRow
              label="管理员授权等级"
              value={data.premium?.adminGrantTier || "None"}
            />
            <InfoRow
              label="管理员授权到期时间"
              value={
                data.premium?.adminGrantExpiresAt
                  ? formatDate(data.premium.adminGrantExpiresAt)
                  : "N/A"
              }
            />
            <InfoRow
              label="订阅状态"
              value={data.premium?.subscriptionStatus || "N/A"}
            />
            <InfoRow
              label="续订时间"
              value={
                data.premium?.renewsAt
                  ? formatDate(data.premium.renewsAt)
                  : "N/A"
              }
            />

            {data.emailAccounts.map((ea) => (
              <div key={ea.email} className="space-y-1 rounded-md border p-3">
                <p className="font-medium">{ea.email}</p>
                <InfoRow label="服务提供商" value={ea.provider} />
                <InfoRow
                  label="未连接"
                  value={ea.disconnected ? "Yes" : "No"}
                />
                <InfoRow label="规则" value={String(ea.ruleCount)} />
                <InfoRow
                  label="最后规则执行时间"
                  value={
                    ea.lastExecutedRuleAt
                      ? formatDate(ea.lastExecutedRuleAt)
                      : "Never"
                  }
                />
                <InfoRow
                  label="监听到期时间"
                  value={
                    ea.watchExpirationDate
                      ? formatDate(ea.watchExpirationDate)
                      : "Not watching"
                  }
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
