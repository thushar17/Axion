import React, { useEffect, useRef } from "react";
import { X, Pin } from "lucide-react";

interface PinnedMessagesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pinnedMessages: any[];
  isAdmin: boolean;
  onJump: (messageId: string) => void;
  onUnpin: (messageId: string) => void;
}

export function PinnedMessagesSheet({
  open,
  onOpenChange,
  pinnedMessages,
  isAdmin,
  onJump,
  onUnpin,
}: PinnedMessagesSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end backdrop-enter"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        className="w-full max-w-sm h-full flex flex-col border-l"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
          boxShadow: "var(--elevation-3)",
          animation: "slideInRight 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-0 border-b shrink-0"
          style={{
            borderColor: "var(--border-subtle)",
            height: "56px",
          }}
        >
          <div className="flex items-center gap-2">
            <Pin size={16} style={{ color: "var(--accent)" }} />
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
            >
              Pinned Messages
            </h2>
            <span
              className="ml-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "var(--accent-tint)",
                color: "var(--accent-subtle)",
              }}
            >
              {pinnedMessages.length}
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-[120ms] ease-out"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
            }}
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {pinnedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <Pin
                size={32}
                style={{ color: "var(--text-tertiary)", opacity: 0.4 }}
              />
              <p
                className="text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                No pinned messages yet
              </p>
            </div>
          ) : (
            pinnedMessages.map((message) => (
              <div
                key={message._id}
                className="flex flex-col gap-3 p-3 rounded-lg border"
                style={{
                  background: "var(--surface-3)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <p
                  className="text-sm leading-relaxed line-clamp-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {message.content}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {message.pinned?.pinnedAt
                      ? new Date(message.pinned.pinnedAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        onJump(message._id);
                        onOpenChange(false);
                      }}
                      className="text-xs font-semibold transition-opacity duration-[120ms] hover:opacity-70"
                      style={{ color: "var(--accent-subtle)" }}
                    >
                      Jump
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => onUnpin(message._id)}
                        className="text-xs transition-opacity duration-[120ms] hover:opacity-70"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Unpin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
