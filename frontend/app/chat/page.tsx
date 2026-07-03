"use client";

import { checkAuth, clearChat } from "./services/auth.service";
import { useMembers } from "./hooks/useMembers";
import { useSearch } from "./hooks/useSearch";
import { useTypingIndicator } from "./hooks/useTypingIndicator";
import { useMessageStore } from "./hooks/useMessageStore";
import ChatSidebar from "./components/ChatSidebar"
import ChatHeader from "./components/ChatHeader";
import ChatMessage from "./components/ChatMessage";
import MessageInput from "./components/MessageInput";
import MembersSidebar from "./components/MembersSidebar";
import StarredPanel from "./components/StarredPanel";
import ChatContextMenu from "./components/ChatContextMenu";
import { DeliveryTick } from "./components/DeliveryTick";
import { TypingIndicator } from "./components/TypingIndicator";
import { CreateRoomModal } from "./components/CreateRoomModal";
import { AddMemberModal } from "./components/AddMemberModal";
import { DeleteRoomConfirmModal, LeaveRoomConfirmModal, ClearChatConfirmModal } from "./components/RoomConfirmModals";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useRef,
} from "react";
import { socket } from "@/src/lib/socket";
import { toast } from "sonner";
import { PinnedMessagesSheet } from "@/src/components/PinnedMessagesSheet";
import {
  X,
  Pin,
  Zap
} from "lucide-react";
import { useSocket } from "./hooks/useScoket";
import { useMessage } from "./hooks/useMessage";
import { useRoom } from "./hooks/useRoom";
import { useRoomStore } from "./hooks/useRoomStore";






// hook for room states



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
    setShowRoomSettings } = useRoomStore()



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

  // message state hook
  const { messages, setMessages } = useMessageStore();

  const { typingUsers,
    emitMessage,
    emitStopTyping,
    emitTyping,
    emitJoinRooms,
    emitJoinRoom
  } = useSocket(
    {
      selectedRoomRef,
      onActiveRoomCleared: () => setMessages([]),
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
    setShowClearConfirm,
    messages,
    setMessages
  });

  const {
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

      <CreateRoomModal
        open={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        roomName={roomName}
        setRoomName={setRoomName}
        roomType={roomType}
        setRoomType={setRoomType}
        handleRoomCreation={handleRoomCreation}
      />

      <AddMemberModal
        open={showAddMember}
        onClose={() => {
          setShowAddMember(false);
          setEmail("");
        }}
        email={email}
        setEmail={setEmail}
        handleAddMember={handleAddMember}
      />

      <DeleteRoomConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => handelRoomDelete(selectedRoom?._id)}
        roomName={selectedRoom?.name}
      />

      <LeaveRoomConfirmModal
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={() => handleLeaveRoom(selectedRoom?._id)}
        roomName={selectedRoom?.name}
      />

      <ClearChatConfirmModal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => handleClearChat(selectedRoom?._id)}
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