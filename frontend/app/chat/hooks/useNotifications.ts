import { useState, useEffect, useCallback, useRef } from "react";
import { socket } from "@/src/lib/socket";
import { toast } from "sonner";
import {
  getNotifications,
  markAllAsRead as apiMarkAllAsRead,
  markAsRead as apiMarkAsRead,
} from "../services/notification.service";

interface Notification {
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
}

export function useNotifications(user: any, selectedRoom: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Keep a ref of selectedRoom so socket callback always gets the latest value without re-binding
  const selectedRoomRef = useRef(selectedRoom);
  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await getNotifications();
      if (res.data?.success) {
        const list = res.data.data;
        setNotifications(list);
        setUnreadCount(list.filter((n: Notification) => !n.isRead).length);
      }
    } catch (err) {
      console.error("[useNotifications] Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (notifications.length === 0) return;
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await apiMarkAllAsRead();
    } catch (err) {
      console.error("[useNotifications] Failed to mark all read:", err);
      fetchNotifications(); // rollback
    }
  }, [notifications, fetchNotifications]);

  const markOneRead = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await apiMarkAsRead(id);
    } catch (err) {
      console.error("[useNotifications] Failed to mark read:", err);
      fetchNotifications(); // rollback
    }
  }, [fetchNotifications]);

  // Handler for custom room selection from toast
  const handleSelectRoomRef = useRef<((roomId: string) => void) | null>(null);

  // Real-time socket updates
  useEffect(() => {
    if (!user) return;

    // Fetch initial list
    fetchNotifications();

    const handleNewNotification = (notification: Notification) => {
      // If we are already looking at the room where this notification occurred, mark it read immediately
      const activeRoomId = selectedRoomRef.current?._id;
      const notificationRoomId = (typeof notification.roomId === "object" && notification.roomId)
        ? notification.roomId._id
        : (notification.roomId as unknown as string);

      if (activeRoomId && activeRoomId === notificationRoomId) {
        // Mark read immediately in background
        apiMarkAsRead(notification._id).catch(() => {});
        notification.isRead = true;
      }

      setNotifications((prev) => {
        // Prevent duplicate append
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });

      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);

        // Show premium Sonner toast if not currently viewing the notification's room
        if (activeRoomId !== notificationRoomId) {
          const senderName = notification.sender.username;
          let toastMessage = "";
          let toastTitle = "";

          switch (notification.type) {
            case "mention":
              toastTitle = "Mentioned You";
              toastMessage = `${senderName}: "${notification.messageId?.content || ""}"`;
              break;
            case "reply":
              toastTitle = "Replied to You";
              toastMessage = `${senderName}: "${notification.messageId?.content || ""}"`;
              break;
            case "direct_message":
              toastTitle = "New Direct Message";
              toastMessage = `${senderName}: "${notification.messageId?.content || ""}"`;
              break;
            case "room_invite":
              toastTitle = "Invited to Channel";
              toastMessage = `${senderName} invited you to #${notification.roomId?.name || "channel"}`;
              break;
            case "reaction":
              toastTitle = "Reacted to your message";
              toastMessage = `${senderName} reacted with ${notification.emoji || ""}`;
              break;
            default:
              toastTitle = "New Notification";
              toastMessage = `Activity from ${senderName}`;
          }

          toast(toastTitle, {
            description: toastMessage,
            action: {
              label: "View",
              onClick: () => {
                if (handleSelectRoomRef.current && notificationRoomId) {
                  handleSelectRoomRef.current(notificationRoomId);
                  apiMarkAsRead(notification._id).catch(() => {});
                  setNotifications((prev) =>
                    prev.map((n) =>
                      n._id === notification._id ? { ...n, isRead: true } : n
                    )
                  );
                  setUnreadCount((prev) => Math.max(0, prev - 1));
                }
              },
            },
          });
        }
      }
    };

    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAllRead,
    markOneRead,
    registerRoomSelector: (callback: (roomId: string) => void) => {
      handleSelectRoomRef.current = callback;
    },
  };
}
