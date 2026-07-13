import React from "react";
import { NotificationItem } from "./NotificationItem";
import { Check, BellOff, BellRing } from "lucide-react";

interface NotificationDropdownProps {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  onMarkAllRead: () => void;
  onNotificationClick: (notification: any) => void;
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-3.5 border-b last:border-b-0 flex gap-3.5 animate-pulse"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-hover)] shrink-0" />
          <div className="flex-1 flex flex-col gap-2 mt-1">
            <div className="h-3 w-1/3 bg-[var(--bg-surface-hover)] rounded" />
            <div className="h-2.5 w-3/4 bg-[var(--bg-surface-hover)] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-10 px-4 flex flex-col items-center justify-center text-center gap-3.5 select-none">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--bg-surface-hover)]" style={{ color: "var(--text-muted)" }}>
        <BellRing size={20} />
      </div>
      <div>
        <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          All caught up!
        </h4>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          No notifications found in your inbox.
        </p>
      </div>
    </div>
  );
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  loading,
  onMarkAllRead,
  onNotificationClick,
}: NotificationDropdownProps) {
  return (
    <div
      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border shadow-2xl z-50 overflow-hidden flex flex-col modal-enter"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Dropdown Header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
              style={{ background: "var(--accent)" }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAllRead();
            }}
            className="text-xs font-semibold flex items-center gap-1 hover:brightness-125 transition active:scale-95"
            style={{ color: "var(--accent-hover)" }}
          >
            <Check size={12} />
            Mark all read
          </button>
        )}
      </div>

      {/* Scrollable list */}
      <div className="max-h-[360px] overflow-y-auto min-h-[140px] flex-1">
        {loading ? (
          <LoadingSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={() => onNotificationClick(notification)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
