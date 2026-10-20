"use client";

import { CrownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionCard } from "@/components/ui/card";
import { usePremiumModal } from "@/app/(app)/premium/PremiumModal";

export function IntegrationsPremiumAlert() {
  const { PremiumModal, openModal } = usePremiumModal();

  return (
    <>
      <ActionCard
        icon={<CrownIcon className="h-5 w-5" />}
        title="需要进阶版"
        description="连接 CRM 等工具，帮助 AI 起草更准确的回复和更丰富的会前简报。"
        action={
          <Button variant="primaryBlack" onClick={openModal}>
            升级
          </Button>
        }
      />
      <PremiumModal />
    </>
  );
}
