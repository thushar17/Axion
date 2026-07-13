import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";

interface NotificationBellProps {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  onMarkAllRead: () => void;
  onNotificationClick: (notification: any) => void;
}

export function NotificationBell({
  notifications,
  unreadCount,
  loading,
  onMarkAllRead,
  onNotificationClick,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-lg transition-all relative hover:bg-[var(--bg-surface-hover)] active:scale-95 cursor-pointer"
        style={{
          color: isOpen ? "var(--accent-hover)" : "var(--text-muted)",
          background: isOpen ? "var(--bg-surface-hover)" : "transparent",
        }}
        title="Notifications"
      >
        <Bell size={16} fill={isOpen ? "currentColor" : "none"} />

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold px-1 text-white border transition-all duration-300"
            style={{
              background: "var(--accent)",
              borderColor: "var(--bg-sidebar)",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Container */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          onMarkAllRead={onMarkAllRead}
          onNotificationClick={(notification) => {
            onNotificationClick(notification);
            setIsOpen(false); // Close dropdown on item click
          }}
        />
      )}
    </div>
  );
}
