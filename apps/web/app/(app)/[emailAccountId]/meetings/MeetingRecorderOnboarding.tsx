"use client";

import { useState } from "react";
import {
  CheckIcon,
  ListChecksIcon,
  MailPlusIcon,
  MicIcon,
  ShieldIcon,
} from "lucide-react";
import { RadioCardGroup } from "@/components/RadioCardGroup";
import { SetupCard } from "@/components/SetupCard";
import {
  MessageText,
  MutedText,
  PageHeading,
  TextLink,
} from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { MeetingJoinRule } from "@/generated/prisma/enums";
import { useAccount } from "@/providers/EmailAccountProvider";
import { getMeetingBotDisplayName } from "@/utils/meeting-recorder/bot-provider";
import { ConnectCalendar } from "@/app/(app)/[emailAccountId]/calendars/ConnectCalendar";
import { JOIN_RULE_OPTIONS } from "@/app/(app)/[emailAccountId]/meetings/join-rule-options";

const features = [
  {
    icon: <MicIcon className="size-4 text-blue-500" />,
    title: "笔记和文字记录",
    description: "每次会议的摘要",
  },
  {
    icon: <ListChecksIcon className="size-4 text-blue-500" />,
    title: "附有负责人的待办事项",
    description: "记录决策及负责人",
  },
  {
    icon: <MailPlusIcon className="size-4 text-blue-500" />,
    title: "自动起草跟进邮件",
    description: "保存在草稿箱，等待你确认发送",
  },
];

export function MeetingRecorderOnboarding({
  emailAccountId,
  hasCalendarConnected,
  onEnable,
  isEnabling,
}: {
  emailAccountId: string;
  hasCalendarConnected: boolean;
  onEnable: (joinRule: MeetingJoinRule) => void;
  isEnabling: boolean;
}) {
  const [joinRule, setJoinRule] = useState<MeetingJoinRule | null>(null);

  // Nothing is written until the second step, so leaving the flow part way
  // through does not enable anything.
  if (joinRule !== null) {
    return (
      <ChooseJoinRule
        emailAccountId={emailAccountId}
        joinRule={joinRule}
        onChange={setJoinRule}
        onConfirm={() => onEnable(joinRule)}
        isEnabling={isEnabling}
      />
    );
  }

  return (
    <SetupCard
      imageSrc="/images/illustrations/calling-help.svg"
      imageAlt="Meeting notetaker"
      title="自动记录会议笔记"
      description="十组邮件小助手参加会议、记录笔记并起草跟进邮件。"
      features={features}
    >
      {hasCalendarConnected ? (
        <Button onClick={() => setJoinRule(MeetingJoinRule.ALL)}>
          开始使用
        </Button>
      ) : (
        <>
          <MessageText>连接日历后即可开始：</MessageText>
          <ConnectCalendar
            analyticsPage="meetings"
            onboardingReturnPath={`/${emailAccountId}/meetings`}
          />
        </>
      )}
    </SetupCard>
  );
}

function ChooseJoinRule({
  emailAccountId,
  joinRule,
  onChange,
  onConfirm,
  isEnabling,
}: {
  emailAccountId: string;
  joinRule: MeetingJoinRule;
  onChange: (rule: MeetingJoinRule) => void;
  onConfirm: () => void;
  isEnabling: boolean;
}) {
  const { emailAccount, userEmail } = useAccount();
  const botName = getMeetingBotDisplayName({
    ownerName: emailAccount?.name ?? null,
    ownerEmail: userEmail,
  });

  return (
    <div className="mx-4 mt-16 flex max-w-lg flex-col gap-6 md:mx-auto">
      <div className="flex flex-col gap-3">
        <PageHeading>需要参加哪些会议？</PageHeading>

        <MutedText className="flex flex-wrap items-center gap-x-2">
          <CheckIcon className="size-4 shrink-0 text-green-600" />
          {userEmail} connected
          <TextLink href={`/${emailAccountId}/calendars`}>修改</TextLink>
        </MutedText>
      </div>

      <RadioCardGroup
        name="joinRule"
        ariaLabel="参加的会议范围"
        value={joinRule}
        onChange={onChange}
        options={JOIN_RULE_OPTIONS}
        disabled={isEnabling}
      />

      <Button className="self-start" loading={isEnabling} onClick={onConfirm}>
        开始记录我的会议
      </Button>

      <MutedText className="flex items-start gap-2 text-xs">
        <ShieldIcon className="mt-0.5 size-3.5 shrink-0" />
        会议助手将以可见参会者身份加入，名称： {botName}.
      </MutedText>
    </div>
  );
}
