import React, { useRef, useState } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { uploadAttachment } from "../services/message.service";
import { toast } from "sonner";

type Props = {
  sendMessage: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedRoom: any;
  input: string;
  setInput: (value: string) => void;
};

export default function MessageInput({
  sendMessage,
  inputRef,
  handleInputChange,
  selectedRoom,
  input,
  setInput
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadAttachment(file);
      if (res.data.success) {
        setInput(input + (input ? " " : "") + res.data.url);
        toast.success("File uploaded successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
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
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!selectedRoom || isUploading}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 text-gray-500 hover:text-gray-700 disabled:opacity-30"
          style={{ color: "var(--text-secondary)" }}
        >
          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
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