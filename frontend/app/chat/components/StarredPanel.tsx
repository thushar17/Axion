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
      className="w-72 shrink-0 border-l flex flex-col h-full hidden xl:flex"
      style={{
        background: "var(--bg-sidebar)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div
        className="h-14 px-4 flex items-center justify-between border-b shrink-0"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <h2
          className="text-sm font-semibold tracking-tight flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          <Star size={14} style={{ color: "#f59e0b" }} fill="#f59e0b" />
          Starred Messages
        </h2>
        <button
          onClick={() => setShowStarredPanel(false)}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] transition"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {starredMessages.length === 0 ? (
          <p
            className="text-xs text-center py-8"
            style={{ color: "var(--text-muted)" }}
          >
            No starred messages yet.
            <br />
            Right-click a message to star it.
          </p>
        ) : (
          starredMessages.map((msg: any) => (
            <div
              key={msg._id}
              className="rounded-xl border p-3 space-y-2 hover:border-[var(--accent)] transition-all cursor-pointer"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border)",
              }}
              onClick={() => scrollToMessage(msg._id, msg.roomId)}
            >
              <div className="flex justify-between items-center">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--accent-hover)" }}
                >
                  {msg.sender?.username}
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
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
                className="text-[10px] hover:underline"
                style={{ color: "var(--error)" }}
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
