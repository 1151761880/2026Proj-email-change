"use client";

import { ChatIllustration } from "@/app/(app)/[emailAccountId]/onboarding/illustrations/ChatIllustration";
import { OnboardingFeatureStep } from "./OnboardingFeatureStep";

export function StepChat({ onNext }: { onNext: () => void }) {
  return (
    <OnboardingFeatureStep
      illustration={<ChatIllustration />}
      title="通过对话管理邮件"
      description={
        "通过这里、Slack 或 Telegram 整理邮件、起草回复和设置规则，需要你处理时会发送提醒。"
      }
      onNext={onNext}
    />
  );
}
