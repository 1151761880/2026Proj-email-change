// Define the steps of the flow
export enum CleanStep {
  INTRO = 0,
  ARCHIVE_OR_READ = 1,
  TIME_RANGE = 2,
  LABEL_OPTIONS = 3,
  FINAL_CONFIRMATION = 4,
}

export const timeRangeOptions = [
  { value: "0", label: "全部邮件" },
  { value: "1", label: "一天前" },
  { value: "3", label: "三天前" },
  { value: "7", label: "一周前", recommended: true },
  { value: "14", label: "两周前" },
  { value: "30", label: "一个月前" },
  { value: "90", label: "三个月前" },
  { value: "365", label: "一年前" },
];
