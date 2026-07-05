import React, { useState } from "react";
import { Hash, ArrowDown } from "lucide-react";
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
  inputRef: React.RefObject<HTMLInputElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
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
  const [showJumpButton, setShowJumpButton] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop === 0) {
      loadOlderMessages();
    }
    
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowJumpButton(!isNearBottom);
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{ background: "var(--bg-app)" }}
        onScroll={handleScroll}
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

      {showJumpButton && (
        <button
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setShowJumpButton(false);
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-sm transition-all"
        >
          <ArrowDown size={16} />
          Jump to Latest
        </button>
      )}
    </div>
  );
}
