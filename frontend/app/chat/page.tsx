"use client";

import { clearChat } from "./services/auth.service";
import { useMembers } from "./hooks/useMembers";
import { useSearch } from "./hooks/useSearch";
import { useTypingIndicator } from "./hooks/useTypingIndicator";
import { useMessageStore } from "./hooks/useMessageStore";
import { useChatUI } from "./hooks/useChatUI";
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
import { ChatLoadingScreen } from "./components/ChatLoadingScreen";
import { ProfileModal } from "./components/ProfileModal";
import { useRouter } from "next/navigation";
import { useAuth } from "./hooks/useAuth";
import { socket } from "@/src/lib/socket";
import { useGlobalClickClose } from "./hooks/useGlobalClickClose";
import { REACTION_EMOJIS } from "./constants/reactions";
import {
  useEffect,
  useRef,
  useState
} from "react";
import { PinnedMessagesSheet } from "@/src/components/PinnedMessagesSheet";
import {
  Pin
} from "lucide-react";
import { useSocket } from "./hooks/useSocket";
import { useMessage } from "./hooks/useMessage";
import { useRoom } from "./hooks/useRoom";
import { useRoomStore } from "./hooks/useRoomStore";

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function ChatPage() {
  const router = useRouter();

  const { user, setUser, loading } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const selectedRoomRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    unreadMessageCount,
    setUnreadMessageCount,
    isPinnedSheetOpen,
    setIsPinnedSheetOpen,
    showArchivedSection,
    setShowArchivedSection,
    showLeaveConfirm,
    setShowLeaveConfirm,
    showClearConfirm,
    setShowClearConfirm,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    showMembersPanel,
    setShowMembersPanel,
    hoveredMsgId,
    setHoveredMsgId,
  } = useChatUI();
  // room states hook
  const { allRooms, setAllRooms,
    selectedRoom, setSelectedRoom, showCreateRoom,
    setShowCreateRoom,
    mutedRoomIds,
    setMutedRoomIds,
    archivedRoomIds,
    setArchivedRoomIds,
    showRoomSettings,
    setShowRoomSettings,
    activeRooms,
    archivedRooms
  } = useRoomStore();

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
    handleRemoveMember,
    handleLinkGeneration,
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

  useGlobalClickClose({ setContextMenu, setShowRoomSettings });

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching: isSearching,
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
    handleRoomDelete,
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
    socket.on("user_updated", (updatedUser) => {
      if (user && updatedUser.id === user.id) {
        setUser(updatedUser);
      }
      setMessages((prev: any[]) => 
        prev.map((msg: any) => {
          const senderId = msg.sender?._id || msg.sender?.id;
          if (senderId === updatedUser.id) {
            return { ...msg, sender: { ...msg.sender, username: updatedUser.username, avatar: updatedUser.avatar } };
          }
          return msg;
        })
      );
      setMembers((prev: any[]) => 
        prev.map((member: any) => {
          const memberId = member.user?._id || member.user?.id;
          if (memberId === updatedUser.id) {
            return { ...member, user: { ...member.user, username: updatedUser.username, avatar: updatedUser.avatar } };
          }
          return member;
        })
      );
    });

    return () => {
      socket.off("user_updated");
    };
  }, [user, setMessages, setMembers, setUser]);

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
  const handleInputChange = (e: any) => {
    setInput(e.target.value);
    handleTyping();
  };


  useEffect(() => {
    if (showStarredPanel) fetchStarredMessages();
  }, [showStarredPanel]);

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return <ChatLoadingScreen />;
  }

  /* ── RENDER ──────────────────────────────────────────────────────────────── */
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
        setShowProfileModal={setShowProfileModal}
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
          handleInputChange={handleInputChange}
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
          handleRemoveMember={handleRemoveMember}
          setShowAddMember={setShowAddMember}
          selectedRoom={selectedRoom}
          handleLinkGeneration={handleLinkGeneration}
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
        emojis={REACTION_EMOJIS}
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
        onConfirm={() => handleRoomDelete(selectedRoom?._id)}
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

      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        setUser={setUser}
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