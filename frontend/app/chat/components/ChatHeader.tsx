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
      className="w-full text-left flex items-center gap-2.5 transition-colors duration-[120ms] ease-out"
      style={{
        height: "32px",
        padding: "0 12px",
        color: danger ? "var(--danger)" : "var(--text-secondary)",
        fontSize: "13px",
        borderRadius: "4px",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = danger
          ? "var(--danger-tint)"
          : "var(--surface-4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <span style={{ color: danger ? "var(--danger)" : "var(--text-tertiary)" }}>
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
      className="flex items-center justify-between px-4 border-b shrink-0"
      style={{
        height: "56px",
        background: "var(--surface-1)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Left: hamburger (mobile) + room name */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-[120ms] ease-out"
          style={{ color: "var(--text-tertiary)" }}
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open sidebar"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <Menu size={18} />
        </button>

        {selectedRoom ? (
          <div className="flex items-center gap-2 min-w-0">
            <span style={{ color: "var(--text-tertiary)" }}>
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
                  className="h-7 px-3 rounded-md text-xs font-semibold text-white transition-colors duration-[120ms]"
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
                  className="h-7 px-3 rounded-md text-xs font-medium transition-colors duration-[120ms]"
                  style={{
                    background: "var(--surface-4)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <h1
                className="text-sm font-semibold truncate"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
              >
                {roomName}
              </h1>
            )}
            <span
              className="text-xs shrink-0"
              style={{ color: "var(--text-tertiary)" }}
            >
              {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <h1
            className="text-sm font-semibold"
            style={{ color: "var(--text-tertiary)" }}
          >
            Select a channel
          </h1>
        )}
      </div>

      {/* Right actions */}
      {selectedRoom && (
        <div className="flex items-center gap-1 shrink-0">
          {/* Search */}
          <div className="relative flex items-center mr-1 hidden sm:flex">
            <Search size={14} className="absolute left-2.5" style={{ color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 text-sm rounded-lg border transition-all duration-200 w-32 focus:w-48 md:w-36 md:focus:w-60 outline-none"
              style={{
                height: "32px",
                background: "var(--surface-0)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
              }}
            />
            {searchResults.length > 0 && (
              <div
                className="absolute top-full right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-lg border z-50"
                style={{
                  background: "var(--surface-3)",
                  borderColor: "var(--border-default)",
                  boxShadow: "var(--elevation-2)",
                }}
              >
                <div
                  className="px-3 py-2 border-b text-xs font-semibold uppercase tracking-[0.04em]"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}
                >
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
                    className="w-full text-left px-3 py-2.5 border-b last:border-0 transition-colors duration-[120ms]"
                    style={{ borderColor: "var(--border-subtle)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
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
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-[120ms] ease-out"
            style={{
              background: showStarredPanel ? "var(--surface-3)" : "transparent",
              color: showStarredPanel ? "var(--accent-subtle)" : "var(--text-tertiary)",
            }}
            title="Starred messages"
            aria-label="Toggle starred messages"
            onMouseEnter={(e) => {
              if (!showStarredPanel) (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
            }}
            onMouseLeave={(e) => {
              if (!showStarredPanel) (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <Star size={16} fill={showStarredPanel ? "currentColor" : "none"} />
          </button>

          {/* Members toggle */}
          <button
            onClick={() => setShowMembersPanel((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-[120ms] ease-out"
            style={{
              background: showMembersPanel ? "var(--surface-3)" : "transparent",
              color: showMembersPanel ? "var(--accent-subtle)" : "var(--text-tertiary)",
            }}
            title="Members"
            aria-label="Toggle members panel"
            onMouseEnter={(e) => {
              if (!showMembersPanel) (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
            }}
            onMouseLeave={(e) => {
              if (!showMembersPanel) (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
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
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-[120ms] ease-out"
              style={{
                background: showRoomSettings ? "var(--surface-3)" : "transparent",
                color: "var(--text-tertiary)",
              }}
              title="Room settings"
              aria-label="Room settings"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
              }}
              onMouseLeave={(e) => {
                if (!showRoomSettings) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <MoreHorizontal size={16} />
            </button>

            {showRoomSettings && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 rounded-lg border z-50"
                style={{
                  background: "var(--surface-3)",
                  borderColor: "var(--border-default)",
                  boxShadow: "var(--elevation-2)",
                  minWidth: "200px",
                  padding: "4px",
                  top: "calc(100% + 4px)",
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
                  className="my-1"
                  style={{
                    height: "1px",
                    background: "var(--border-subtle)",
                    margin: "4px 8px",
                  }}
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
