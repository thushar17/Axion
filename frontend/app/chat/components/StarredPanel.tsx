import React from "react";
import { Star, X } from "lucide-react";

type Props = {
  setShowStarredPanel: React.Dispatch<React.SetStateAction<boolean>>;
  starredMessages: any[];
  scrollToMessage: (messageId: string, roomId?: string) => void;
  handleStarMessage: (messageId: string) => void;
};

export default function StarredPanel({
  setShowStarredPanel,
  starredMessages,
  scrollToMessage,
  handleStarMessage,
}: Props) {
  return (
    <aside
      className="shrink-0 border-l flex flex-col h-full hidden xl:flex"
      style={{
        width: "320px",
        background: "var(--surface-1)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 flex items-center justify-between border-b shrink-0"
        style={{ borderColor: "var(--border-subtle)", height: "56px" }}
      >
        <h2
          className="text-sm font-semibold tracking-tight flex items-center gap-2"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
        >
          <Star size={14} style={{ color: "var(--warning)" }} fill="var(--warning)" />
          Starred Messages
        </h2>
        <button
          onClick={() => setShowStarredPanel(false)}
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
          aria-label="Close starred panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {starredMessages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full gap-3 text-center"
          >
            <Star
              size={28}
              style={{ color: "var(--text-tertiary)", opacity: 0.35 }}
            />
            <p
              className="text-sm"
              style={{ color: "var(--text-tertiary)", maxWidth: "240px" }}
            >
              No starred messages yet.
              <br />
              Right-click a message to star it.
            </p>
          </div>
        ) : (
          starredMessages.map((msg: any) => (
            <div
              key={msg._id}
              className="rounded-lg border p-3 space-y-2 cursor-pointer transition-colors duration-[120ms] ease-out"
              style={{
                background: "var(--surface-3)",
                borderColor: "var(--border-subtle)",
              }}
              onClick={() => scrollToMessage(msg._id, msg.roomId)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
              }}
            >
              <div className="flex justify-between items-center">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--accent-subtle)" }}
                >
                  {msg.sender?.username}
                </span>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {new Date(msg.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p
                className="text-xs leading-relaxed break-words"
                style={{ color: "var(--text-secondary)" }}
              >
                {msg.content}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStarMessage(msg._id);
                }}
                className="text-xs transition-opacity duration-[120ms] hover:opacity-70"
                style={{ color: "var(--danger)" }}
              >
                Unstar
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
