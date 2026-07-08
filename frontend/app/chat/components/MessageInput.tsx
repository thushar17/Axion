
import React, { useRef, useState } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { uploadAttachment } from "../services/message.service";
import { toast } from "sonner";
import { attachment } from "@/src/types/attachment";




type Props = {
  sendMessage: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedRoom: any;
  input: string;
  setInput: (value: string) => void;
  attachment: attachment | null
  setAttachment: React.Dispatch<React.SetStateAction<attachment | null>>
};

export default function MessageInput({
  sendMessage,
  inputRef,
  handleInputChange,
  selectedRoom,
  input,
  setInput,
  attachment,
  setAttachment
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
          console.log("response",res.data)
          setAttachment({
            url:res.data.url,
            publicId: res.data.publicId,
             fileName: res.data.fileName,
            mimeType: res.data.mimeType,
          })
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

  const renderPreview = () => {
  if (!attachment) return null;

  if (attachment.mimeType.startsWith("image/")) {
    return (
      <img
        src={attachment.url}
        alt={attachment.fileName}
        className="max-h-48 rounded-lg object-cover"
      />
    );
  }

  if (attachment.mimeType === "application/pdf") {
    return (
      <div className="flex items-center justify-center h-32">
        📄 PDF Preview
      </div>
    );
  }

  if (attachment.mimeType.startsWith("video/")) {
    return (
      <video
        src={attachment.url}
        controls
        className="max-h-48 rounded-lg"
      />
    );
  }

  if (attachment.mimeType.startsWith("audio/")) {
    return (
      <audio
        src={attachment.url}
        controls
      />
    );
  }

  return <div>Unsupported file</div>;
};
  return (
    <form
      onSubmit={sendMessage}
      className="px-4 py-3 border-t shrink-0 flex flex-col gap-2"
      style={{
        background: "var(--bg-sidebar)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {attachment && (
        <div className="rounded-xl border p-2 w-fit relative group" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
          {renderPreview()}
          <div className="flex items-center justify-between mt-2 gap-4">
            <p className="text-sm truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>
              {attachment.fileName}
            </p>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2 border w-full"
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
          disabled={(!input.trim() && !attachment) || !selectedRoom || isUploading}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-30"
          style={{ background: "var(--accent)", color: "white" }}
        >
          <Send size={14} />
        </button>
      </div>
    </form>
  );
}