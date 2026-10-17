import React from "react";

interface LogoProps {
  inverted?: boolean;
  style?: React.CSSProperties;
  className?: string;
  /** Explicit pixel height if fixed across all screens */
  height?: number;
  width?: number;
}

export default function Logo({
  inverted = false,
  style = {},
  className = "",
  height,
  width,
}: LogoProps) {
  // Crisp W Review logo mark (no elurik, no underline, cache-busted v4)
  const src = "/w-review-v4.png";

  const effectiveStyle: React.CSSProperties = {
    display: "block",
    objectFit: "contain",
    ...(height ? { height: `${height}px` } : {}),
    ...(width ? { width: `${width}px` } : {}),
    ...style,
  };

  // Clean responsive sizing on transparent background (zero black box)
  const defaultSizeClasses = !height && !width ? "h-9 sm:h-11 w-auto" : "";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="W Review"
      className={`transition-transform duration-200 hover:scale-[1.03] select-none ${defaultSizeClasses} ${className}`}
      style={effectiveStyle}
    />
  );
}
