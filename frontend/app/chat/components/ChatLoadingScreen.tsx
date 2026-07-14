import { Zap } from "lucide-react";

export function ChatLoadingScreen() {
  return (
    <div
      className="h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: "var(--surface-0)" }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--accent)" }}
      >
        <Zap size={22} className="text-white" fill="white" />
      </div>
      <svg
        className="animate-spin w-8 h-8"
        viewBox="0 0 32 32"
        fill="none"
      >
        <circle
          cx="16"
          cy="16"
          r="12"
          stroke="var(--border-default)"
          strokeWidth="3"
        />
        <path
          d="M28 16C28 9.3 22.6 4 16 4"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
        Connecting…
      </p>
    </div>
  );
}
