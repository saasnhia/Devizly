interface DevizlyLogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
}

function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Rounded square background */}
      <rect width="48" height="48" rx="12" fill="currentColor" className="text-primary" />
      {/* Document shape */}
      <path
        d="M14 12C14 10.8954 14.8954 10 16 10H27L34 17V36C34 37.1046 33.1046 38 32 38H16C14.8954 38 14 37.1046 14 36V12Z"
        fill="white"
        opacity="0.9"
      />
      {/* Document fold */}
      <path
        d="M27 10V17H34"
        fill="none"
        stroke="white"
        strokeWidth="0.5"
        opacity="0.5"
      />
      {/* Lightning bolt / AI spark */}
      <path
        d="M25 18L20 26H24L22 34L29 24H25L27 18Z"
        fill="currentColor"
        className="text-primary"
      />
    </svg>
  );
}

export function DevizlyLogo({
  width = 140,
  height = 36,
  className = "",
  showText = true,
}: DevizlyLogoProps) {
  const iconSize = Math.min(height, 36);

  if (!showText) {
    return <LogoMark size={iconSize} className={className} />;
  }

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      style={{ width, height }}
    >
      <LogoMark size={iconSize} />
      <span
        className="font-bold leading-none tracking-tight"
        style={{ fontSize: Math.max(iconSize * 0.5, 14) }}
      >
        Devizly
      </span>
    </div>
  );
}

export { LogoMark as DevizlyIcon };
