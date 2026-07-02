import React from "react";
import { Send } from "lucide-react";

type Props = {
  sendMessage: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  handelInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedRoom: any;
  input: string;
};

export default function MessageInput({
  sendMessage,
  inputRef,
  handelInputChange,
  selectedRoom,
  input
}: Props) {
  return (
    <form
      onSubmit={sendMessage}
      className="px-4 py-3 border-t shrink-0"
      style={{
        background: "var(--bg-sidebar)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2 border"
        style={{
          background: "var(--bg-input)",
          borderColor: "var(--border)",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handelInputChange}
          placeholder={
            selectedRoom
              ? `Message #${selectedRoom.name}`
              : "Select a channel"
          }
          disabled={!selectedRoom}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--text-primary)" }}
        />
        <button
          type="submit"
          disabled={!input.trim() || !selectedRoom}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-30"
          style={{ background: "var(--accent)", color: "white" }}
        >
          <Send size={14} />
        </button>
      </div>
    </form>
  );
}