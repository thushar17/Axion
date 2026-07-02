import React from "react";
import { Avatar } from "@/src/components/Avatar";
import { StatusDot } from "@/src/components/StatusDot";
import { Crown, X, Plus, Link2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  members: any[];
  isAdmin: boolean;
  user: any;
  handelRemoveMember: (memberId: string) => void;
  setShowAddMember: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRoom: any;
  handelLinkGeneration: () => void;
  inviteLink: string;
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function MembersSidebar({
  members,
  isAdmin,
  user,
  handelRemoveMember,
  setShowAddMember,
  selectedRoom,
  handelLinkGeneration,
  inviteLink,
  setShowDeleteConfirm
}: Props) {
  return (
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
        {members.map((member: any) => {
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
  );
}