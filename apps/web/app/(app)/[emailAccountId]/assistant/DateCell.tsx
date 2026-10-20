import { Tooltip } from "@/components/Tooltip";
import { EmailDate } from "@/components/email-list/EmailDate";

export function DateCell({ createdAt }: { createdAt: Date }) {
  return (
    <div className="whitespace-nowrap">
      <Tooltip content={new Date(createdAt).toLocaleString("zh-CN")}>
        <EmailDate date={new Date(createdAt)} />
      </Tooltip>
    </div>
  );
}
