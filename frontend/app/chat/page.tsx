"use client";

import { checkAuth, clearChat } from "./services/auth.service";
import { useMembers } from "./hooks/useMembers";
import { useSearch } from "./hooks/useSearch";
import { useTypingIndicator } from "./hooks/useTypingIndicator";
import ChatSidebar from "./components/ChatSidebar"
import ChatHeader from "./components/ChatHeader";
import ChatMessage from "./components/ChatMessage";
import MessageInput from "./components/MessageInput";
import MembersSidebar from "./components/MembersSidebar";
import StarredPanel from "./components/StarredPanel";
import ChatContextMenu from "./components/ChatContextMenu";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useRef,
} from "react";
import { socket } from "@/src/lib/socket";
import { toast } from "sonner";
import { PinnedMessagesSheet } from "@/src/components/PinnedMessagesSheet";
import { Modal, ConfirmModal } from "@/src/components/Modal";
import {
  Hash,
  Lock,
  X,
  Pin,
  Zap,
  Check,
  CheckCheck,
} from "lucide-react";
import { useSocket } from "./hooks/useScoket";
import { useMessage } from "./hooks/useMessage";
import { useRoom } from "./hooks/useRoom";
import { useRoomState } from "./hooks/useRoomState";






// hook for room states

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

  const selectedRoomRef = useRef<any>(null);


  const [unreadMessageCount, setUnreadMessageCount] = useState<{
    [roomId: string]: number;
  }>({});
  const [isPinnedSheetOpen, setIsPinnedSheetOpen] = useState(false);

  const [showArchivedSection, setShowArchivedSection] = useState(false);

  // UI state
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(true);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);



  const emojis = [
    "👍",
    "❤️",
    "😂",
    "😮",
    "😢",
    "🎉",
  ];


  // room staes hook
  const { allRooms, setAllRooms,
    selectedRoom, setSelectedRoom, showCreateRoom,
    setShowCreateRoom,
    mutedRoomIds,
    setMutedRoomIds,
    archivedRoomIds,
    setArchivedRoomIds,
    showRoomSettings,
    setShowRoomSettings } = useRoomState()



  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);
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

  const {
    members,
    setMembers,
    showAddMember,
    setShowAddMember,
    email,
    setEmail,
    inviteLink,
    setInviteLink,
    fetchMembers,
    handleAddMember,
    handelRemoveMember,
    handelLinkGeneration,
    isAdmin
  } = useMembers({ selectedRoom, user });

  // message hook
  let setMessagesFn: any;

  const { typingUsers,
    emitMessage,
    emitStopTyping,
    emitTyping,
    emitJoinRooms,
    emitJoinRoom
  } = useSocket(
    {
      selectedRoomRef,
      onActiveRoomCleared: () => setMessagesFn?.([]),
      user,
      setAllRooms,
      setSelectedRoom,
      setMembers,
      router
    }
  );

  const messageHook = useMessage({
    user,
    selectedRoomRef,
    setUnreadMessageCount,
    emitMessage,
    emitStopTyping,
    selectedRoom,
    allRooms,
    setSelectedRoom,
    setShowClearConfirm
  });
  setMessagesFn = messageHook.setMessages;

  const {
    messages,
    setMessages,
    editingMessageId,
    setEditingMessageId,
    handleEditMessage,
    handleDeleteMessage,
    scrollToBottom,
    loadMessages,
    messagesEndRef,
    contextMenu,
    setContextMenu,
    handlePinMessage,
    setStarredMessageIds,
    starredMessageIds,
    handleStarMessage,
    showStarredPanel,
    setShowStarredPanel,
    fetchStarredMessages,
    starredMessages,
    loadingMore,
    handleReaction,
    pinnedMessages,
    loadOlderMessages,
    sendMessage,
    input,
    setInput,
    replyingTo,
    setReplyingTo,
    handleClearChat,
    scrollToMessage
  } = messageHook;

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching: isSeraching,
    setIsSearching
  } = useSearch(selectedRoom);



  // use room hook
  const {
    fetchRooms,
    roomName,
    roomType,
    handleRoomCreation,
    setShowDeleteConfirm,
    showDeleteConfirm,
    handelRoomDelete,
    setRoomName,
    setRoomType,
    handleArchiveRoom,
    handleMuteRoom,
    setIsRenaming,
    isRenaming,
    renameInput,
    setRenameInput,
    handleRenameRoom,
    handleLeaveRoom
  } = useRoom({
    emitJoinRooms,
    selectedRoom,
    setSelectedRoom,
    allRooms,
    setAllRooms,
    setShowCreateRoom,
    mutedRoomIds,
    setMutedRoomIds,
    archivedRoomIds,
    setArchivedRoomIds,
    showRoomSettings, setShowRoomSettings,
    setMessages,
    setMembers,
    setShowLeaveConfirm

  })






  useEffect(() => {
    fetchRooms();
  }, []);



  useEffect(() => {
    if (!selectedRoom) return;
    emitJoinRoom(selectedRoom);
    setUnreadMessageCount((prev) => {
      const newCount = { ...prev };
      delete newCount[selectedRoom._id];
      return newCount;
    });
    fetchMembers();
    setMobileSidebarOpen(false);
    loadMessages(selectedRoom._id);
  }, [selectedRoom]);



  const { handleTyping } = useTypingIndicator(selectedRoom, emitTyping, emitStopTyping);

  // ── Typing ────────────────────────────────────────────────────────────────
  const handelInputChange = (e: any) => {
    setInput(e.target.value);
    handleTyping();
  };


  useEffect(() => {
    if (showStarredPanel) fetchStarredMessages();
  }, [showStarredPanel]);

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
          loadOlderMessages={() => loadOlderMessages(selectedRoom?._id)}
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
        <StarredPanel
          setShowStarredPanel={setShowStarredPanel}
          starredMessages={starredMessages}
          scrollToMessage={scrollToMessage}
          handleStarMessage={handleStarMessage}
        />
      )}

      {/* ══ CONTEXT MENU ══════════════════════════════════════════════════ */}
      <ChatContextMenu
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        setReplyingTo={setReplyingTo}
        emojis={emojis}
        handleReaction={handleReaction}
        starredMessageIds={starredMessageIds}
        handleStarMessage={handleStarMessage}
        isAdmin={isAdmin}
        handlePinMessage={handlePinMessage}
        user={user}
        setEditingMessageId={setEditingMessageId}
        setInput={setInput}
        inputRef={inputRef}
        handleDeleteMessage={handleDeleteMessage}
      />

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