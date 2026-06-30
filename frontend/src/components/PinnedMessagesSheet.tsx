import React, { useEffect, useRef } from "react";
import { X, Pin } from "lucide-react";

interface PinnedMessagesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        className="w-full max-w-md h-full flex flex-col bg-[var(--bg-surface)] border-l border-[var(--border)] shadow-2xl transition-transform duration-300 ease-out transform translate-x-0"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Pin size={18} style={{ color: "var(--accent)" }} />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Pinned Messages
            </h2>
            <span
              className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(99,102,241,0.1)",
                color: "var(--accent)",
              }}
            >
              {pinnedMessages.length}
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all duration-150"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {pinnedMessages.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center">
              <Pin size={32} style={{ color: "var(--text-muted)", marginBottom: 12, opacity: 0.5 }} />
              <p style={{ color: "var(--text-muted)" }}>No pinned messages yet</p>
            </div>
          ) : (
            pinnedMessages.map((message) => (
              <div
                key={message._id}
                className="flex flex-col gap-3 p-4 rounded-xl border"
                style={{
                  backgroundColor: "rgba(99,102,241,0.03)",
                  borderColor: "rgba(99,102,241,0.12)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <p
                    className="text-sm leading-relaxed line-clamp-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {message.content}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {message.pinned?.pinnedAt
                      ? new Date(message.pinned.pinnedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })
                      : ""}
                  </span>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        onJump(message._id);
                        onOpenChange(false);
                      }}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: "var(--accent-hover)" }}
                    >
                      Jump
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => onUnpin(message._id)}
                        className="text-xs hover:underline"
                        style={{ color: "var(--text-muted)" }}
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
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
