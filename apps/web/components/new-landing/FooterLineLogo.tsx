import { BRAND_NAME } from "@/utils/branding";

interface FooterLineLogoProps {
  className?: string;
}

/** 显示与当前品牌一致的页脚装饰字标。 */
export function FooterLineLogo({ className }: FooterLineLogoProps) {
  return (
    <svg
      viewBox="0 0 1400 220"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <text
        x="700"
        y="180"
        textAnchor="middle"
        fontSize="180"
        fontWeight="700"
        fill="currentColor"
        opacity="0.06"
        fontFamily="'Microsoft YaHei', 'PingFang SC', sans-serif"
      >
        {BRAND_NAME}
      </text>
    </svg>
  );
}
