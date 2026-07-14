import React from "react";
import { Avatar } from "@/src/components/Avatar";
import { StatusDot } from "@/src/components/StatusDot";
import { Crown, X, Plus, Link2, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

type Props = {
  members: any[];
  isAdmin: boolean;
  user: any;
  handleRemoveMember: (memberId: string) => void;
  setShowAddMember: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRoom: any;
  handleLinkGeneration: () => void;
  inviteLink: string;
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  handleDm: (memberId: string) => void;
};

export default function MembersSidebar({
  members,
  isAdmin,
  user,
  handleRemoveMember,
  setShowAddMember,
  selectedRoom,
  handleLinkGeneration,
  inviteLink,
  setShowDeleteConfirm,
  handleDm
}: Props) {
  return (
    <aside
      className="shrink-0 border-l flex flex-col h-full hidden lg:flex"
      style={{
        width: "320px",
        background: "var(--surface-1)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 flex items-center border-b shrink-0"
        style={{ borderColor: "var(--border-subtle)", height: "56px" }}
      >
        <h2
          className="text-sm font-semibold tracking-tight"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
        >
          Members
          <span
            className="ml-1.5 text-xs font-normal"
            style={{ color: "var(--text-tertiary)" }}
          >
            {members.length}
          </span>
        </h2>
      </div>

      {/* Member list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {members.map((member: any) => {
          const isMemberAdmin = member.role === "admin";
          return (
            <div
              key={member.user._id}
              className="flex items-center gap-2.5 rounded-lg group transition-colors duration-[120ms] ease-out"
              style={{
                height: "40px",
                padding: "0 8px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
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
                <div className="flex items-center gap-1.5">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {member.user.username}
                  </p>
                  {isMemberAdmin && (
                    <span
                      className="shrink-0 text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(227, 160, 8, 0.12)",
                        color: "var(--warning)",
                        fontSize: "10px",
                      }}
                    >
                      Admin
                    </span>
                  )}
                </div>
                <p
                  className="text-xs truncate capitalize"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {member.user.status || "offline"}
                </p>
              </div>

              {/* Actions — visible on hover */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-[120ms]">
                {/* DM button */}
                <button
                  onClick={() => handleDm(member.user._id)}
                  className="w-7 h-7 flex items-center justify-center rounded-md transition-colors duration-[120ms]"
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-4)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
                  }}
                  title={`Message ${member.user.username}`}
                  aria-label={`Message ${member.user.username}`}
                >
                  <MessageSquare size={13} />
                </button>

                {/* Remove (admin, not self) */}
                {isAdmin && member.user._id !== user?.id && (
                  <button
                    onClick={() => handleRemoveMember(member.user._id)}
                    className="w-7 h-7 flex items-center justify-center rounded-md transition-colors duration-[120ms]"
                    style={{ color: "var(--text-tertiary)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--danger-tint)";
                      (e.currentTarget as HTMLElement).style.color = "var(--danger)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
                    }}
                    title="Remove member"
                    aria-label="Remove member"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {members.length === 0 && (
          <p
            className="text-xs text-center py-8"
            style={{ color: "var(--text-tertiary)" }}
          >
            No members
          </p>
        )}
      </div>

      {/* Bottom actions */}
      {selectedRoom && (
        <div
          className="p-3 space-y-1 border-t shrink-0"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {/* Add member */}
          <button
            onClick={() => setShowAddMember(true)}
            className="w-full flex items-center gap-2 rounded-lg text-sm font-medium transition-colors duration-[120ms] ease-out"
            style={{ height: "34px", padding: "0 12px", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <Plus size={14} />
            Add member
          </button>

          {/* Invite link */}
          <button
            onClick={handleLinkGeneration}
            className="w-full flex items-center gap-2 rounded-lg text-sm font-medium transition-colors duration-[120ms] ease-out"
            style={{ height: "34px", padding: "0 12px", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <Link2 size={14} />
            Copy invite link
          </button>

          {/* Invite link display */}
          {inviteLink && (
            <div
              className="rounded-lg px-3 py-2 text-xs break-all font-mono cursor-pointer border transition-colors duration-[120ms]"
              style={{
                background: "var(--surface-3)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-tertiary)",
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
              className="w-full flex items-center gap-2 rounded-lg text-sm font-medium transition-colors duration-[120ms] ease-out"
              style={{ height: "34px", padding: "0 12px", color: "var(--danger)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--danger-tint)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
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
