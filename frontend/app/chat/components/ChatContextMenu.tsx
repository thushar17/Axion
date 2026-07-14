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
  inputRef: React.RefObject<HTMLInputElement | null>;
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
      className="w-full text-left flex items-center gap-2.5 transition-colors duration-[120ms] ease-out rounded"
      style={{
        height: "32px",
        padding: "0 12px",
        color: danger ? "var(--danger)" : "var(--text-primary)",
        fontSize: "13px",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = danger
          ? "var(--danger-tint)"
          : "var(--surface-4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <span style={{ color: danger ? "var(--danger)" : "var(--text-tertiary)" }}>
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
      className="fixed z-[9999] rounded-lg border"
      style={{
        top: contextMenu.y,
        left: contextMenu.x,
        background: "var(--surface-3)",
        borderColor: "var(--border-default)",
        boxShadow: "var(--elevation-2)",
        minWidth: "200px",
        padding: "4px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {!contextMenu.message.isDeleted && (
        <>
          <ContextItem
            icon={<Reply size={14} />}
            label="Reply"
            onClick={() => {
              setReplyingTo(contextMenu.message);
              setContextMenu(null);
            }}
          />
          <ContextItem
            icon={<Copy size={14} />}
            label="Copy Message"
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.message.content);
              toast.success("Copied!");
              setContextMenu(null);
            }}
          />

          {/* Reaction picker */}
          <div
            className="mx-1 my-1 px-2 py-2 rounded"
            style={{
              borderTop: "1px solid var(--border-subtle)",
              borderBottom: "1px solid var(--border-subtle)",
              margin: "4px 0",
            }}
          >
            <p
              className="text-xs mb-1.5 font-medium"
              style={{ color: "var(--text-tertiary)" }}
            >
              React
            </p>
            <div className="flex gap-1 flex-wrap">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(contextMenu.message._id, emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-base transition-colors duration-[120ms]"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <ContextItem
            icon={
              <Star
                size={14}
                fill={
                  starredMessageIds.includes(contextMenu.message._id)
                    ? "var(--warning)"
                    : "none"
                }
                stroke={
                  starredMessageIds.includes(contextMenu.message._id)
                    ? "var(--warning)"
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
              icon={<Pin size={14} />}
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
                style={{
                  height: "1px",
                  background: "var(--border-subtle)",
                  margin: "4px 0",
                }}
              />
              <ContextItem
                icon={<Pencil size={14} />}
                label="Edit"
                onClick={() => {
                  setEditingMessageId(contextMenu.message._id);
                  setInput(contextMenu.message.content);
                  setContextMenu(null);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
              />
              <ContextItem
                icon={<Trash2 size={14} />}
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
          className="px-3 py-2 text-xs italic"
          style={{ color: "var(--text-tertiary)" }}
        >
          No actions available
        </div>
      )}
    </div>
  );
}
