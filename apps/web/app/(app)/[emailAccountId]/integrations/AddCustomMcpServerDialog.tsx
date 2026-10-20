"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { Input } from "@/components/Input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MutedText } from "@/components/Typography";
import { toastError, toastSuccess } from "@/components/Toast";
import { useDialogState } from "@/hooks/useDialogState";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useAccount } from "@/providers/EmailAccountProvider";
import { createCustomMcpServerAction } from "@/utils/actions/mcp";
import {
  createCustomMcpServerBody,
  type CreateCustomMcpServerBody,
} from "@/utils/actions/mcp.validation";
import { getActionErrorMessage } from "@/utils/error";
import { startMcpOAuth } from "./startMcpOAuth";

export function AddCustomMcpServerDialog() {
  const { emailAccountId } = useAccount();
  const { mutate } = useIntegrations();
  const { isOpen, onToggle, onClose } = useDialogState();

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateCustomMcpServerBody>({
    resolver: zodResolver(createCustomMcpServerBody),
    defaultValues: { authType: "oauth" },
  });

  const authType = watch("authType");

  const { execute, isExecuting } = useAction(
    createCustomMcpServerAction.bind(null, emailAccountId),
    {
      onSuccess: async ({ data, input }) => {
        mutate();
        reset();
        onClose();

        if (input.authType !== "oauth") {
          toastSuccess({ description: "服务器已添加" });
          return;
        }

        if (!data?.name) return;

        try {
          await startMcpOAuth({
            integrationName: data.name,
            emailAccountId,
          });
        } catch (error) {
          toastError({
            title: "连接服务器失败",
            description:
              error instanceof Error && error.message
                ? error.message
                : "Please try again or contact support if the issue persists.",
          });
        }
      },
      onError: (error) => {
        toastError({ description: getActionErrorMessage(error.error) });
      },
    },
  );

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>
        <Button variant="outline">添加自定义服务器</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加自定义服务器</DialogTitle>
          <DialogDescription>
            连接自己的远程 MCP 服务器，为草稿提供资料。
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(execute)}>
          <Input
            type="text"
            name="displayName"
            label="名称"
            placeholder="知识库"
            registerProps={register("displayName")}
            error={errors.displayName}
          />
          <Input
            type="text"
            name="serverUrl"
            label="服务器地址"
            placeholder="https://mcp.example.com/mcp"
            registerProps={register("serverUrl")}
            error={errors.serverUrl}
          />

          <div className="space-y-1">
            <label className="font-medium text-sm" htmlFor="authType">
              身份验证
            </label>
            <Controller
              name="authType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="authType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oauth">OAuth</SelectItem>
                    <SelectItem value="api-token">API 密钥</SelectItem>
                    <SelectItem value="none">无</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {authType === "api-token" && (
            <Input
              type="password"
              name="apiKey"
              label="API 密钥"
              registerProps={register("apiKey")}
              error={errors.apiKey}
            />
          )}

          <MutedText>
            只读工具会自动启用，其他工具需要手动启用。
          </MutedText>

          <DialogFooter>
            <Button type="submit" loading={isExecuting}>
              添加服务器
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
