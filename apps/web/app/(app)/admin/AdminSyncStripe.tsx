"use client";

import { useAction } from "next-safe-action/hooks";
import {
  adminSyncStripeForAllUsersAction,
  adminSyncAllStripeCustomersToDbAction,
  adminBackfillPremiumAdminsAction,
} from "@/utils/actions/admin";
import { Button } from "@/components/ui/button";
import { toastError, toastSuccess } from "@/components/Toast";
import { getActionErrorMessage } from "@/utils/error";

export const AdminSyncStripe = () => {
  const { execute, isExecuting } = useAction(adminSyncStripeForAllUsersAction, {
    onSuccess: () => {
      toastSuccess({
        title: "Stripe 已同步",
        description: "Stripe 已同步",
      });
    },
    onError: (error) => {
      toastError({
        title: "同步 Stripe 失败",
        description: getActionErrorMessage(error.error),
      });
    },
  });

  return (
    <Button onClick={() => execute()} loading={isExecuting} variant="outline">
      同步 Stripe
    </Button>
  );
};

export const AdminBackfillPremiumAdmins = () => {
  const { execute, isExecuting } = useAction(adminBackfillPremiumAdminsAction, {
    onSuccess: (result) => {
      toastSuccess({
        title: "高级版管理员已补齐",
        description: `已补齐 ${result.data?.backfilled ?? 0} 个高级版账户，跳过 ${result.data?.skipped ?? 0} 个`,
      });
    },
    onError: (error) => {
      toastError({
        title: "补齐高级版管理员失败",
        description: getActionErrorMessage(error.error),
      });
    },
  });

  return (
    <Button onClick={() => execute()} loading={isExecuting} variant="outline">
      补齐高级版管理员
    </Button>
  );
};

export const AdminSyncStripeCustomers = () => {
  const { execute, isExecuting } = useAction(
    adminSyncAllStripeCustomersToDbAction,
    {
      onSuccess: (result) => {
        toastSuccess({
          title: "Stripe 客户已同步",
          description:
            result.data?.success || "All Stripe customers synced to database",
        });
      },
      onError: (error) => {
        toastError({
          title: "同步 Stripe 客户失败",
          description: getActionErrorMessage(error.error),
        });
      },
    },
  );

  return (
    <Button onClick={() => execute()} loading={isExecuting} variant="outline">
      将全部 Stripe 客户同步到数据库
    </Button>
  );
};
