import React from "react";
import { Reply, Copy, Star, Pin, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getSenderId } from "../utils/getSenderId";

type Props = {
  contextMenu: any;
  setContextMenu: React.Dispatch<React.SetStateAction<any>>;
  setReplyingTo: React.Dispatch<React.SetStateAction<any>>;
  emojis: string[];
  handleReaction: (messageId: string, emoji: string) => void;
  starredMessageIds: string[];
  handleStarMessage: (messageId: string) => void;
  isAdmin: boolean;
  handlePinMessage: (messageId: string) => void;
  user: any;
  setEditingMessageId: React.Dispatch<React.SetStateAction<string | null>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  inputRef: React.RefObject<HTMLInputElement>;
  handleDeleteMessage: (messageId: string) => void;
};

function ContextItem({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3.5 py-2 text-sm flex items-center gap-2.5 transition-all"
      style={{
        color: danger ? "var(--error)" : "var(--text-primary)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = danger
          ? "var(--error-bg)"
          : "var(--bg-surface-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <span style={{ color: danger ? "var(--error)" : "var(--text-muted)" }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export default function ChatContextMenu({
  contextMenu,
  setContextMenu,
  setReplyingTo,
  emojis,
  handleReaction,
  starredMessageIds,
  handleStarMessage,
  isAdmin,
  handlePinMessage,
  user,
  setEditingMessageId,
  setInput,
  inputRef,
  handleDeleteMessage,
}: Props) {
  if (!contextMenu) return null;

  return (
    <div
      className="fixed rounded-xl py-1.5 w-48 z-[9999] shadow-2xl"
      style={{
        top: contextMenu.y,
        left: contextMenu.x,
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {!contextMenu.message.isDeleted && (
        <>
          <ContextItem
            icon={<Reply size={13} />}
            label="Reply"
            onClick={() => {
              setReplyingTo(contextMenu.message);
              setContextMenu(null);
            }}
          />
          <ContextItem
            icon={<Copy size={13} />}
            label="Copy Message"
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.message.content);
              toast.success("Copied!");
              setContextMenu(null);
            }}
          />

          <div
            className="px-3 py-2 border-b"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <p
              className="text-xs mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              React
            </p>

            <div className="flex gap-2 flex-wrap">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(contextMenu.message._id, emoji)}
                  className="w-8 h-8 rounded-lg hover:bg-[var(--bg-surface-hover)] transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <ContextItem
            icon={
              <Star
                size={13}
                fill={
                  starredMessageIds.includes(contextMenu.message._id)
                    ? "#f59e0b"
                    : "none"
                }
                stroke={
                  starredMessageIds.includes(contextMenu.message._id)
                    ? "#f59e0b"
                    : "currentColor"
                }
              />
            }
            label={
              starredMessageIds.includes(contextMenu.message._id)
                ? "Unstar"
                : "Star Message"
            }
            onClick={() => {
              handleStarMessage(contextMenu.message._id);
              setContextMenu(null);
            }}
          />
          {isAdmin && (
            <ContextItem
              icon={<Pin size={13} />}
              label={
                contextMenu.message.pinned?.isPinned ? "Unpin" : "Pin"
              }
              onClick={() => {
                handlePinMessage(contextMenu.message._id);
                setContextMenu(null);
              }}
            />
          )}

          {getSenderId(contextMenu.message.sender) === String(user?.id || user?._id) && (
            <>
              <div
                className="my-1 border-t"
                style={{ borderColor: "var(--border-subtle)" }}
              />
              <ContextItem
                icon={<Pencil size={13} />}
                label="Edit"
                onClick={() => {
                  setEditingMessageId(contextMenu.message._id);
                  setInput(contextMenu.message.content);
                  setContextMenu(null);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
              />
              <ContextItem
                icon={<Trash2 size={13} />}
                label="Delete"
                danger
                onClick={() => {
                  handleDeleteMessage(contextMenu.message._id);
                  setContextMenu(null);
                }}
              />
            </>
          )}
        </>
      )}
      {contextMenu.message.isDeleted && (
        <div
          className="px-4 py-2 text-xs italic"
          style={{ color: "var(--text-muted)" }}
        >
          No actions available
        </div>
      )}
    </div>
  );
}
