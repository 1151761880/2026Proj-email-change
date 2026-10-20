import { z } from "zod";

const deliveryTimeSchema = z.string().datetime({ offset: true });

export function getReminderAfterSendTimeChange(
  sendAt: string,
  remindAt: string,
) {
  if (
    sendAt &&
    remindAt &&
    new Date(sendAt).getTime() >= new Date(remindAt).getTime()
  ) {
    return "";
  }
  return remindAt;
}

export function parseDeliveryTimes(
  sendAt: string,
  remindAt: string,
):
  | { valid: false; error: string }
  | { valid: true; sendAt: string | null; remindAt: string | null } {
  const sendDate =
    typeof sendAt === "string" && sendAt ? new Date(sendAt) : null;
  const reminderDate =
    typeof remindAt === "string" && remindAt ? new Date(remindAt) : null;
  if (
    typeof sendAt !== "string" ||
    (sendAt && !deliveryTimeSchema.safeParse(sendAt).success)
  ) {
    return {
      valid: false,
      error: "请选择有效发送时间，或清除定时发送以立即发送。",
    };
  }
  if (
    typeof remindAt !== "string" ||
    (remindAt && !deliveryTimeSchema.safeParse(remindAt).success)
  ) {
    return {
      valid: false,
      error: "请选择有效提醒时间，或清除提醒。",
    };
  }
  return {
    valid: true,
    sendAt: sendDate?.toISOString() ?? null,
    remindAt: reminderDate?.toISOString() ?? null,
  };
}
