import type { TriageMessage } from "./schema";

/** Create a fresh copy of the task sheet's synthetic M01–M12 mailbox. */
export function createTriageFixtureMessages(): TriageMessage[] {
  return [
    [
      "M01",
      "advisor@lab.test",
      "组会确认",
      "请在10月11日18:00前回复是否参加本周组会。",
      false,
    ],
    [
      "M02",
      "library@school.test",
      "图书馆开放时间",
      "本周末图书馆开放时间为9:00—17:00，无须回复。",
      false,
    ],
    [
      "M03",
      "promo@shop.test",
      "周末购物优惠",
      "本周末下单立减20元，点此领取优惠券。",
      false,
    ],
    [
      "M04",
      "promo@shop.test",
      "开学季折扣",
      "开学季限时领券，购买指定商品享折扣。",
      true,
    ],
    [
      "M05",
      "course@school.test",
      "作业提交提醒",
      "请于10月12日23:59前上传课程作业。",
      false,
    ],
    [
      "M06",
      "events@school.test",
      "学术报告信息",
      "学术报告将于周五下午举行，此邮件仅供了解，无须报名。",
      false,
    ],
    [
      "M07",
      "training@school.test",
      "培训确认",
      "请于10月15日前确认是否参加培训。",
      false,
    ],
    [
      "M08",
      "digest@tech.test",
      "技术周报",
      "本周技术动态摘要如下，供阅读，无须回复。",
      false,
    ],
    [
      "M09",
      "sales@market.test",
      "限时特惠",
      "限时抢购，点击购买即享特价！",
      false,
    ],
    [
      "M10",
      "team@lab.test",
      "实验安排确认",
      "请在明日中午前回复是否参与实验排班。",
      false,
    ],
    [
      "M11",
      "it@school.test",
      "系统维护公告",
      "今晚23:00进行系统维护，仅作通知，无须操作。",
      false,
    ],
    [
      "M12",
      "membership@cloud.test",
      "会员折扣推广",
      "云盘会员限时促销，点击续费立享折扣。",
      false,
    ],
  ].map(([id, from, subject, body, starred]) => ({
    id: id as string,
    from: from as string,
    subject: subject as string,
    body: body as string,
    starred: starred as boolean,
    inbox: true,
  }));
}
