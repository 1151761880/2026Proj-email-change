"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SettingCard } from "@/components/SettingCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AboutSection } from "@/app/(app)/[emailAccountId]/settings/AboutSectionForm";

export function AboutSetting() {
  const [open, setOpen] = useState(false);

  return (
    <SettingCard
      title="个人指令"
      description="告诉 AI 你的情况及希望如何处理邮件。"
      right={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              编辑
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>个人指令</DialogTitle>
              <DialogDescription>
                告诉 AI 你的情况及希望如何处理邮件。
              </DialogDescription>
            </DialogHeader>

            <AboutSection onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      }
    />
  );
}
