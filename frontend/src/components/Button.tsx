import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

// Zync spec button variants — no btn-glow on primary
const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium " +
    "transition-colors duration-[120ms] ease-out disabled:opacity-40 disabled:cursor-not-allowed",
  secondary:
    "bg-[var(--surface-3)] hover:bg-[var(--surface-4)] text-[var(--text-primary)] font-medium " +
    "border border-[var(--border-default)] transition-colors duration-[120ms] ease-out " +
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent hover:bg-[var(--surface-3)] text-[var(--text-secondary)] " +
    "hover:text-[var(--text-primary)] transition-colors duration-[120ms] ease-out " +
    "disabled:opacity-40 disabled:cursor-not-allowed",
  danger:
    "bg-[var(--danger)] hover:opacity-90 text-white font-medium " +
    "transition-all duration-[120ms] ease-out " +
    "disabled:opacity-40 disabled:cursor-not-allowed",
};

// Heights: sm=28px, md=36px, lg=40px via explicit h + px
const sizeStyles: Record<Size, string> = {
  sm: "h-7 px-3 text-xs rounded-[6px] gap-1.5",
  md: "h-9 px-4 text-sm rounded-[8px] gap-2",
  lg: "h-10 px-4 text-sm rounded-[8px] gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center font-medium select-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {loading ? (
        <Spinner size={size} />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}

/* ── Inline spinner ──────────────────────────────────── */
function Spinner({ size }: { size: Size }) {
  const s = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <svg
      className={`${s} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
