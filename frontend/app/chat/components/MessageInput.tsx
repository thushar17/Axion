
import React, { useRef, useState } from "react";
import { Send, Paperclip, Loader2, X } from "lucide-react";
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
        className="max-h-40 rounded-lg object-cover"
      />
    );
  }

  if (attachment.mimeType === "application/pdf") {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        📄 {attachment.fileName}
      </div>
    );
  }

  if (attachment.mimeType.startsWith("video/")) {
    return (
      <video
        src={attachment.url}
        controls
        className="max-h-40 rounded-lg"
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

  return (
    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
      📎 {attachment.fileName}
    </div>
  );
};

  const hasContent = input.trim() || attachment;

  return (
    <form
      onSubmit={sendMessage}
      className="shrink-0 flex flex-col gap-2"
      style={{
        padding: "16px",
      }}
    >
      {/* Composer container */}
      <div
        className="flex flex-col rounded-xl border"
        style={{
          background: "var(--surface-3)",
          borderColor: "var(--border-default)",
          minHeight: "44px",
        }}
      >
        {/* Attachment preview */}
        {attachment && (
          <div
            className="px-3 pt-3"
          >
            <div
              className="inline-flex flex-col gap-2 rounded-lg border p-2 relative group"
              style={{
                background: "var(--surface-4)",
                borderColor: "var(--border-subtle)",
                maxWidth: "280px",
              }}
            >
              {renderPreview()}
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs truncate" style={{ color: "var(--text-secondary)", maxWidth: "200px" }}>
                  {attachment.fileName}
                </p>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors duration-[120ms]"
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--danger-tint)";
                    (e.currentTarget as HTMLElement).style.color = "var(--danger)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
                  }}
                  aria-label="Remove attachment"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedRoom || isUploading}
            className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0 transition-colors duration-[120ms] ease-out disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                (e.currentTarget as HTMLElement).style.background = "var(--surface-4)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
            }}
            aria-label="Attach file"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Text input */}
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
            className="flex-1 bg-transparent outline-none text-sm disabled:cursor-not-allowed"
            style={{
              color: "var(--text-primary)",
              caretColor: "var(--accent)",
            }}
          />

          {/* Send button — accent when has content, ghost when empty */}
          <button
            type="submit"
            disabled={!hasContent || !selectedRoom || isUploading}
            className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0 transition-colors duration-[120ms] ease-out disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: hasContent ? "var(--accent)" : "transparent",
              color: hasContent ? "white" : "var(--text-tertiary)",
            }}
            aria-label="Send message"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </form>
  );
}
