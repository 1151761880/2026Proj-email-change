import Image from "next/image";
import { BRAND_LOGO_URL, BRAND_NAME } from "@/utils/branding";

interface LogoProps {
  className?: string;
}

/** 渲染配置的品牌图片或中文邮件助手字标。 */
export function Logo({ className }: LogoProps) {
  if (BRAND_LOGO_URL) {
    return (
      <Image
        src={BRAND_LOGO_URL}
        alt={`${BRAND_NAME} 标志`}
        width={224}
        height={28}
        className={className}
        unoptimized
      />
    );
  }

  return (
    <svg viewBox="0 0 224 28" fill="none" className={className} role="img">
      <title>{BRAND_NAME}</title>
      <rect
        x="1"
        y="4"
        width="25"
        height="20"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m2 6 11.5 9L25 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <text
        x="34"
        y="22"
        fill="currentColor"
        fontSize="24"
        fontWeight="600"
        fontFamily="'Microsoft YaHei', 'PingFang SC', sans-serif"
        textLength="188"
        lengthAdjust="spacingAndGlyphs"
      >
        {BRAND_NAME}
      </text>
    </svg>
  );
}
