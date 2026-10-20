import { differenceInDays } from "date-fns/differenceInDays";

type ShareParams = {
  senderCount: number;
  link: string;
  yearlyEmails?: number | null;
};

export function buildShareText({
  senderCount,
  link,
  yearlyEmails,
}: ShareParams): string {
  const lists = senderCount === 1 ? "email list" : "email lists";
  const base = `I just unsubscribed from ${senderCount} ${lists} with 十组邮件小助手`;
  if (yearlyEmails != null) {
    return `${base}，每年约减少 ${yearlyEmails.toLocaleString("zh-CN")} 封邮件。${link}`;
  }
  return `${base}. ${link}`;
}

export function buildXShareUrl(params: ShareParams): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(buildShareText(params))}`;
}

export function buildLinkedInShareUrl(params: ShareParams): string {
  return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(buildShareText(params))}`;
}

// Projects how many emails these senders would have sent over a year, based on
// how often they emailed during the selected range. This future saving is the
// real win, not the handful of emails from the past few months.
export function projectYearlyEmails({
  emailCount,
  dateRange,
}: {
  emailCount: number;
  dateRange?: { from?: Date; to?: Date };
}): number | null {
  if (emailCount <= 0) return null;
  if (!dateRange?.from || !dateRange?.to) return null;
  const days = differenceInDays(dateRange.to, dateRange.from);
  if (days <= 0) return null;
  return roundEstimate((emailCount * 365) / days);
}

export function buildCelebrationSubline({
  emailCount,
  dateRange,
}: {
  emailCount: number;
  dateRange?: { from?: Date; to?: Date };
}): string {
  const yearlyEmails = projectYearlyEmails({ emailCount, dateRange });
  if (yearlyEmails != null) {
    return `按当前频率估算，每年约减少 ${yearlyEmails.toLocaleString("zh-CN")} 封邮件。`;
  }
  if (emailCount > 0) {
    return `将不再收到这 ${emailCount.toLocaleString("zh-CN")} 封邮件。`;
  }
  return "这些发件人的邮件将不再进入收件箱。";
}

function roundEstimate(value: number): number {
  if (value >= 1000) return Math.round(value / 100) * 100;
  if (value >= 100) return Math.round(value / 10) * 10;
  return Math.round(value);
}
