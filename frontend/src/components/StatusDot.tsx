import React from "react";

type Status = "online" | "away" | "offline" | "dnd" | string;

interface StatusDotProps {
  status: Status;
  /** subtle pulse animation when online */
  pulse?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// 30% of avatar size per spec — sized relative to avatar-sm (24px) → ~8px
const sizeMap: Record<string, string> = {
  sm: "w-2 h-2",     // 8px
  md: "w-2.5 h-2.5", // 10px
  lg: "w-3 h-3",     // 12px
};

// Zync spec status colors
const colorMap: Record<string, string> = {
  online:  "var(--status-online)",
  away:    "var(--status-idle)",
  idle:    "var(--status-idle)",
  dnd:     "var(--status-dnd)",
  offline: "var(--status-offline)",
};

export function StatusDot({
  status,
  pulse = false,
  className = "",
  size = "md",
}: StatusDotProps) {
  const bg = colorMap[status] ?? colorMap["offline"];
  const sizeClass = sizeMap[size] ?? sizeMap["md"];
  // opacity pulse — no box-shadow glow (per spec)
  const pulseClass = pulse && status === "online" ? "status-pulse" : "";

  return (
    <span
      className={`${sizeClass} rounded-full inline-block shrink-0 ${pulseClass} ${className}`}
      style={{
        background: bg,
        // 2px surface-colored ring-cutout via border + box-shadow trick
        boxShadow: "0 0 0 2px var(--surface-1)",
      }}
      title={status}
      aria-label={`Status: ${status}`}
    />
  );
}
