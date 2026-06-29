import React from "react";

type Status = "online" | "away" | "offline" | string;

interface StatusDotProps {
  status: Status;
  /** pulse animation when online */
  pulse?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap: Record<string, string> = {
  sm:  "w-2 h-2",
  md:  "w-2.5 h-2.5",
  lg:  "w-3 h-3",
};

const colorMap: Record<string, string> = {
  online:  "bg-[#22c55e]",
  away:    "bg-[#f59e0b]",
  offline: "bg-[#52525b]",
};

export function StatusDot({
  status,
  pulse = false,
  className = "",
  size = "md",
}: StatusDotProps) {
  const color = colorMap[status] ?? colorMap["offline"];
  const sizeClass = sizeMap[size] ?? sizeMap["md"];
  const pulseClass = pulse && status === "online" ? "status-pulse" : "";

  return (
    <span
      className={`${sizeClass} rounded-full inline-block shrink-0 border-2 border-[var(--bg-sidebar)] ${color} ${pulseClass} ${className}`}
      title={status}
      aria-label={`Status: ${status}`}
    />
  );
}
