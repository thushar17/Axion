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
            const groupedReactions = groupedReaction(message.reactions || [])
  
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
                className="message-enter"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  alignItems: "flex-start",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  background: isHovered ? "var(--bg-surface-hover)" : "transparent",
                  transition: "background 0.1s ease",
                  outline: message.pinned?.isPinned? "1px solid var(--accent-muted)" : "none",
                }}
              >
                {/* Avatar — received messages only, first in group */}
                {!isMe && (
                  <div style={{ width: 32, flexShrink: 0, marginRight: 8, display: "flex", alignItems: "flex-end" }}>
                    {!isGrouped ? (
                      <Avatar
                        username={message.sender?.username || "Unknown"}
                        avatarUrl={message.sender?.avatar}
                        size="sm"
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
                    maxWidth: "70%",
                  }}
                >
                  {/* Sender name — first in group, received only */}
                  {!isMe && !isGrouped && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 4,
                        marginLeft: 4,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {message.sender?.username || "Unknown"}
                    </span>
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
                        color: "var(--text-muted)",
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
                        background: isMe ? "var(--accent)" : "var(--bg-surface)",
                        color: isMe ? "white" : "var(--text-primary)",
                        border: isMe ? "none" : "1px solid var(--border-subtle)",
                        borderRadius: 16,
                        borderBottomRightRadius: isMe ? 4 : 16,
                        borderBottomLeftRadius: isMe ? 16 : 4,
                        padding: "10px 14px",
                        fontSize: 15,
                        lineHeight: 1.6,
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
                            background: isMe ? "rgba(0,0,0,0.15)" : "var(--bg-surface-hover)",
                            borderLeft: `2px solid ${isMe ? "rgba(255,255,255,0.4)" : "var(--accent)"}`,
                            borderRadius: 8,
                            padding: "6px 8px",
                            marginBottom: 8,
                            cursor: "pointer",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              marginBottom: 2,
                              color: isMe ? "rgba(255,255,255,0.8)" : "var(--accent-hover)",
                            }}
                          >
                            {message.replyTo.sender?.username}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: isMe ? "rgba(255,255,255,0.6)" : "var(--text-muted)",
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
                        <p style={{ fontStyle: "italic", fontSize: 13, color: isMe ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}>
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
                                <a href={message.attachment.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", background: isMe ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)", borderRadius: "8px", color: "inherit", textDecoration: "none", fontSize: "14px" }}>
                                  📄 {message.attachment.fileName || "Download Attachment"}
                                </a>
                              )}
                            </div>
                          )}
                          {message.content && <p style={{ margin: 0 }}>{message.content}</p>}
                        </div>
                      )}
                      {Object.entries(groupedReactions).length > 0 && (
  <div className="flex gap-2 mt-2 flex-wrap">
    {Object.entries(groupedReactions).map(
      ([emoji, count]) => (
        <div
          key={emoji}
          className="px-2 py-1 rounded-full text-sm border cursor-pointer"
          onClick={() => handleReaction(message._id, emoji)}
        >
          {emoji} {count}
        </div>
      )
    )}
  </div>
)}

                      {/* Timestamp + status */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: isMe ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}>
                          {formatMessageTimestamp(message.createdAt)}
                        </span>
                        {message.isEdited && !message.isDeleted && (
                          <span style={{ fontSize: 10, color: isMe ? "rgba(255,255,255,0.4)" : "var(--text-muted)" }}>
                            (edited)
                          </span>
                        )}
                        <DeliveryTick status={message.status} isMe={isMe} />
                      </div>
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
                          transition: "opacity 0.15s ease",
                        }}
                      >
                        {/* Reply */}
                        <button
                          onClick={() => {
                            setReplyingTo(message);
                            setTimeout(() => inputRef.current?.focus(), 50);
                          }}
                          title="Reply"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            transition: "transform 0.1s ease",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
                          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
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
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "var(--bg-surface)",
                              border: "1px solid var(--border)",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              transition: "transform 0.1s ease",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
                            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
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
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            transition: "transform 0.1s ease",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
                          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
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
