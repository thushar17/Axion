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

function EmptyIcon() {
  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{ color: "var(--text-tertiary)", opacity: 0.4 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
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
        className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5"
        style={{ background: "var(--surface-2)" }}
        onScroll={handleScroll}
      >
        {/* Loading older */}
        {loadingMore && (
          <div
            className="text-center text-xs py-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            Loading older messages…
          </div>
        )}

        {/* No room selected */}
        {!selectedRoom && (
          <div
            className="h-full flex flex-col items-center justify-center text-center gap-3"
            style={{ color: "var(--text-tertiary)" }}
          >
            <Hash size={32} style={{ opacity: 0.3 }} />
            <div>
              <p
                className="text-base font-semibold mb-1"
                style={{ color: "var(--text-secondary)", letterSpacing: "-0.01em" }}
              >
                Select a channel
              </p>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                Choose a channel from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}

        {/* Empty channel */}
        {selectedRoom && messages.length === 0 && (
          <div
            className="h-full flex flex-col items-center justify-center text-center gap-3"
            style={{ color: "var(--text-tertiary)" }}
          >
            <EmptyIcon />
            <div>
              <p
                className="text-base font-semibold mb-1"
                style={{ color: "var(--text-secondary)", letterSpacing: "-0.01em" }}
              >
                No messages yet
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--text-tertiary)", maxWidth: "320px" }}
              >
                Be the first to say something!
              </p>
            </div>
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

      {/* Jump to latest */}
      {showJumpButton && (
        <button
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setShowJumpButton(false);
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 text-white text-sm font-medium rounded-full px-4 transition-opacity duration-[120ms]"
          style={{
            background: "var(--accent)",
            height: "36px",
            boxShadow: "var(--elevation-2)",
          }}
        >
          <ArrowDown size={14} />
          Jump to latest
        </button>
      )}
    </div>
  );
}
