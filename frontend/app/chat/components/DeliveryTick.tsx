import { Check, CheckCheck } from "lucide-react";

export function DeliveryTick({ status, isMe }: { status: string; isMe: boolean }) {
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
