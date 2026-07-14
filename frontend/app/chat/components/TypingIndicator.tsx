export function TypingIndicator({ users }: { users: string[] }) {
  if (!users.length) return null;
  return (
    <div
      className="flex items-center gap-2 px-4 py-1.5"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="flex gap-1 items-end">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
        {users.length === 1
          ? `${users[0]} is typing…`
          : `${users.join(", ")} are typing…`}
      </span>
    </div>
  );
}
