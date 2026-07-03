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
            className="axion-input"
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
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all"
                style={{
                  background:
                    roomType === t
                      ? "var(--accent-muted)"
                      : "var(--bg-surface-hover)",
                  borderColor:
                    roomType === t ? "var(--accent)" : "var(--border)",
                  color:
                    roomType === t
                      ? "var(--accent-hover)"
                      : "var(--text-secondary)",
                }}
              >
                {t === "public" ? <Hash size={13} /> : <Lock size={13} />}
                <span className="capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--bg-surface-hover)]"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all btn-glow"
            style={{ background: "var(--accent)" }}
          >
            Create channel
          </button>
        </div>
      </form>
    </Modal>
  );
}
