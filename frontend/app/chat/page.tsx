"use client";

import { checkAuth, starMessage, getStarredMessages, muteRoom, archiveRoom, clearChat } from "./services/auth.service";
import { getRooms, createRoom, deleteRoom, renameRoom, leaveRoom, getMembers, addMember, removeMember, generateInvite } from "./services/room.service";
import { editMessage, deleteMessage, pinMessage, toggleReaction, searchMessages, getPaginatedMessages } from "./services/message.service";
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

    socket.on("connect", () => {});

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
            ? { ...msg, 
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

(data)=>{

setMessages(prev=>

prev.map(message=>

message._id===data.messageId

?{

...message,

reactions:data.messageReaction

}

:message

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
      else{
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

 const handleReaction=async (messageId:string, emoji : string)=>{
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

const pinnedMessages = messages.filter((message)=> message.pinned?.isPinned )
.sort(
  (a,b)=> 
    new Date(b.pinned?.pinnedAt || 0).getTime()-
  new Date(a.pinned?.pinnedAt || 0).getTime()
)

  useEffect(() => {
    if (showStarredPanel) fetchStarredMessages();
  }, [showStarredPanel]);



// messages search

useEffect(()=>{
  if(!selectedRoom) return;

  if(!searchQuery.trim()){
    setSearchResults([])
    return;
  }

const timer = setTimeout( async() => {
   try {
    setIsSearching(true)
     const response = await searchMessages(selectedRoom._id, searchQuery);
     setSearchResults(response.data.messages)
   } catch (error) {
    console.log(error)
   }
   finally{
    setIsSearching(false)
   }
}, 300);

return ()=> clearTimeout(timer)

},[searchQuery, selectedRoom])


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
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40 md:z-auto
          flex flex-col w-72 shrink-0 border-r h-full
          transform transition-transform duration-200
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{
          background: "var(--bg-sidebar)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Logo */}
        <div
          className="px-4 h-14 flex items-center gap-2.5 border-b shrink-0"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--accent)" }}
          >
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Axion
          </span>
        </div>

        {/* Rooms header + create button */}
        <div
          className="px-3 py-2.5 flex items-center justify-between"
          style={{ borderBottom: `1px solid var(--border-subtle)` }}
        >
          <span
            className="text-[11px] uppercase tracking-wider font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            Channels
          </span>
          <button
            onClick={() => setShowCreateRoom(true)}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-[var(--bg-surface-hover)]"
            style={{ color: "var(--text-muted)" }}
            title="Create room"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Active rooms */}
          {activeRooms.map((room: any) => {
            const isMuted = mutedRoomIds.includes(room._id);
            const isActive = selectedRoom?._id === room._id;
            const unread = unreadMessageCount[room._id];
            return (
              <button
                key={room._id}
                onClick={() => setSelectedRoom(room)}
                className={`room-item w-full text-left px-3 py-2 flex items-center gap-2.5 rounded-lg mx-1 my-0.5 relative group`}
                style={{
                  width: "calc(100% - 8px)",
                  background: isActive
                    ? "var(--accent-muted)"
                    : "transparent",
                  color: isActive
                    ? "var(--accent-hover)"
                    : "var(--text-secondary)",
                }}
              >
                {/* Active bar */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4/5 rounded-full"
                    style={{
                      background: "var(--accent)",
                      left: "-4px",
                    }}
                  />
                )}
                {/* Icon */}
                <span
                  className="shrink-0"
                  style={{
                    color: isActive
                      ? "var(--accent-hover)"
                      : "var(--text-muted)",
                  }}
                >
                  {room.type === "private" ? (
                    <Lock size={14} />
                  ) : (
                    <Hash size={14} />
                  )}
                </span>
                {/* Name */}
                <span className="flex-1 text-sm truncate font-medium">
                  {room.name}
                </span>
                {/* Mute icon */}
                {isMuted && (
                  <VolumeX
                    size={12}
                    className="shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  />
                )}
                {/* Unread badge */}
                {!!unread && (
                  <span
                    className="shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{
                      background: isMuted
                        ? "var(--offline)"
                        : "var(--accent)",
                      color: "white",
                    }}
                  >
                    {unread}
                  </span>
                )}
              </button>
            );
          })}

          {/* Archived section */}
          {archivedRooms.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowArchivedSection((v) => !v)}
                className="w-full px-3 py-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold hover:text-[var(--text-secondary)] transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {showArchivedSection ? (
                  <ChevronDown size={12} />
                ) : (
                  <ChevronRight size={12} />
                )}
                Archived ({archivedRooms.length})
              </button>
              {showArchivedSection &&
                archivedRooms.map((room: any) => {
                  const isActive = selectedRoom?._id === room._id;
                  const unread = unreadMessageCount[room._id];
                  return (
                    <button
                      key={room._id}
                      onClick={() => setSelectedRoom(room)}
                      className="room-item w-full text-left px-3 py-2 flex items-center gap-2.5 rounded-lg mx-1 my-0.5 opacity-60 hover:opacity-100"
                      style={{
                        width: "calc(100% - 8px)",
                        background: isActive
                          ? "var(--accent-muted)"
                          : "transparent",
                        color: isActive
                          ? "var(--accent-hover)"
                          : "var(--text-muted)",
                      }}
                    >
                      {room.type === "private" ? (
                        <Lock size={14} className="shrink-0" />
                      ) : (
                        <Hash size={14} className="shrink-0" />
                      )}
                      <span className="flex-1 text-sm truncate font-medium">
                        {room.name}
                      </span>
                      {!!unread && (
                        <span
                          className="shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center"
                          style={{
                            background: "var(--offline)",
                            color: "white",
                          }}
                        >
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          )}

          {activeRooms.length === 0 && archivedRooms.length === 0 && (
            <div
              className="text-center text-xs py-10 px-4"
              style={{ color: "var(--text-muted)" }}
            >
              No rooms yet.{" "}
              <button
                onClick={() => setShowCreateRoom(true)}
                className="underline"
                style={{ color: "var(--accent-hover)" }}
              >
                Create one
              </button>
            </div>
          )}
        </div>

        {/* User panel at bottom */}
        <div
          className="px-3 py-3 border-t flex items-center gap-2.5 shrink-0"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <Avatar
            username={user?.username || "?"}
            avatarUrl={user?.avatar}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {user?.username}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {user?.email}
            </p>
          </div>
          <StatusDot status="online" pulse size="sm" />
        </div>
      </aside>

      {/* ══ CENTER AREA ═══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Chat header */}
        <header
          className="h-14 flex items-center justify-between px-4 border-b shrink-0"
          style={{
            background: "var(--bg-sidebar)",
            borderColor: "var(--border-subtle)",
          }}
        >
          {/* Left: hamburger (mobile) + room name */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] transition"
              style={{ color: "var(--text-muted)" }}
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>

            {selectedRoom ? (
              <div className="flex items-center gap-2 min-w-0">
                <span style={{ color: "var(--text-muted)" }}>
                  {selectedRoom.type === "private" ? (
                    <Lock size={15} />
                  ) : (
                    <Hash size={15} />
                  )}
                </span>
                {isRenaming ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRenameRoom();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      className="axion-input py-1 px-2 text-sm w-40"
                      placeholder="Room name"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="text-xs px-2.5 py-1 rounded-lg font-semibold text-white"
                      style={{ background: "var(--accent)" }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRenaming(false);
                        setRenameInput("");
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg"
                      style={{
                        background: "var(--bg-surface-hover)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <h1
                    className="text-sm font-semibold tracking-tight truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {selectedRoom.name}
                  </h1>
                )}
                <span
                  className="text-xs shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  {members.length} member{members.length !== 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <h1
                className="text-sm font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                Select a channel
              </h1>
            )}
          </div>

          {/* Right actions */}
          {selectedRoom && (
            <div className="flex items-center gap-1 shrink-0">
              {/* Search Box */}
              <div className="relative flex items-center mr-2 hidden sm:flex">
                <Search size={14} className="absolute left-2.5" style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm rounded-lg border transition-all duration-300 w-32 focus:w-48 md:w-40 md:focus:w-64 outline-none"
                  style={{
                    background: "var(--bg-app)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                />
                {searchResults.length > 0 && (
                  <div
                    className="absolute top-full right-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-xl border shadow-2xl z-50"
                    style={{
                      background: "var(--bg-surface)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="px-3 py-2 border-b text-[10px] font-bold uppercase tracking-wider" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
                      Search Results
                    </div>
                    {searchResults.map((message) => (
                      <button
                        key={message._id}
                        onClick={() => {
                          scrollToMessage(message._id);
                          setSearchResults([]);
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-3 py-2.5 transition-colors border-b last:border-0 hover:bg-[var(--bg-surface-hover)]"
                        style={{ borderColor: "var(--border-subtle)" }}
                      >
                        <div className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                          {message.content}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Starred toggle */}
              <button
                onClick={() => setShowStarredPanel((v) => !v)}
                className="p-2 rounded-lg transition-all"
                style={{
                  background: showStarredPanel
                    ? "var(--accent-muted)"
                    : "transparent",
                  color: showStarredPanel
                    ? "var(--accent-hover)"
                    : "var(--text-muted)",
                }}
                title="Starred messages"
              >
                <Star size={16} fill={showStarredPanel ? "currentColor" : "none"} />
              </button>

              {/* Members toggle */}
              <button
                onClick={() => setShowMembersPanel((v) => !v)}
                className="p-2 rounded-lg transition-all"
                style={{
                  background: showMembersPanel
                    ? "var(--accent-muted)"
                    : "transparent",
                  color: showMembersPanel
                    ? "var(--accent-hover)"
                    : "var(--text-muted)",
                }}
                title="Members"
              >
                <Users size={16} />
              </button>

              {/* Room settings dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRoomSettings((v) => !v);
                  }}
                  className="p-2 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-all"
                  style={{ color: "var(--text-muted)" }}
                  title="Room settings"
                >
                  <MoreHorizontal size={16} />
                </button>

                {showRoomSettings && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1 w-52 rounded-xl border py-1.5 z-50 shadow-2xl"
                    style={{
                      background: "var(--bg-surface)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {/* Mute */}
                    <DropdownItem
                      icon={
                        mutedRoomIds.includes(selectedRoom._id) ? (
                          <Volume2 size={14} />
                        ) : (
                          <VolumeX size={14} />
                        )
                      }
                      label={
                        mutedRoomIds.includes(selectedRoom._id)
                          ? "Unmute Room"
                          : "Mute Room"
                      }
                      onClick={() => {
                        handleMuteRoom(selectedRoom._id);
                        setShowRoomSettings(false);
                      }}
                    />
                    {/* Archive */}
                    <DropdownItem
                      icon={<Archive size={14} />}
                      label={
                        archivedRoomIds.includes(selectedRoom._id)
                          ? "Unarchive Room"
                          : "Archive Room"
                      }
                      onClick={() => handleArchiveRoom(selectedRoom._id)}
                    />
                    {/* Clear chat */}
                    <DropdownItem
                      icon={<Trash2 size={14} />}
                      label="Clear Chat"
                      onClick={() => {
                        setShowClearConfirm(true);
                        setShowRoomSettings(false);
                      }}
                    />
                    {/* Rename (admin only) */}
                    {isAdmin && (
                      <DropdownItem
                        icon={<Pencil size={14} />}
                        label="Rename Room"
                        onClick={() => {
                          setIsRenaming(true);
                          setRenameInput(selectedRoom.name);
                          setShowRoomSettings(false);
                        }}
                      />
                    )}

                    <div
                      className="my-1.5 border-t"
                      style={{ borderColor: "var(--border-subtle)" }}
                    />

                    {/* Leave */}
                    <DropdownItem
                      icon={<LogOut size={14} />}
                      label="Leave Room"
                      danger
                      onClick={() => {
                        setShowLeaveConfirm(true);
                        setShowRoomSettings(false);
                      }}
                    />

                    {/* Delete (admin only) */}
                    {isAdmin && (
                      <DropdownItem
                        icon={<Trash2 size={14} />}
                        label="Delete Room"
                        danger
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowRoomSettings(false);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

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
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
          style={{ background: "var(--bg-app)" }}
          onScroll={(e) => {
            if ((e.target as HTMLDivElement).scrollTop === 0) {
              loadOlderMessages();
            }
          }}
        >
          {loadingMore && <div className="text-center text-xs py-2" style={{ color: "var(--text-muted)" }}>Loading older messages...</div>}

          {!selectedRoom && (
            <div
              className="h-full flex flex-col items-center justify-center text-center gap-3"
              style={{ color: "var(--text-muted)" }}
            >
              <Hash size={40} className="opacity-30" />
              <p className="text-sm">Select a channel to start chatting</p>
            </div>
          )}

          {selectedRoom && messages.length === 0 && (
            <div
              className="h-full flex flex-col items-center justify-center text-center gap-3"
              style={{ color: "var(--text-muted)" }}
            >
              <MessageIconPlaceholder />
              <p className="text-sm">
                No messages yet — be the first to say something!
              </p>
            </div>
          )}

          {messages.map((message, idx) => {
            // ── "is this message mine?" check ──────────────────────────────
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
                        <p style={{ margin: 0 }}>{message.content}</p>
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
          })}
          <div ref={messagesEndRef} />
        </div>

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
        <form
          onSubmit={sendMessage}
          className="px-4 py-3 border-t shrink-0"
          style={{
            background: "var(--bg-sidebar)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2 border"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handelInputChange}
              placeholder={
                selectedRoom
                  ? `Message #${selectedRoom.name}`
                  : "Select a channel"
              }
              disabled={!selectedRoom}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text-primary)" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || !selectedRoom}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-30"
              style={{ background: "var(--accent)", color: "white" }}
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* ══ RIGHT SIDEBAR — Members ════════════════════════════════════════ */}
      {showMembersPanel && (
        <aside
          className="w-64 shrink-0 border-l flex flex-col h-full hidden lg:flex"
          style={{
            background: "var(--bg-sidebar)",
            borderColor: "var(--border-subtle)",
          }}
        >
          {/* Header */}
          <div
            className="h-14 px-4 flex items-center border-b shrink-0"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <h2
              className="text-sm font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Members
              <span
                className="ml-1.5 text-xs font-normal"
                style={{ color: "var(--text-muted)" }}
              >
                {members.length}
              </span>
            </h2>
          </div>

          {/* Member list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {members.map((member) => {
              const isMemberAdmin = member.role === "admin";
              return (
                <div
                  key={member.user._id}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg group hover:bg-[var(--bg-surface-hover)] transition-all"
                >
                  {/* Avatar + status */}
                  <div className="relative shrink-0">
                    <Avatar
                      username={member.user.username}
                      avatarUrl={member.user.avatar}
                      size="sm"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <StatusDot
                        status={member.user.status || "offline"}
                        pulse={member.user.status === "online"}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Name + role */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {member.user.username}
                      </p>
                      {isMemberAdmin && (
                        <Crown
                          size={11}
                          style={{ color: "#f59e0b", flexShrink: 0 }}
                        />
                      )}
                    </div>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {member.user.status || "offline"}
                    </p>
                  </div>

                  {/* Remove (admin, not self) */}
                  {isAdmin && member.user._id !== user?.id && (
                    <button
                      onClick={() => handelRemoveMember(member.user._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-[var(--error-bg)] transition-all"
                      style={{ color: "var(--error)" }}
                      title="Remove member"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              );
            })}

            {members.length === 0 && (
              <p
                className="text-xs text-center py-8"
                style={{ color: "var(--text-muted)" }}
              >
                No members
              </p>
            )}
          </div>

          {/* Bottom actions */}
          {selectedRoom && (
            <div
              className="p-3 space-y-2 border-t shrink-0"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {/* Add member button */}
              <button
                onClick={() => setShowAddMember(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[var(--bg-surface-hover)]"
                style={{ color: "var(--text-secondary)" }}
              >
                <Plus size={14} />
                Add member
              </button>

              {/* Invite link button */}
              <button
                onClick={handelLinkGeneration}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[var(--bg-surface-hover)]"
                style={{ color: "var(--text-secondary)" }}
              >
                <Link2 size={14} />
                Copy invite link
              </button>

              {/* Invite link display */}
              {inviteLink && (
                <div
                  className="rounded-lg px-3 py-2 text-xs break-all font-mono cursor-pointer group border"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-muted)",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                    toast.success("Invite link copied!");
                  }}
                >
                  {inviteLink}
                </div>
              )}

              {/* Delete room (admin) */}
              {isAdmin && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[var(--error-bg)]"
                  style={{ color: "var(--error)" }}
                >
                  <Trash2 size={14} />
                  Delete room
                </button>
              )}
            </div>
          )}
        </aside>
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

function DropdownItem({
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
        color: danger ? "var(--error)" : "var(--text-secondary)",
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

function MessageIconPlaceholder() {
  return (
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center opacity-20"
      style={{ background: "var(--bg-surface)" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </div>
  );
}