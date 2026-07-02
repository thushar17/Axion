import React from "react";
import { Hash } from "lucide-react";
import MessageBubble from "./MessageBubble";

type Props = {
  loadOlderMessages: () => void;
  loadingMore: boolean;
  selectedRoom: any;
  messages: any[];
  user: any;
  hoveredMsgId: string | null;
  setHoveredMsgId: React.Dispatch<React.SetStateAction<string | null>>;
  setContextMenu: React.Dispatch<React.SetStateAction<any>>;
  scrollToMessage: (messageId: string) => void;
  handleReaction: (messageId: string, emoji: string) => void;
  DeliveryTick: React.FC<any>;
  setReplyingTo: React.Dispatch<React.SetStateAction<any>>;
  setEditingMessageId: React.Dispatch<React.SetStateAction<string | null>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  inputRef: React.RefObject<HTMLInputElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
};

function MessageIconPlaceholder() {
  return (
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center opacity-20"
      style={{ background: "var(--bg-surface)" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </div>
  );
}

export default function ChatMessage({
  loadOlderMessages,
  loadingMore,
  selectedRoom,
  messages,
  user,
  hoveredMsgId,
  setHoveredMsgId,
  setContextMenu,
  scrollToMessage,
  handleReaction,
  DeliveryTick,
  setReplyingTo,
  setEditingMessageId,
  setInput,
  inputRef,
  messagesEndRef
}: Props) {
  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      style={{ background: "var(--bg-app)" }}
      onScroll={(e) => {
        if ((e.target as HTMLDivElement).scrollTop === 0) {
          loadOlderMessages();
        }
      }}
    >
      {loadingMore && <div className="text-center text-xs py-2" style={{ color: "var(--text-muted)" }}>Loading older messages...</div>}

      {!selectedRoom && (
        <div
          className="h-full flex flex-col items-center justify-center text-center gap-3"
          style={{ color: "var(--text-muted)" }}
        >
          <Hash size={40} className="opacity-30" />
          <p className="text-sm">Select a channel to start chatting</p>
        </div>
      )}

      {selectedRoom && messages.length === 0 && (
        <div
          className="h-full flex flex-col items-center justify-center text-center gap-3"
          style={{ color: "var(--text-muted)" }}
        >
          <MessageIconPlaceholder />
          <p className="text-sm">
            No messages yet — be the first to say something!
          </p>
        </div>
      )}

      {messages.map((message, idx) => (
        <MessageBubble
          key={message._id}
          message={message}
          idx={idx}
          messages={messages}
          user={user}
          hoveredMsgId={hoveredMsgId}
          setHoveredMsgId={setHoveredMsgId}
          setContextMenu={setContextMenu}
          scrollToMessage={scrollToMessage}
          handleReaction={handleReaction}
          DeliveryTick={DeliveryTick}
          setReplyingTo={setReplyingTo}
          setEditingMessageId={setEditingMessageId}
          setInput={setInput}
          inputRef={inputRef}
        />
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}
