import { ConfirmModal } from "@/src/components/Modal";

type DeleteProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roomName?: string;
};

export function DeleteRoomConfirmModal({ open, onClose, onConfirm, roomName }: DeleteProps) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete room"
      description={`Are you sure you want to delete "${roomName}"? This action cannot be undone and all messages will be lost.`}
      confirmLabel="Delete room"
      danger
    />
  );
}

type LeaveProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roomName?: string;
};

export function LeaveRoomConfirmModal({ open, onClose, onConfirm, roomName }: LeaveProps) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Leave room"
      description={`Are you sure you want to leave "${roomName}"?`}
      confirmLabel="Leave room"
      danger
    />
  );
}

type ClearProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ClearChatConfirmModal({ open, onClose, onConfirm }: ClearProps) {
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Clear chat history"
      description="This will delete all messages in this room. This cannot be undone."
      confirmLabel="Clear chat"
      danger
    />
  );
}
