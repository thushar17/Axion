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
                  ) : room.type === "dm" ? (
                    <User size={14} />
                  ) : (
                    <Hash size={14} />
                  )}
                </span>
                {/* Name */}
                <span className="flex-1 text-sm truncate font-medium">
                  {roomName}
                  {room.lastMessage && (
                    <span className="text-xs truncate block font-normal" style={{ color: "var(--text-muted)" }}>
                      {room.lastMessage.content || room.lastMessage.type}
                    </span>
                  )}
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
                      ) : room.type === "dm" ? (
                        <User size={14} className="shrink-0" />
                      ) : (
                        <Hash size={14} className="shrink-0" />
                      )}
                      <span className="flex-1 text-sm truncate font-medium">
                        {roomName}
                        {room.lastMessage && (
                          <span className="text-xs truncate block font-normal" style={{ color: "var(--text-muted)" }}>
                            {room.lastMessage.content || room.lastMessage.type}
                          </span>
                        )}
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
        <button
          onClick={() => setShowProfileModal(true)}
          className="w-full px-3 py-3 border-t flex items-center gap-2.5 shrink-0 text-left hover:bg-[var(--bg-surface-hover)] transition-colors group cursor-pointer"
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
          <div className="flex items-center gap-2">
            <Settings size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }} />
            <StatusDot status="online" pulse size="sm" />
          </div>
        </button>
      </aside>
  );
}
