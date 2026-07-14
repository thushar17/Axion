import React from "react";
import { 
  Menu, Lock, Hash, Search, Star, Users, MoreHorizontal, 
  Volume2, VolumeX, Archive, Trash2, Pencil, LogOut, User
} from "lucide-react";

type Props = {
  setMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRoom: any;
  isRenaming: boolean;
  handleRenameRoom: () => void;
  renameInput: string;
  setRenameInput: React.Dispatch<React.SetStateAction<string>>;
  members: any[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchResults: any[];
  scrollToMessage: (messageId: string) => void;
  setSearchResults: React.Dispatch<React.SetStateAction<any[]>>;
  showStarredPanel: boolean;
  setShowStarredPanel: React.Dispatch<React.SetStateAction<boolean>>;
  showMembersPanel: boolean;
  setShowMembersPanel: React.Dispatch<React.SetStateAction<boolean>>;
  showRoomSettings: boolean;
  setShowRoomSettings: React.Dispatch<React.SetStateAction<boolean>>;
  mutedRoomIds: string[];
  handleMuteRoom: (roomId: string) => void;
  archivedRoomIds: string[];
  handleArchiveRoom: (roomId: string) => void;
  setShowClearConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  isAdmin: boolean;
  setIsRenaming: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLeaveConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  user: any;
};

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

export default function ChatHeader({
  setMobileSidebarOpen,
  selectedRoom,
  isRenaming,
  handleRenameRoom,
  renameInput,
  setRenameInput,
  members,
  searchQuery,
  setSearchQuery,
  searchResults,
  scrollToMessage,
  setSearchResults,
  showStarredPanel,
  setShowStarredPanel,
  showMembersPanel,
  setShowMembersPanel,
  showRoomSettings,
  setShowRoomSettings,
  mutedRoomIds,
  handleMuteRoom,
  archivedRoomIds,
  handleArchiveRoom,
  setShowClearConfirm,
  isAdmin,
  setIsRenaming,
  setShowLeaveConfirm,
  setShowDeleteConfirm,
  user
}: Props) {
  let roomName = selectedRoom?.name;
  if (selectedRoom?.type === "dm" && members) {
    const otherMember = members.find(m => m.user?._id !== user?.id && m.user?.id !== user?.id);
    if (otherMember && otherMember.user) {
      roomName = otherMember.user.username;
    }
  }

  return (
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
              ) : selectedRoom.type === "dm" ? (
                <User size={15} />
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
                {roomName}
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
  );
}
