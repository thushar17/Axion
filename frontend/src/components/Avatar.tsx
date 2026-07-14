import React from "react";

// ── Deterministic color from username hash ────────────────────────────────────
function getAvatarColor(name: string): string {
  const palette = [
    "#5B6EF5", // accent indigo
    "#7C8AF7", // accent subtle
    "#3FB950", // success green
    "#E3A008", // warning amber
    "#F05252", // danger red
    "#06b6d4", // cyan
    "#a855f7", // purple
    "#f97316", // orange
    "#14b8a6", // teal
    "#3b82f6", // blue
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Avatar sizes per Zync spec ────────────────────────────────────────────────
// xs=20px, sm=24px, md=36px, lg=48px, xl=96px
const sizeMap: Record<string, { container: string; text: string }> = {
  xs: { container: "w-5 h-5",   text: "text-[9px]" },
  sm: { container: "w-6 h-6",   text: "text-[10px]" },
  md: { container: "w-9 h-9",   text: "text-xs" },
  lg: { container: "w-12 h-12", text: "text-sm" },
  xl: { container: "w-24 h-24", text: "text-xl" },
};

interface AvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({
  username,
  avatarUrl,
  size = "md",
  className = "",
}: AvatarProps) {
  const { container, text } = sizeMap[size] ?? sizeMap["md"];
  const color = getAvatarColor(username || "?");
  const initials = getInitials(username || "?");

  return (
    <div
      className={`${container} rounded-full overflow-hidden shrink-0 select-none ${className}`}
      title={username}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback to initials on broken URL
            (e.currentTarget as HTMLImageElement).style.display = "none";
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.style.background = color;
              parent.style.display = "flex";
              parent.style.alignItems = "center";
              parent.style.justifyContent = "center";
              const span = document.createElement("span");
              span.className = `${text} font-semibold text-white`;
              span.textContent = initials;
              parent.appendChild(span);
            }
          }}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${text} font-semibold text-white`}
          style={{ background: color }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
