import React from "react";

// ── Deterministic color from username hash ────────────────────────────────────
function getAvatarColor(name: string): string {
  const palette = [
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#f97316", // orange
    "#3b82f6", // blue
    "#14b8a6", // teal
    "#a855f7", // purple
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

// ── Avatar sizes ──────────────────────────────────────────────────────────────
const sizeMap: Record<string, { container: string; text: string }> = {
  xs:  { container: "w-6 h-6",   text: "text-[10px]" },
  sm:  { container: "w-8 h-8",   text: "text-xs" },
  md:  { container: "w-9 h-9",   text: "text-sm" },
  lg:  { container: "w-11 h-11", text: "text-base" },
  xl:  { container: "w-14 h-14", text: "text-lg" },
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
