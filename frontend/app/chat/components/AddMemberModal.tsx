import { Modal } from "@/src/components/Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  email: string;
  setEmail: (val: string) => void;
  handleAddMember: (e: React.FormEvent) => void;
};

export function AddMemberModal({
  open,
  onClose,
  email,
  setEmail,
  handleAddMember,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add member"
    >
      <form onSubmit={handleAddMember} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="axion-input"
            placeholder="teammate@company.com"
            required
          />
        </div>
        <div className="flex gap-2">
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
            Add member
          </button>
        </div>
      </form>
    </Modal>
  );
}
