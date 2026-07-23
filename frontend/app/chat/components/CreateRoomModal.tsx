import { Modal } from "@/src/components/Modal";
import { Hash, Lock } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  roomName: string;
  setRoomName: (val: string) => void;
  roomType: string;
  setRoomType: (val: any) => void;
  handleRoomCreation: (e: React.FormEvent) => void;
};

export function CreateRoomModal({
  open,
  onClose,
  roomName,
  setRoomName,
  roomType,
  setRoomType,
  handleRoomCreation,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a channel"
    >
      <form onSubmit={handleRoomCreation} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Channel name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="zync-input"
            placeholder="e.g. general"
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Type
          </label>
          <div className="flex gap-2">
            {(["public", "private"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setRoomType(t)}
                className="flex-1 flex items-center gap-2 px-3 rounded-lg text-sm transition-colors duration-[120ms] ease-out border"
                style={{
                  height: "36px",
                  background: roomType === t ? "var(--accent-tint)" : "var(--surface-4)",
                  borderColor: roomType === t ? "var(--accent)" : "var(--border-subtle)",
                  color: roomType === t ? "var(--accent-subtle)" : "var(--text-secondary)",
                  fontWeight: roomType === t ? 500 : 400,
                }}
              >
                {t === "public" ? <Hash size={13} /> : <Lock size={13} />}
                <span className="capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg text-sm transition-colors duration-[120ms] ease-out border"
            style={{
              height: "36px",
              color: "var(--text-secondary)",
              borderColor: "var(--border-default)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--surface-4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg text-sm font-semibold text-white transition-colors duration-[120ms] ease-out"
            style={{
              height: "36px",
              background: "var(--accent)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--accent-hover)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--accent)";
            }}
          >
            Create channel
          </button>
        </div>
      </form>
    </Modal>
  );
}
