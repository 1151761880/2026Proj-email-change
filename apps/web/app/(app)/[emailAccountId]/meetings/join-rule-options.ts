import { MeetingJoinRule } from "@/generated/prisma/enums";

export const JOIN_RULE_OPTIONS = [
  { value: MeetingJoinRule.ALL, label: "所有包含视频链接的会议" },
  {
    value: MeetingJoinRule.EXTERNAL_ONLY,
    label: "仅包含公司外部人员的会议",
  },
  { value: MeetingJoinRule.HOST_ONLY, label: "仅我组织的会议" },
  { value: MeetingJoinRule.OFF, label: "仅我手动启用的会议" },
];
