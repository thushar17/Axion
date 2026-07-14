import React from "react";
import { Avatar } from "@/src/components/Avatar";
import { StatusDot } from "@/src/components/StatusDot";
import { Zap, Plus, Lock, Hash, VolumeX, ChevronDown, ChevronRight, Settings, User } from "lucide-react";

type Props = {
  mobileSidebarOpen: boolean;
  setShowCreateRoom: React.Dispatch<React.SetStateAction<boolean>>;
  activeRooms: any[];
  mutedRoomIds: string[];
  selectedRoom: any;
  unreadMessageCount: { [roomId: string]: number };
  setSelectedRoom: React.Dispatch<React.SetStateAction<any>>;
  archivedRooms: any[];
  showArchivedSection: boolean;
  setShowArchivedSection: React.Dispatch<React.SetStateAction<boolean>>;
  user: any;
  setShowProfileModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ChatSidebar({
  mobileSidebarOpen,
  setShowCreateRoom,
  activeRooms,
  mutedRoomIds,
  selectedRoom,
  unreadMessageCount,
  setSelectedRoom,
  archivedRooms,
  showArchivedSection,
  setShowArchivedSection,
  user,
  setShowProfileModal
}: Props) {
  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-40 md:z-auto
        flex flex-col shrink-0 border-r h-full
        transform transition-transform duration-200
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      style={{
        width: "280px",
        background: "var(--bg-sidebar)",
        borderColor: "var(--bg-sidebar-hover)",
      }}
    >
      {/* Header — Logo + workspace name */}
      <div
        className="px-4 flex items-center justify-between gap-2.5 border-b shrink-0"
        style={{ borderColor: "var(--bg-sidebar-hover)", height: "56px" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--accent)" }}
          >
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span
            className="text-sm font-semibold tracking-tight truncate"
            style={{ color: "var(--sidebar-text-primary)" }}
          >
            Zync
          </span>
        </div>
      </div>

      {/* Channels section header */}
      <div
        className="px-3 py-2 flex items-center justify-between shrink-0"
      >
        <span
          className="text-xs font-semibold uppercase tracking-[0.04em]"
          style={{ color: "var(--sidebar-text-secondary)" }}
        >
          Channels
        </span>
        <button
          onClick={() => setShowCreateRoom(true)}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-colors duration-[120ms] ease-out"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
          }}
          title="Create room"
          aria-label="Create room"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Active rooms */}
        {activeRooms.map((room: any) => {
          const isMuted = mutedRoomIds.includes(room._id);
          const isActive = selectedRoom?._id === room._id;
          const unread = unreadMessageCount[room._id];

          let roomName = room.name;
          const isDm = room.type === "dm";
          if (isDm && room.members) {
            const otherMember = room.members.find((m: any) => m.user?._id !== user?.id && m.user?.id !== user?.id);
            if (otherMember && otherMember.user) {
              roomName = otherMember.user.username;
            }
          }

          return (
            <button
              key={room._id}
              onClick={() => setSelectedRoom(room)}
              className="room-item w-full text-left flex items-center gap-2 relative group"
              style={{
                height: "32px",
                padding: "0 8px",
                margin: "1px 4px",
                width: "calc(100% - 8px)",
                borderRadius: "6px",
                background: isActive ? "var(--bg-sidebar-hover)" : "transparent",
                color: isActive ? "var(--sidebar-text-primary)" : isMuted ? "rgba(255,255,255,0.4)" : "var(--sidebar-text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-sidebar-hover)";
                  (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = isMuted ? "rgba(255,255,255,0.4)" : "var(--sidebar-text-secondary)";
                }
              }}
            >
              {/* Active bar — 3px accent left edge */}
              {isActive && (
                <div
                  className="absolute -left-1 top-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: "3px",
                    height: "60%",
                    background: "var(--accent-subtle)",
                  }}
                />
              )}

              {/* Room type icon */}
              <span className="shrink-0" style={{ color: isActive ? "var(--sidebar-text-primary)" : "inherit" }}>
                {room.type === "private" ? (
                  <Lock size={14} />
                ) : room.type === "dm" ? (
                  <User size={14} />
                ) : (
                  <Hash size={14} />
                )}
              </span>

              {/* Room name */}
              <span
                className="flex-1 text-sm truncate"
                style={{
                  fontWeight: unread && !isMuted ? 600 : 400,
                }}
              >
                {roomName}
              </span>

              {/* Mute icon */}
              {isMuted && (
                <VolumeX
                  size={12}
                  className="shrink-0"
                  style={{ color: "var(--text-tertiary)" }}
                />
              )}

              {/* Unread badge */}
              {!!unread && (
                <span
                  className="shrink-0 flex items-center justify-center text-white font-semibold"
                  style={{
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 5px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    background: isMuted ? "var(--bg-sidebar-hover)" : "var(--accent)",
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
          <div className="mt-3">
            <button
              onClick={() => setShowArchivedSection((v) => !v)}
              className="w-full px-3 py-1 flex items-center gap-1.5 text-xs uppercase tracking-[0.04em] font-semibold transition-colors duration-[120ms] ease-out"
              style={{ color: "var(--text-tertiary)", height: "28px" }}
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

                let roomName = room.name;
                const isDm = room.type === "dm";
                if (isDm && room.members) {
                  const otherMember = room.members.find((m: any) => m.user?._id !== user?.id && m.user?.id !== user?.id);
                  if (otherMember && otherMember.user) {
                    roomName = otherMember.user.username;
                  }
                }

                return (
                  <button
                    key={room._id}
                    onClick={() => setSelectedRoom(room)}
                    className="room-item w-full text-left flex items-center gap-2"
                    style={{
                      height: "32px",
                      padding: "0 8px",
                      margin: "1px 4px",
                      width: "calc(100% - 8px)",
                      borderRadius: "6px",
                      background: isActive ? "var(--bg-sidebar-hover)" : "transparent",
                      color: isActive ? "var(--sidebar-text-primary)" : "var(--sidebar-text-secondary)",
                      opacity: 0.8,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = "1";
                      (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text-primary)";
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--bg-sidebar-hover)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = "0.8";
                      (e.currentTarget as HTMLElement).style.color = isActive ? "var(--sidebar-text-primary)" : "var(--sidebar-text-secondary)";
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {room.type === "private" ? (
                      <Lock size={14} className="shrink-0" />
                    ) : room.type === "dm" ? (
                      <User size={14} className="shrink-0" />
                    ) : (
                      <Hash size={14} className="shrink-0" />
                    )}
                    <span className="flex-1 text-sm truncate">{roomName}</span>
                    {!!unread && (
                      <span
                        className="shrink-0 flex items-center justify-center text-white font-semibold"
                        style={{
                          minWidth: "18px",
                          height: "18px",
                          padding: "0 5px",
                          borderRadius: "9999px",
                          fontSize: "11px",
                          background: "var(--bg-sidebar-hover)",
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
            style={{ color: "var(--text-tertiary)" }}
          >
            No rooms yet.{" "}
            <button
              onClick={() => setShowCreateRoom(true)}
              className="underline transition-colors duration-[120ms]"
              style={{ color: "var(--accent-subtle)" }}
            >
              Create one
            </button>
          </div>
        )}
      </div>

      {/* User bar — bottom, 44px, border-top */}
      <button
        onClick={() => setShowProfileModal(true)}
        className="w-full border-t flex items-center gap-2.5 shrink-0 text-left transition-colors duration-[120ms] ease-out group cursor-pointer"
        style={{
          borderColor: "var(--bg-sidebar-hover)",
          height: "44px",
          padding: "0 12px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--bg-sidebar-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <div className="relative shrink-0">
          <Avatar
            username={user?.username || "?"}
            avatarUrl={user?.avatar}
            size="sm"
          />
          <div className="absolute -bottom-0.5 -right-0.5">
            <StatusDot status="online" pulse size="sm" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--sidebar-text-primary)" }}
          >
            {user?.username}
          </p>
          <p
            className="text-xs truncate"
            style={{ color: "var(--sidebar-text-secondary)" }}
          >
            {user?.email}
          </p>
        </div>
        <Settings
          size={14}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[120ms]"
          style={{ color: "var(--sidebar-text-secondary)" }}
        />
      </button>
    </aside>
  );
}
