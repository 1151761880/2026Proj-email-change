"use client";

import { SettingCard } from "@/components/SettingCard";
import { SnippetsManager } from "@/components/snippets/SnippetsManager";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SnippetsSetting() {
  return (
    <SettingCard
      description="输入 / 和快捷名称，在草稿中插入已保存的回复。"
      right={
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              管理
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>快捷片段</DialogTitle>
              <DialogDescription>
                写邮件时输入 / 即可插入已保存的回复。
              </DialogDescription>
            </DialogHeader>
            <SnippetsManager />
          </DialogContent>
        </Dialog>
      }
      title="快捷片段"
    />
  );
}
