"use client";

import Image from "next/image";
import { NotepadTextIcon } from "lucide-react";
import { PageHeading, TypographyP } from "@/components/Typography";
import { IconCircle } from "@/app/(app)/[emailAccountId]/onboarding/IconCircle";
import { OnboardingWrapper } from "@/app/(app)/[emailAccountId]/onboarding/OnboardingWrapper";
import { ContinueButton } from "@/app/(app)/[emailAccountId]/onboarding/ContinueButton";

export function StepCustomRules({
  onNext,
}: {
  provider: string;
  onNext: () => void;
}) {
  return (
    <div className="relative">
      <div className="xl:pr-[50%]">
        <OnboardingWrapper className="py-0">
          <IconCircle size="lg" className="mx-auto">
            <NotepadTextIcon className="size-6" />
          </IconCircle>

          <div className="text-center mt-4 max-w-lg mx-auto">
            <PageHeading>自定义规则</PageHeading>
            <TypographyP className="mt-2 text-left">
              基础配置已完成。你可以进一步设置助手需要处理的邮件流程。
            </TypographyP>
            <TypographyP className="mt-2 text-left">例如：</TypographyP>
            <ul className="list-disc list-inside space-y-1 text-left leading-7 text-muted-foreground ">
              <li>将收据转发给会计</li>
              <li>为订阅邮件添加标签，一周后归档</li>
            </ul>
          </div>

          <div className="flex w-full max-w-xs mx-auto">
            <ContinueButton
              onClick={onNext}
              size="default"
              className="w-full"
            />
          </div>
        </OnboardingWrapper>
      </div>

      <div className="fixed top-0 right-0 w-1/2 h-screen bg-white items-center justify-center hidden xl:flex px-10">
        <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200">
          <Image
            src="/images/onboarding/custom-rules.png"
            alt="自定义规则"
            width={1200}
            height={800}
            className="rounded-xl border border-slate-200"
          />
        </div>
      </div>
    </div>
  );
}
