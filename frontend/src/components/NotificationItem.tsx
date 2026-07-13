import React from "react";
import { Avatar } from "./Avatar";
import { AtSign, Reply, MessageCircle, UserPlus, Heart, Hash, Lock } from "lucide-react";

interface NotificationItemProps {
  notification: {
    _id: string;
    recipient: string;
    sender: {
      _id: string;
      username: string;
      avatar?: string | null;
      status: string;
    };
    type: "mention" | "reply" | "direct_message" | "room_invite" | "reaction";
    roomId: {
      _id: string;
      name: string;
      type: "public" | "private" | "dm";
    };
    messageId?: {
      _id: string;
      content: string;
    };
    emoji?: string;
    isRead: boolean;
    createdAt: string;
  };
  onClick: () => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { sender, type, roomId, messageId, emoji, isRead, createdAt } = notification;

  // Render type-specific details
  let typeLabel = "";
  let TypeIcon = AtSign;
  let iconColor = "text-[var(--accent)]";
  let description = "";

  switch (type) {
    case "mention":
      typeLabel = "mentioned you";
      TypeIcon = AtSign;
      iconColor = "text-indigo-400";
      description = messageId?.content || "Mentioned you in a message";
      break;
    case "reply":
      typeLabel = "replied to you";
      TypeIcon = Reply;
      iconColor = "text-emerald-400";
      description = messageId?.content || "Replied to your message";
      break;
    case "direct_message":
      typeLabel = "sent a direct message";
      TypeIcon = MessageCircle;
      iconColor = "text-cyan-400";
      description = messageId?.content || "Sent a direct message";
      break;
    case "room_invite":
      typeLabel = "invited you to join";
      TypeIcon = UserPlus;
      iconColor = "text-amber-400";
      description = `Invited you to join #${roomId?.name || "room"}`;
      break;
    case "reaction":
      typeLabel = `reacted with ${emoji || "👍"}`;
      TypeIcon = Heart;
      iconColor = "text-rose-400";
      description = messageId?.content || "Reacted to your message";
      break;
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 flex gap-3.5 border-b last:border-b-0 hover:bg-[var(--bg-surface-hover)] transition-all duration-150 relative group ${
        !isRead ? "bg-[rgba(99,102,241,0.02)]" : ""
      }`}
      style={{
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Left: Avatar with type overlay */}
      <div className="relative shrink-0 select-none">
        <Avatar username={sender.username} avatarUrl={sender.avatar} size="sm" />
        <span
          className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[var(--bg-surface)] bg-[var(--bg-sidebar)] ${iconColor}`}
        >
          <TypeIcon size={9} />
        </span>
      </div>

      {/* Center: Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-sm font-semibold truncate max-w-[120px]"
              style={{ color: "var(--text-primary)" }}
            >
              {sender.username}
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {typeLabel}
            </span>
          </div>
          <span
            className="text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            {formatRelativeTime(createdAt)}
          </span>
        </div>

        {/* Room Context */}
        {roomId && type !== "direct_message" && (
          <div
            className="flex items-center gap-1 text-[11px] font-semibold mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {roomId.type === "private" ? (
              <Lock size={10} />
            ) : (
              <Hash size={10} />
            )}
            <span>{roomId.name}</span>
          </div>
        )}

        {/* Message preview snippet */}
        {description && (
          <p
            className="text-xs mt-1 truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Right: Unread Dot indicator */}
      {!isRead && (
        <div className="flex items-center justify-center shrink-0 ml-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--accent)" }}
          />
        </div>
      )}
    </button>
  );
}
