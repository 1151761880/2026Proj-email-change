import { AuthCallbackHandoff } from "./AuthCallbackHandoff";
import { getInboxZeroCustomSchemeCallbackUrl } from "@/utils/mobile-auth/app-callback-url";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const appUrl = getInboxZeroCustomSchemeCallbackUrl(await searchParams);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      {appUrl ? <AuthCallbackHandoff href={appUrl} /> : null}
      <p className="text-muted-foreground text-sm">
        返回十组邮件小助手完成登录。
      </p>
      {appUrl ? (
        <a
          href={appUrl}
          className="text-sm font-medium text-foreground underline underline-offset-4"
        >
          打开十组邮件小助手
        </a>
      ) : null}
    </main>
  );
}
