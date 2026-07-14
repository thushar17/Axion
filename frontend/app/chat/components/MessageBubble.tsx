import React from "react";
import { getSenderId } from "../utils/getSenderId";
import { groupedReaction } from "../utils/groupedReaction";
import { Pin, Reply, Pencil, MoreHorizontal } from "lucide-react";
import { formatMessageTimestamp } from "../utils/formatTimestamp";
import { Avatar } from "@/src/components/Avatar";

type Props = {
    message: any;
    idx: number;
    messages: any[];
    user: any;
    hoveredMsgId: string | null;
    setHoveredMsgId: React.Dispatch<React.SetStateAction<string | null>>;
    setContextMenu: React.Dispatch<React.SetStateAction<{ x: number, y: number, message: any } | null>>;
    scrollToMessage: (messageId: string, roomID?: string) => void;
    handleReaction: (messageId: string, emoji: string) => void;
    DeliveryTick: React.FC<{ status: string, isMe: boolean }>;
    setReplyingTo: React.Dispatch<React.SetStateAction<any | null>>;
    setEditingMessageId: React.Dispatch<React.SetStateAction<string | null>>;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function MessageBubble({
    message,
    idx,
    messages,
    user,
    hoveredMsgId,
    setHoveredMsgId,
    setContextMenu,
    scrollToMessage,
    handleReaction,
    DeliveryTick,
    setReplyingTo,
    setEditingMessageId,
    setInput,
    inputRef
}: Props) {
    const currentUserId = String(user?.id || user?._id || "");
    const msgSenderId = getSenderId(message.sender);

    // Avoid undefined === undefined by checking if both are truthy
    const isMe = Boolean(currentUserId && msgSenderId && msgSenderId === currentUserId);

    // Group consecutive messages from the same sender (< 5 min apart)
    const prevMsg = messages[idx - 1];
    const isGrouped =
      prevMsg &&
      getSenderId(prevMsg.sender) === msgSenderId &&
      new Date(message.createdAt).getTime() -
        new Date(prevMsg.createdAt).getTime() <
        5 * 60 * 1000;

    const isHovered = hoveredMsgId === message._id;
    const groupedReactions = groupedReaction(message.reactions || []);

    return (
      <div
        key={message._id}
        id={`msg-${message._id}`}
        onMouseEnter={() => setHoveredMsgId(message._id)}
        onMouseLeave={() => setHoveredMsgId(null)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenu({ x: e.clientX, y: e.clientY, message });
        }}
        className="message-enter relative"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: isMe ? "flex-end" : "flex-start",
          alignItems: "flex-start",
          padding: isGrouped ? "1px 16px" : "6px 16px",
          borderRadius: "8px",
          // subtle hover overlay as per spec — 6% opacity, not full surface swap
          background: isHovered ? "rgba(255,255,255,0.035)" : "transparent",
          transition: "background 120ms ease-out",
          // pinned gets a subtle left accent bar instead of outline
          borderLeft: message.pinned?.isPinned ? "3px solid var(--accent-tint)" : "3px solid transparent",
        }}
      >
        {/* Avatar — received messages only, first in group */}
        {!isMe && (
          <div style={{ width: 36, flexShrink: 0, marginRight: 10, display: "flex", alignItems: "flex-end" }}>
            {!isGrouped ? (
              <Avatar
                username={message.sender?.username || "Unknown"}
                avatarUrl={message.sender?.avatar}
                size="md"
              />
            ) : null}
          </div>
        )}

        {/* Content column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isMe ? "flex-end" : "flex-start",
            maxWidth: "65%",
            minWidth: 0,
          }}
        >
          {/* Sender name + timestamp — first in group, received only */}
          {!isMe && !isGrouped && (
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
                marginBottom: "4px",
                marginLeft: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                {message.sender?.username || "Unknown"}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-tertiary)",
                }}
              >
                {formatMessageTimestamp(message.createdAt)}
              </span>
            </div>
          )}

          {/* Pin badge */}
          {message.pinned?.isPinned && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10,
                marginBottom: 2,
                justifyContent: isMe ? "flex-end" : "flex-start",
                color: "var(--text-tertiary)",
              }}
            >
              <Pin size={10} />
              <span>Pinned</span>
            </div>
          )}

          {/* Bubble + action buttons row */}
          <div
            style={{
              display: "flex",
              flexDirection: isMe ? "row-reverse" : "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            {/* ── Bubble ── */}
            <div
              style={{
                // Own messages: accent at 12% opacity tinted bg with text-primary
                // Others: surface-3 with border-subtle
                background: isMe
                  ? "var(--accent-tint)"
                  : "var(--surface-3)",
                color: "var(--text-primary)",
                border: isMe ? "none" : "1px solid var(--border-subtle)",
                borderRadius: isMe
                  ? "12px 12px 4px 12px"   // bottom-right flattened for own
                  : "12px 12px 12px 4px",  // bottom-left flattened for other
                padding: "8px 12px",
                fontSize: "14px",
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              {/* Reply-to preview */}
              {message.replyTo && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToMessage(message.replyTo._id);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderLeft: `2px solid var(--accent)`,
                    borderRadius: 6,
                    padding: "5px 8px",
                    marginBottom: 8,
                    cursor: "pointer",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      marginBottom: 2,
                      color: "var(--accent-subtle)",
                    }}
                  >
                    {message.replyTo.sender?.username}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-tertiary)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {message.replyTo.content}
                  </p>
                </div>
              )}

              {/* Message text */}
              {message.isDeleted ? (
                <p style={{ fontStyle: "italic", fontSize: 13, color: "var(--text-tertiary)" }}>
                  This message was deleted
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {message.attachment && (
                    <div style={{ maxWidth: "100%", borderRadius: "8px", overflow: "hidden" }}>
                      {message.attachment.mimeType?.startsWith("image/") ? (
                        <img src={message.attachment.url} alt={message.attachment.fileName} style={{ maxWidth: "100%", maxHeight: "250px", objectFit: "contain", borderRadius: "8px" }} />
                      ) : message.attachment.mimeType?.startsWith("video/") ? (
                        <video src={message.attachment.url} controls style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "8px" }} />
                      ) : message.attachment.mimeType?.startsWith("audio/") ? (
                        <audio src={message.attachment.url} controls style={{ maxWidth: "100%" }} />
                      ) : (
                        <a href={message.attachment.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", background: "var(--surface-4)", borderRadius: "8px", color: "var(--text-primary)", textDecoration: "none", fontSize: "13px" }}>
                          📄 {message.attachment.fileName || "Download Attachment"}
                        </a>
                      )}
                    </div>
                  )}
                  {message.content && <p style={{ margin: 0 }}>{message.content}</p>}
                </div>
              )}

              {/* Reactions */}
              {Object.entries(groupedReactions).length > 0 && (
                <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                  {Object.entries(groupedReactions).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(message._id, emoji)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        height: "24px",
                        padding: "0 8px",
                        borderRadius: "9999px",
                        background: "var(--surface-4)",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "border-color 120ms ease-out",
                      }}
                    >
                      {emoji} {String(count)}
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp + status — grouped messages or own messages */}
              {(isGrouped || isMe) && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                    {formatMessageTimestamp(message.createdAt)}
                  </span>
                  {message.isEdited && !message.isDeleted && (
                    <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                      (edited)
                    </span>
                  )}
                  <DeliveryTick status={message.status} isMe={isMe} />
                </div>
              )}
              {/* For non-grouped received messages, delivery tick only (no timestamp shown in bubble) */}
              {!isGrouped && !isMe && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 4 }}>
                  {message.isEdited && !message.isDeleted && (
                    <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                      (edited)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── Action buttons (appear on hover) ── */}
            {!message.isDeleted && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexShrink: 0,
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 120ms ease-out",
                }}
              >
                {/* Reply */}
                <button
                  onClick={() => {
                    setReplyingTo(message);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  title="Reply"
                  aria-label="Reply"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--surface-3)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                    transition: "background 120ms ease-out, color 120ms ease-out",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-4)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
                  }}
                >
                  <Reply size={13} />
                </button>

                {/* Edit — own messages only */}
                {msgSenderId === String(user?.id || user?._id) && (
                  <button
                    onClick={() => {
                      setEditingMessageId(message._id);
                      setInput(message.content);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    title="Edit message"
                    aria-label="Edit message"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--surface-3)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-tertiary)",
                      cursor: "pointer",
                      transition: "background 120ms ease-out, color 120ms ease-out",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-4)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                )}

                {/* More actions */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setContextMenu({ x: rect.left, y: rect.bottom + 4, message });
                  }}
                  title="More actions"
                  aria-label="More actions"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--surface-3)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                    transition: "background 120ms ease-out, color 120ms ease-out",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-4)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
                  }}
                >
                  <MoreHorizontal size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
}
