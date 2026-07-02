"use client";

import { checkAuth, starMessage, getStarredMessages, muteRoom, archiveRoom, clearChat } from "./services/auth.service";
import { getRooms, createRoom, deleteRoom, renameRoom, leaveRoom, getMembers, addMember, removeMember, generateInvite } from "./services/room.service";
import { editMessage, deleteMessage, pinMessage, toggleReaction, searchMessages, getPaginatedMessages } from "./services/message.service";
import ChatSidebar from "./components/ChatSidebar"
import ChatHeader from "./components/ChatHeader";
import ChatMessage from "./components/ChatMessage";
import MessageInput from "./components/MessageInput";
import MembersSidebar from "./components/MembersSidebar";
import { getSenderId } from "./utils/getSenderId";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useRef,
  FormEvent,
  useCallback,
} from "react";
import { socket } from "@/src/lib/socket";
import { toast } from "sonner";
import { Avatar } from "@/src/components/Avatar";
import { PinnedMessagesSheet } from "@/src/components/PinnedMessagesSheet";
import { StatusDot } from "@/src/components/StatusDot";
import { Modal, ConfirmModal } from "@/src/components/Modal";
import {
  Hash,
  Lock,
  Smile,
  Plus,
  Crown,
  X,
  Send,
  Star,
  MoreHorizontal,
  Reply,
  Copy,
  Pencil,
  Trash2,
  Pin,
  VolumeX,
  Volume2,
  Archive,
  LogOut,
  ChevronDown,
  ChevronRight,
  Users,
  Link2,
  Zap,
  Check,
  CheckCheck,
  Menu,
  Search,
} from "lucide-react";
import { formatMessageTimestamp } from "./utils/formatTimestamp";
import { groupedReaction } from "./utils/groupedReaction";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";






/* ─── Small sub-components ──────────────────────────────────────────────── */

function TypingIndicator({ users }: { users: string[] }) {
  if (!users.length) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1 items-end">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {users.length === 1
          ? `${users[0]} is typing…`
          : `${users.join(", ")} are typing…`}
      </span>
    </div>
  );
}

function DeliveryTick({ status, isMe }: { status: string; isMe: boolean }) {
  if (!isMe) return null;
  if (status === "seen") {
    return (
      <CheckCheck
        size={13}
        className="shrink-0"
        style={{ color: "var(--accent-hover)" }}
      />
    );
  }
  if (status === "delivered") {
    return (
      <CheckCheck
        size={13}
        className="shrink-0"
        style={{ color: "var(--text-muted)" }}
      />
    );
  }
  return (
    <Check
      size={13}
      className="shrink-0"
      style={{ color: "var(--text-muted)" }}
    />
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function ChatPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("public");
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const selectedRoomRef = useRef<any>(null);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  const [members, setMembers] = useState<any[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [email, setEmail] = useState("");
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState<{
    [roomId: string]: number;
  }>({});
  const [inviteLink, setInviteLink] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const [starredMessageIds, setStarredMessageIds] = useState<string[]>([]);
  const [starredMessages, setStarredMessages] = useState<any[]>([]);
  const [showStarredPanel, setShowStarredPanel] = useState(false);
  const [mutedRoomIds, setMutedRoomIds] = useState<string[]>([]);
  const [archivedRoomIds, setArchivedRoomIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: any;
  } | null>(null);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [isPinnedSheetOpen, setIsPinnedSheetOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [showArchivedSection, setShowArchivedSection] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // UI state
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(true);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emojis = [
    "👍",
    "❤️",
    "😂",
    "😮",
    "😢",
    "🎉",
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSeraching, setIsSearching] = useState(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (user) {
      setStarredMessageIds(user.starredMessages || []);
      setMutedRoomIds(user.mutedRooms || []);
      setArchivedRoomIds(user.archivedRooms || []);
    }
  }, [user]);

  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
      setShowRoomSettings(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await checkAuth();
        setUser(response.data.user);
        socket.connect();
        setLoading(false);
      } catch (error) {
        console.log(error);
        router.push("/auth/login");
      }
    };
    verifyAuth();
  }, [router]);

  // ── Socket events ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    socket.on("connect", () => { });

    socket.on("connect_error", (err) => {
      console.log("Socket Error:", err.message);
      router.push("/auth/login");
    });

    socket.on("room-joined", (roomId) => {
      socket.emit("message-seen", roomId);
    });

    socket.on("new-message", (message) => {
      const currentRoom = selectedRoomRef.current;
      if (currentRoom && message.roomId === currentRoom._id) {
        setMessages((prev) => [...prev, message]);
        if (getSenderId(message.sender) !== user.id) {
          socket.emit("message-seen", currentRoom._id);
        }
        setTimeout(scrollToBottom, 60);
      } else {
        setUnreadMessageCount((prev) => ({
          ...prev,
          [message.roomId]: (prev[message.roomId] || 0) + 1,
        }));
      }
      socket.emit("message-delivered", { messageId: message._id });
    });

    socket.on("message-status-updated", (data) => {
      const ids = Array.isArray(data.messageId)
        ? data.messageId
        : [data.messageId];
      setMessages((prev) =>
        prev.map((msg) =>
          ids.includes(String(msg._id))
            ? { ...msg, status: data.status }
            : msg
        )
      );
    });

    socket.on("typing-status", (data) => {
      setTypingUsers((prev) => {
        if (prev.includes(data.username)) return prev;
        return [...prev, data.username];
      });
    });

    socket.on("stop-typing-status", (data) => {
      setTypingUsers((prev) =>
        prev.filter((name) => name !== data.username)
      );
    });

    socket.on("member-removed", (data) => {
      if (data.memberId === user.id) {
        setAllRooms((prev) => {
          const updatedRooms = prev.filter(
            (room) => room._id !== data.roomId
          );
          if (selectedRoomRef.current?._id === data.roomId) {
            setSelectedRoom(updatedRooms[0] ?? null);
            setMessages([]);
            setMembers([]);
          }
          return updatedRooms;
        });
        return;
      }
      setMembers((prev) =>
        prev.filter((member) => member.user._id !== data.memberId)
      );
    });

    socket.on("room-deleted", (data) => {
      setAllRooms((prev) => {
        const roomId = selectedRoomRef.current?._id;
        const updateRoom = prev.filter((room) => room._id !== data.roomId);
        if (roomId === data.roomId) {
          setSelectedRoom(updateRoom[0] || null);
          setMembers([]);
          setMessages([]);
        }
        return updateRoom;
      });
    });

    socket.on("message-deleted", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, content: data.content, isDeleted: true }
            : msg
        )
      );
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.replyTo && msg.replyTo._id === data.messageId) {
            return {
              ...msg,
              replyTo: {
                ...msg.replyTo,
                content: data.content,
                isDeleted: true,
              },
            };
          }
          return msg;
        })
      );
    });

    socket.on("message-pinned", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? {
              ...msg,
              pinned: data.pinned
            }
            : msg
        )
      );
    });

    socket.on("message-edit", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, content: data.content, isEdited: data.isEdited }
            : msg
        )
      );
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.replyTo && msg.replyTo._id === data.messageId) {
            return {
              ...msg,
              replyTo: {
                ...msg.replyTo,
                content: data.content,
                isEdited: data.isEdited,
              },
            };
          }
          return msg;
        })
      );
    });

    socket.on("room-renamed", (data) => {
      setAllRooms((prev) =>
        prev.map((room) =>
          room._id === data.roomId ? { ...room, name: data.newName } : room
        )
      );
      setSelectedRoom((current: any) => {
        if (current && current._id === data.roomId) {
          return { ...current, name: data.newName };
        }
        return current;
      });
    });
    socket.on(
      "user-reacted",

      (data) => {

        setMessages(prev =>

          prev.map(message =>

            message._id === data.messageId

              ? {

                ...message,

                reactions: data.messageReaction

              }

              : message

          )

        )

      }
    )

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("room-joined");
      socket.off("new-message");
      socket.off("message-status-updated");
      socket.off("typing-status");
      socket.off("stop-typing-status");
      socket.off("member-removed");
      socket.off("room-deleted");
      socket.off("message-deleted");
      socket.off("message-pinned");
      socket.off("message-edit");
      socket.off("room-renamed");
      socket.off("user-reacted")
      socket.disconnect();
    };
  }, [user, router, scrollToBottom]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedRoom) return;

    if (editingMessageId) {
      handelEditMessage();
      return;
    }

    socket.emit(
      "send-message",
      {
        roomId: selectedRoom._id,
        content: input,
        replyTo: replyingTo?._id,
      },
      (response: any) => {
        console.log("ACK:", response);
      }
    );

    socket.emit("stop-typing", {
      roomId: selectedRoom.name,
      username: user.username,
    });

    setInput("");
    setReplyingTo(null);
  };

  // ── Fetch rooms ───────────────────────────────────────────────────────────
  const fetchRooms = async () => {
    try {
      const response = await getRooms();
      if (response.status !== 200) {
        toast.error("Failed to fetch rooms");
        return;
      }
      setAllRooms(response.data.data);
      const roomIds = response.data.data.map((r: any) => r._id);
      socket.emit("join-rooms", roomIds);
      if (response.data.data.length > 0) {
        setSelectedRoom(response.data.data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ── Create room ───────────────────────────────────────────────────────────
  const handleRoomCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createRoom(roomName, roomType);
      if (response.status === 400) {
        toast.error("Error while creating room");
        return;
      }
      toast.success(response.data.message);
      await fetchRooms();
      setRoomName("");
      setRoomType("public");
      setShowCreateRoom(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to create room");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ── Fetch members ─────────────────────────────────────────────────────────
  const fetchMembers = async () => {
    try {
      const response = await getMembers(selectedRoom._id);
      setMembers(response.data.members);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!selectedRoom) return;
    socket.emit("join-room", selectedRoom._id);
    setUnreadMessageCount((prev) => {
      const newCount = { ...prev };
      delete newCount[selectedRoom._id];
      return newCount;
    });
    fetchMembers();
    setMobileSidebarOpen(false);
    loadMessages(selectedRoom._id);
  }, [selectedRoom]);

  // ── Add member ────────────────────────────────────────────────────────────
  const handleAddMember = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedRoom) return;
    try {
      const response = await addMember(email, selectedRoom._id);
      if (response.data.success) {
        toast.success(response.data.message);
        setEmail("");
        setShowAddMember(false);
      }
      await fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  };

  // ── Typing ────────────────────────────────────────────────────────────────
  const handelInputChange = (e: any) => {
    setInput(e.target.value);
    if (!selectedRoom) return;
    socket.emit("typing", {
      roomId: selectedRoom._id,
      username: user?.username,
    });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop-typing", {
        roomId: selectedRoom._id,
        username: user.username,
      });
    }, 1000);
  };

  // ── Remove member ─────────────────────────────────────────────────────────
  const handelRemoveMember = async (memberId: string) => {
    try {
      const response = await removeMember(memberId, selectedRoom._id);
      if (response.data.success) {
        toast.success("Member removed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove member");
    }
  };

  // ── isAdmin check ─────────────────────────────────────────────────────────
  const isAdmin = members.some(
    (member) =>
      member.user._id === user?.id && member.role === "admin"
  );

  // ── Generate invite link ──────────────────────────────────────────────────
  const handelLinkGeneration = async () => {
    try {
      const response = await generateInvite(selectedRoom._id);
      if (!response.data.success) {
        toast.error(response.data.message);
        return;
      }
      setInviteLink(response.data.inviteLink);
      toast.success("Invite link generated");
    } catch (error) {
      console.log(error);
      toast.error("Failed to generate invite link");
    }
  };

  // ── Delete room ───────────────────────────────────────────────────────────
  const handelRoomDelete = async (roomId: string) => {
    try {
      const response = await deleteRoom(roomId);
      if (!response.data.success) {
        toast.error(response.data.message);
        return;
      }
      toast.success("Room deleted");
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete room");
    }
  };

  // ── Edit message ──────────────────────────────────────────────────────────
  const handelEditMessage = async () => {
    if (!input.trim()) return;
    try {
      const response = await editMessage(editingMessageId as string, input);
      if (response.data.success) {
        setMessages(
          messages.map((msg) =>
            msg._id === editingMessageId
              ? { ...msg, content: input }
              : msg
          )
        );
        setEditingMessageId(null);
        setInput("");
      } else {
        toast.error(response.data.message || "Failed to edit message");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to edit message");
    }
  };

  // ── Delete message ────────────────────────────────────────────────────────
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await deleteMessage(messageId);
      if (!response.data.success) {
        toast.error(response.data.message || "Failed to delete message");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete message");
    }
  };

  // ── Pin message ───────────────────────────────────────────────────────────
  const handlePinMessage = async (messageId: string) => {
    try {
      const response = await pinMessage(messageId);
      if (!response.data.success) {
        toast.error(response.data.message || "Failed to pin message");
      }
      else {
        setContextMenu(null)
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to pin message");
    }
  };

  // ── Star message ──────────────────────────────────────────────────────────
  const handleStarMessage = async (messageId: string) => {
    try {
      const response = await starMessage(messageId);
      if (response.data.success) {
        const starred = response.data.starredMessages;
        setStarredMessageIds(starred);
        if (showStarredPanel) fetchStarredMessages();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to star message");
    }
  };

  // ── Fetch starred ─────────────────────────────────────────────────────────
  const fetchStarredMessages = async () => {
    try {
      const response = await getStarredMessages();
      if (response.data.success) {
        setStarredMessages(response.data.messages);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ── Mute room ─────────────────────────────────────────────────────────────
  const handleMuteRoom = async (roomId: string) => {
    try {
      const response = await muteRoom(roomId);
      if (response.data.success) {
        setMutedRoomIds(response.data.mutedRooms);
        toast.success(
          mutedRoomIds.includes(roomId) ? "Room unmuted" : "Room muted"
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ── Archive room ──────────────────────────────────────────────────────────
  const handleArchiveRoom = async (roomId: string) => {
    try {
      const response = await archiveRoom(roomId);
      if (response.data.success) {
        setArchivedRoomIds(response.data.archivedRooms);
        toast.success(
          archivedRoomIds.includes(roomId) ? "Room unarchived" : "Room archived"
        );
        setShowRoomSettings(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ── Clear chat ────────────────────────────────────────────────────────────
  const handleClearChat = async (roomId: string) => {
    try {
      const response = await clearChat(roomId);
      if (response.data.success) {
        setMessages([]);
        toast.success("Chat cleared");
        setShowClearConfirm(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear chat");
    }
  };

  // ── Rename room ───────────────────────────────────────────────────────────
  const handleRenameRoom = async () => {
    if (!renameInput.trim() || !selectedRoom) return;
    try {
      const response = await renameRoom(selectedRoom._id, renameInput);
      if (response.data.success) {
        setIsRenaming(false);
        setRenameInput("");
        toast.success("Room renamed");
      } else {
        toast.error(response.data.message || "Failed to rename room");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to rename room");
    }
  };

  // ── Leave room ────────────────────────────────────────────────────────────
  const handleLeaveRoom = async (roomId: string) => {
    try {
      const response = await leaveRoom(roomId);
      if (response.data.success) {
        setAllRooms((prev) => {
          const updatedRooms = prev.filter((r) => r._id !== roomId);
          if (selectedRoom?._id === roomId) {
            setSelectedRoom(updatedRooms[0] || null);
            setMessages([]);
            setMembers([]);
          }
          return updatedRooms;
        });
        setShowLeaveConfirm(false);
        toast.success("Left room");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to leave room");
    }
  };

  // ── Scroll to message ─────────────────────────────────────────────────────
  const scrollToMessage = (messageId: string, roomId?: string) => {
    if (roomId && selectedRoom?._id !== roomId) {
      const targetRoom = allRooms.find((r) => r._id === roomId);
      if (targetRoom) {
        setSelectedRoom(targetRoom);
        setTimeout(() => {
          const element = document.getElementById(`msg-${messageId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("highlight-message");
            setTimeout(
              () => element.classList.remove("highlight-message"),
              2000
            );
          }
        }, 800);
        return;
      }
    }
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("highlight-message");
      setTimeout(
        () => element.classList.remove("highlight-message"),
        2000
      );
    }
  };
  // handel readtion 

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await toggleReaction(messageId, emoji);
      if (response.data.success) {
        setContextMenu(null);
      }
    } catch (error) {
      console.error(error)
    }
  }




  // storing pinned messages

  const pinnedMessages = messages.filter((message) => message.pinned?.isPinned)
    .sort(
      (a, b) =>
        new Date(b.pinned?.pinnedAt || 0).getTime() -
        new Date(a.pinned?.pinnedAt || 0).getTime()
    )

  useEffect(() => {
    if (showStarredPanel) fetchStarredMessages();
  }, [showStarredPanel]);



  // messages search

  useEffect(() => {
    if (!selectedRoom) return;

    if (!searchQuery.trim()) {
      setSearchResults([])
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true)
        const response = await searchMessages(selectedRoom._id, searchQuery);
        setSearchResults(response.data.messages)
      } catch (error) {
        console.log(error)
      }
      finally {
        setIsSearching(false)
      }
    }, 300);

    return () => clearTimeout(timer)

  }, [searchQuery, selectedRoom])


  const loadMessages = async (roomId: string) => {
    try {
      const response = await getPaginatedMessages(roomId);

      setMessages(response.data.messages.reverse());

      setCursor(response.data.nextCursor);

      setHasMore(response.data.hasMore);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error(error);
    }
  };


  const loadOlderMessages = async () => {
    if (!selectedRoom) return;

    if (!cursor) return;

    if (!hasMore) return;

    if (loadingMore) return;

    try {
      setLoadingMore(true);

      const response = await getPaginatedMessages(selectedRoom._id, cursor);

      setMessages((prev) => [
        ...response.data.messages.reverse(),
        ...prev,
      ]);

      setCursor(response.data.nextCursor);

      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--bg-app)" }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--accent)" }}
        >
          <Zap size={22} className="text-white" fill="white" />
        </div>
        <svg
          className="animate-spin w-8 h-8"
          viewBox="0 0 32 32"
          fill="none"
        >
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="var(--border)"
            strokeWidth="3"
          />
          <path
            d="M28 16C28 9.3 22.6 4 16 4"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Connecting…
        </p>
      </div>
    );
  }

  /* ── RENDER ──────────────────────────────────────────────────────────────── */
  const activeRooms = allRooms.filter(
    (room: any) => !archivedRoomIds.includes(room._id)
  );
  const archivedRooms = allRooms.filter((room: any) =>
    archivedRoomIds.includes(room._id)
  );

  return (
    <main
      className="h-screen flex overflow-hidden"
      style={{ background: "var(--bg-app)" }}
    >
      {/* ══ MOBILE OVERLAY ════════════════════════════════════════════════ */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ══ LEFT SIDEBAR ══════════════════════════════════════════════════ */}
      <ChatSidebar
        mobileSidebarOpen={mobileSidebarOpen}
        setShowCreateRoom={setShowCreateRoom}
        activeRooms={activeRooms}
        mutedRoomIds={mutedRoomIds}
        selectedRoom={selectedRoom}
        unreadMessageCount={unreadMessageCount}
        setSelectedRoom={setSelectedRoom}
        archivedRooms={archivedRooms}
        showArchivedSection={showArchivedSection}
        setShowArchivedSection={setShowArchivedSection}
        user={user}
      />

      {/* ══ CENTER AREA ═══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Chat header */}

        <ChatHeader
          setMobileSidebarOpen={setMobileSidebarOpen}
          selectedRoom={selectedRoom}
          isRenaming={isRenaming}
          handleRenameRoom={handleRenameRoom}
          renameInput={renameInput}
          setRenameInput={setRenameInput}
          members={members}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          scrollToMessage={scrollToMessage}
          setSearchResults={setSearchResults}
          showStarredPanel={showStarredPanel}
          setShowStarredPanel={setShowStarredPanel}
          showMembersPanel={showMembersPanel}
          setShowMembersPanel={setShowMembersPanel}
          showRoomSettings={showRoomSettings}
          setShowRoomSettings={setShowRoomSettings}
          mutedRoomIds={mutedRoomIds}
          handleMuteRoom={handleMuteRoom}
          archivedRoomIds={archivedRoomIds}
          handleArchiveRoom={handleArchiveRoom}
          setShowClearConfirm={setShowClearConfirm}
          isAdmin={isAdmin}
          setIsRenaming={setIsRenaming}
          setShowLeaveConfirm={setShowLeaveConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
        />
        {/* Pinned message banner */}
        {selectedRoom && pinnedMessages.length > 0 && (
          <div
            className="flex items-center justify-between px-4 py-3 border-b shrink-0 cursor-pointer hover:bg-[rgba(99,102,241,0.03)] transition-colors"
            style={{
              background: "rgba(99,102,241,0.06)",
              borderColor: "rgba(99,102,241,0.18)",
            }}
            onClick={() => setIsPinnedSheetOpen(true)}
          >
            <div className="flex items-center gap-2">
              <Pin size={14} style={{ color: "var(--accent)" }} />
              <span
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Pinned Messages ({pinnedMessages.length})
              </span>
            </div>

            <button
              className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
              style={{
                color: "var(--accent)",
                backgroundColor: "rgba(99,102,241,0.1)",
              }}
            >
              View All
            </button>
          </div>
        )}

        {/* Messages area */}
        <ChatMessage
          loadOlderMessages={loadOlderMessages}
          loadingMore={loadingMore}
          selectedRoom={selectedRoom}
          messages={messages}
          user={user}
          hoveredMsgId={hoveredMsgId}
          setHoveredMsgId={setHoveredMsgId}
          setContextMenu={setContextMenu}
          scrollToMessage={scrollToMessage}
          handleReaction={handleReaction}
          DeliveryTick={DeliveryTick}
          setReplyingTo={setReplyingTo}
          setEditingMessageId={setEditingMessageId}
          setInput={setInput}
          inputRef={inputRef}
          messagesEndRef={messagesEndRef}
        />

        {/* Typing indicator */}
        <TypingIndicator users={typingUsers} />

        {/* Reply / edit preview bar */}
        {(editingMessageId || replyingTo) && (
          <div
            className="px-4 py-2.5 border-t flex items-center justify-between gap-3"
            style={{
              background: "var(--bg-sidebar)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-0.5 h-8 rounded-full shrink-0"
                style={{ background: "var(--accent)" }}
              />
              <div className="min-w-0">
                <p
                  className="text-xs font-semibold"
                  style={{ color: "var(--accent-hover)" }}
                >
                  {editingMessageId
                    ? "Editing message"
                    : `Replying to ${replyingTo?.sender?.username}`}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {editingMessageId ? input : replyingTo?.content}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingMessageId(null);
                setReplyingTo(null);
                setInput("");
              }}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] transition"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Message input */}
      <MessageInput 
        sendMessage={sendMessage}
        inputRef={inputRef}
        handelInputChange={handelInputChange}
        selectedRoom={selectedRoom}
        input={input}
      />
      </div>

      {/* ══ RIGHT SIDEBAR — Members ════════════════════════════════════════ */}
      {showMembersPanel && (

        <MembersSidebar
          members={members}
          isAdmin={isAdmin}
          user={user}
          handelRemoveMember={handelRemoveMember}
          setShowAddMember={setShowAddMember}
          selectedRoom={selectedRoom}
          handelLinkGeneration={handelLinkGeneration}
          inviteLink={inviteLink}
          setShowDeleteConfirm={setShowDeleteConfirm}
        />
      )}

      {/* ══ STARRED MESSAGES PANEL ════════════════════════════════════════ */}
      {showStarredPanel && (
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
      )}

      {/* ══ CONTEXT MENU ══════════════════════════════════════════════════ */}
      {contextMenu && (
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
                  (null);
                }}
              />
              <ContextItem
                icon={<Copy size={13} />}
                label="Copy Message"
                onClick={() => {
                  navigator.clipboard.writeText(
                    contextMenu.message.content
                  );
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
                      onClick={() =>
                        handleReaction(contextMenu.message._id, emoji)
                      }
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
                    contextMenu.message.pinned?.isPinned
                      ? "Unpin"
                      : "Pin"
                  }
                  onClick={() => {
                    handlePinMessage(
                      contextMenu.message._id
                    );
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
      )}

      {/* ══ MODALS ════════════════════════════════════════════════════════ */}

      {/* Create Room */}
      <Modal
        open={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        title="Create a channel"
      >
        <form onSubmit={handleRoomCreation} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Channel name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="axion-input"
              placeholder="e.g. general"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Type
            </label>
            <div className="flex gap-2">
              {(["public", "private"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setRoomType(t)}
                  className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all"
                  style={{
                    background:
                      roomType === t
                        ? "var(--accent-muted)"
                        : "var(--bg-surface-hover)",
                    borderColor:
                      roomType === t ? "var(--accent)" : "var(--border)",
                    color:
                      roomType === t
                        ? "var(--accent-hover)"
                        : "var(--text-secondary)",
                  }}
                >
                  {t === "public" ? (
                    <Hash size={13} />
                  ) : (
                    <Lock size={13} />
                  )}
                  <span className="capitalize">{t}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateRoom(false)}
              className="flex-1 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-surface-hover)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all btn-glow"
              style={{ background: "var(--accent)" }}
            >
              Create channel
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member */}
      <Modal
        open={showAddMember}
        onClose={() => {
          setShowAddMember(false);
          setEmail("");
        }}
        title="Add member"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="axion-input"
              placeholder="teammate@company.com"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddMember(false);
                setEmail("");
              }}
              className="flex-1 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-surface-hover)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all btn-glow"
              style={{ background: "var(--accent)" }}
            >
              Add member
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Room Confirm */}
      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => handelRoomDelete(selectedRoom?._id)}
        title="Delete room"
        description={`Are you sure you want to delete "${selectedRoom?.name}"? This action cannot be undone and all messages will be lost.`}
        confirmLabel="Delete room"
        danger
      />

      {/* Leave Room Confirm */}
      <ConfirmModal
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={() => handleLeaveRoom(selectedRoom?._id)}
        title="Leave room"
        description={`Are you sure you want to leave "${selectedRoom?.name}"?`}
        confirmLabel="Leave room"
        danger
      />

      {/* Clear Chat Confirm */}
      <ConfirmModal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => handleClearChat(selectedRoom?._id)}
        title="Clear chat history"
        description="This will delete all messages in this room. This cannot be undone."
        confirmLabel="Clear chat"
        danger
      />

      {/* Pinned Messages Sheet */}
      <PinnedMessagesSheet
        open={isPinnedSheetOpen}
        onOpenChange={setIsPinnedSheetOpen}
        pinnedMessages={pinnedMessages}
        isAdmin={isAdmin}
        onJump={scrollToMessage}
        onUnpin={handlePinMessage}
      />
    </main>
  );
}

/* ── Helper sub-components ───────────────────────────────────────────────── */


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