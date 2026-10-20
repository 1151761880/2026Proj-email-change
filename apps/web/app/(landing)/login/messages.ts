import { BRAND_NAME, SUPPORT_EMAIL } from "@/utils/branding";

export function getRequiresReconsentDescription(options?: {
  includeSupportText?: boolean;
}) {
  const description = `请重新登录并批准全部请求权限。若 Microsoft 365 组织需要管理员批准，请先联系管理员为 ${BRAND_NAME} 授权。`;

  if (!options?.includeSupportText || !SUPPORT_EMAIL) return description;

  return `${description} 若问题持续，请联系支持：${SUPPORT_EMAIL}`;
}

export function getEmailAlreadyLinkedDescription(options?: {
  includeSupportText?: boolean;
}) {
  const description = `此邮箱已关联其他 ${BRAND_NAME} 账户。请使用原账户登录，必要时在账户页面重新连接邮箱。无法访问原账户或疑似重复账户时，请联系管理员恢复或合并。`;

  if (!options?.includeSupportText || !SUPPORT_EMAIL) return description;

  return `${description} 可使用支持对话或发送邮件至 ${SUPPORT_EMAIL}。`;
}
