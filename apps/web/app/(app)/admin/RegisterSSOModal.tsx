"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useCallback } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { ErrorMessage, Input, Label } from "@/components/Input";
import { toastError, toastSuccess } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { registerSSOProviderAction } from "@/utils/actions/sso";
import {
  type SsoRegistrationBody,
  ssoRegistrationBody,
} from "@/utils/actions/sso.validation";
import { useDialogState } from "@/hooks/useDialogState";

export function RegisterSSOModal() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SsoRegistrationBody>({
    resolver: zodResolver(ssoRegistrationBody),
  });

  const { isOpen, onToggle, onClose } = useDialogState();

  const { executeAsync: executeRegisterSSO, isExecuting } = useAction(
    registerSSOProviderAction,
  );

  const onSubmit: SubmitHandler<SsoRegistrationBody> = useCallback(
    async (data) => {
      const result = await executeRegisterSSO(data);

      if (result?.serverError) {
        toastError({
          title: "注册单点登录失败",
          description: result.serverError,
        });
      } else {
        toastSuccess({
          title: "单点登录已注册",
          description: `ACS 地址：${result?.data?.callbackUrl}`,
        });
        reset();
        onClose();
      }
    },
    [executeRegisterSSO, reset, onClose],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>
        <Button>注册单点登录服务</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>企业单点登录注册（SAML）</DialogTitle>
          <DialogDescription>
            为组织配置 SAML 单点登录，团队成员可使用对应身份服务登录。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Input
              type="text"
              name="organizationName"
              label="组织名称"
              placeholder="例如：公司名称"
              registerProps={register("organizationName")}
              error={errors.organizationName}
            />

            <Input
              type="text"
              name="organizationId"
              label="现有组织 ID（可选）"
              placeholder="关联现有组织的单点登录时必填"
              registerProps={register("organizationId", {
                setValueAs: (value) => value || undefined,
              })}
              error={errors.organizationId}
            />

            <Input
              type="text"
              name="providerId"
              label="服务提供商 ID"
              placeholder="e.g., your-company-saml"
              registerProps={register("providerId")}
              error={errors.providerId}
            />

            <Input
              type="text"
              name="domain"
              label="域名"
              placeholder="e.g., your-company.com"
              registerProps={register("domain")}
              error={errors.domain}
            />

            <div className="space-y-2">
              <Label name="idpMetadata" label="身份服务元数据（XML）" />
              <AutosizeTextarea
                id="idpMetadata"
                minRows={3}
                rows={3}
                {...register("idpMetadata")}
                placeholder="在此粘贴身份服务提供的 SAML 元数据 XML。"
              />
              {errors.idpMetadata && (
                <ErrorMessage message={errors.idpMetadata.message ?? ""} />
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button type="submit" loading={isExecuting}>
              注册单点登录
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
