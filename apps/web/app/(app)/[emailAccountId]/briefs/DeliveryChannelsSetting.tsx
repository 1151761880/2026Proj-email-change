"use client";

import { useAction } from "next-safe-action/hooks";
import { toastError, toastSuccess } from "@/components/Toast";
import { DeliveryChannelsSetting as SharedDeliveryChannelsSetting } from "@/components/messaging/DeliveryChannelsSetting";
import { useMeetingBriefSettings } from "@/hooks/useMeetingBriefs";
import { useAccount } from "@/providers/EmailAccountProvider";
import { MessagingRoutePurpose } from "@/generated/prisma/enums";
import { updateMeetingBriefsEmailDeliveryAction } from "@/utils/actions/messaging-channels";
import { getActionErrorMessage } from "@/utils/error";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";

export function DeliveryChannelsSetting() {
  const { emailAccountId } = useAccount();
  const analytics = useProductAnalytics("meeting_briefs");
  const {
    data: briefSettings,
    isLoading: isLoadingBriefSettings,
    mutate: mutateBriefSettings,
  } = useMeetingBriefSettings();

  const { execute: executeEmailDelivery } = useAction(
    updateMeetingBriefsEmailDeliveryAction.bind(null, emailAccountId),
    {
      onSuccess: () => {
        analytics.captureAction("meeting_briefs_email_delivery_saved");
        toastSuccess({ description: "设置已保存" });
        mutateBriefSettings();
      },
      onError: (error) => {
        toastError({
          description: getActionErrorMessage(error.error) ?? "Failed to update",
        });
      },
    },
  );

  return (
    <SharedDeliveryChannelsSetting
      title="接收渠道"
      description="选择会前简报的接收位置"
      purpose={MessagingRoutePurpose.MEETING_BRIEFS}
      featureLabel="meeting briefs"
      email={{
        enabled: briefSettings?.meetingBriefsSendEmail ?? true,
        isLoading: isLoadingBriefSettings,
        onChange: (sendEmail) => {
          analytics.captureAction("meeting_briefs_email_delivery_toggled", {
            enabled: sendEmail,
          });
          executeEmailDelivery({ sendEmail });
        },
      }}
      connectSlackCta="Want to receive briefs in Slack?"
    />
  );
}
