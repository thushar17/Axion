import { useCallback, useState, useRef, useEffect } from "react";
import { editMessage, deleteMessage, getPaginatedMessages, pinMessage, toggleReaction } from "../services/message.service";
import { getStarredMessages, starMessage, clearChat } from "../services/auth.service";
import { toast } from "sonner";
import { socket } from "@/src/lib/socket";
import { getSenderId } from "../utils/getSenderId";

type Props = {
  user: any;
  selectedRoomRef: React.MutableRefObject<any>;
  setUnreadMessageCount: React.Dispatch<React.SetStateAction<{ [roomId: string]: number }>>;
  emitMessage: (selectedRoom: any, input: string, replyingTo: any, attachment?: any) => void;
  emitStopTyping: (selectedRoom: any) => void;
  selectedRoom: any;
  allRooms: any[];
  setSelectedRoom: React.Dispatch<React.SetStateAction<any>>;
  setShowClearConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  attachment?: any;
  setAttachment?: React.Dispatch<React.SetStateAction<any>>;
}

export function useMessage({ user, selectedRoomRef, setUnreadMessageCount, emitMessage, emitStopTyping, selectedRoom, allRooms, setSelectedRoom, setShowClearConfirm, messages, setMessages, attachment, setAttachment }: Props) {
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: any;
  } | null>(null);


  const [starredMessageIds, setStarredMessageIds] = useState<string[]>([]);
  const [showStarredPanel, setShowStarredPanel] = useState(false);
  const [starredMessages, setStarredMessages] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);



  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleClearChat = async (roomId: string) => {
    try {
      const response = await clearChat(roomId);
      if (response.data.success) {
        setMessages([]);
        toast.success("Chat cleared");
        setShowClearConfirm(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear chat");
    }
  };

  const scrollToMessage = (messageId: string, roomId?: string) => {
    if (roomId && selectedRoomRef.current?._id !== roomId) {
      const targetRoom = allRooms.find((r) => r._id === roomId);
      if (targetRoom) {
        setSelectedRoom(targetRoom);
        setTimeout(() => {
          const element = document.getElementById(`msg-${messageId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("highlight-message");
            setTimeout(() => element.classList.remove("highlight-message"), 2000);
          }
        }, 800);
        return;
      }
    }
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("highlight-message");
      setTimeout(() => element.classList.remove("highlight-message"), 2000);
    }
  };



  const handleEditMessage = async () => {
    if (!input.trim()) return;
    try {
      const response = await editMessage(editingMessageId as string, input);
      if (response.data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === editingMessageId
              ? { ...msg, content: input, isEdited: true }
              : msg
          )
        );
        setEditingMessageId(null);
        setInput("");
      } else {
        toast.error(response.data.message || "Failed to edit message");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to edit message");
    }
  };


  // delete message 

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await deleteMessage(messageId);
      if (response.data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, isDeleted: true, content: "This message was deleted" }
              : msg
          )
        );
      } else {
        toast.error(response.data.message || "Failed to delete message");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete message");
    }
  };


  // load message 

  const loadMessages = async (roomId: string) => {
    console.log("hello",allRooms)
    try {
      const response = await getPaginatedMessages(roomId);

      setMessages(response.data.messages.reverse());

      setCursor(response.data.nextCursor);

      setHasMore(response.data.hasMore);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error(error);
    }
  };

  // send message 

  const handlePinMessage = async (messageId: string) => {
    try {
      const response = await pinMessage(messageId);
      if (!response.data.success) {
        toast.error(response.data.message || "Failed to pin message");
      }
      else {
        setContextMenu(null)
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to pin message");
    }
  };

  // fetch message 
  const fetchStarredMessages = async () => {
    try {
      const response = await getStarredMessages();
      if (response.data.success) {
        setStarredMessages(response.data.messages);
      }
    } catch (error) {
      console.error(error);
    }
  };


  // stared message
  const handleStarMessage = async (messageId: string) => {
    try {
      const response = await starMessage(messageId);
      if (response.data.success) {
        const starred = response.data.starredMessages;
        setStarredMessageIds(starred);
        if (showStarredPanel) fetchStarredMessages();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to star message");
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await toggleReaction(messageId, emoji);
      if (response.data.success) {
        setContextMenu(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const pinnedMessages = messages
    .filter((message) => message.pinned?.isPinned)
    .sort(
      (a, b) =>
        new Date(b.pinned?.pinnedAt || 0).getTime() -
        new Date(a.pinned?.pinnedAt || 0).getTime()
    );

  const loadOlderMessages = async (roomId: string) => {
    if (!roomId || !cursor || !hasMore || loadingMore) return;
    try {
      setLoadingMore(true);
      const response = await getPaginatedMessages(roomId, cursor);
      setMessages((prev) => [
        ...response.data.messages.reverse(),
        ...prev,
      ]);
      setCursor(response.data.nextCursor);
      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };


  useEffect(() => {
    if (!user) return;

    socket.on("new-message", (message) => {
      const currentRoom = selectedRoomRef.current;
      if (currentRoom && message.roomId === currentRoom._id) {
        setMessages((prev) => [...prev, message]);
        if (getSenderId(message.sender) !== user.id) {
          socket.emit("message-seen", currentRoom._id);
        }
        setTimeout(scrollToBottom, 60);
      } else {
        setUnreadMessageCount((prev: any) => ({
          ...prev,
          [message.roomId]: (prev[message.roomId] || 0) + 1,
        }));
      }
      socket.emit("message-delivered", { messageId: message._id });
    });

    socket.on("message-status-updated", (data) => {
      const ids = Array.isArray(data.messageId) ? data.messageId : [data.messageId];
      setMessages((prev) =>
        prev.map((msg) =>
          ids.includes(String(msg._id)) ? { ...msg, status: data.status } : msg
        )
      );
    });

    socket.on("message-deleted", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, content: data.content, isDeleted: true }
            : msg
        )
      );
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.replyTo && msg.replyTo._id === data.messageId) {
            return {
              ...msg,
              replyTo: { ...msg.replyTo, content: data.content, isDeleted: true },
            };
          }
          return msg;
        })
      );
    });

    socket.on("message-pinned", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, pinned: data.pinned } : msg
        )
      );
    });

    socket.on("message-edit", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, content: data.content, isEdited: data.isEdited }
            : msg
        )
      );
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.replyTo && msg.replyTo._id === data.messageId) {
            return {
              ...msg,
              replyTo: { ...msg.replyTo, content: data.content, isEdited: data.isEdited },
            };
          }
          return msg;
        })
      );
    });

    socket.on("user-reacted", (data) => {
      setMessages((prev) =>
        prev.map((message) =>
          message._id === data.messageId
            ? { ...message, reactions: data.messageReaction }
            : message
        )
      );
    });

    return () => {
      socket.off("new-message");
      socket.off("message-status-updated");
      socket.off("message-deleted");
      socket.off("message-pinned");
      socket.off("message-edit");
      socket.off("user-reacted");
    };
  }, [user, selectedRoomRef, setUnreadMessageCount, scrollToBottom]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const currentRoom = selectedRoomRef.current;
    if ((!input.trim() && !attachment) || !currentRoom) return;

    if (editingMessageId) {
      handleEditMessage();
      return;
    }
    emitMessage(currentRoom, input, replyingTo, attachment);
    emitStopTyping(currentRoom);

    setInput("");
    setReplyingTo(null);
    if (setAttachment) setAttachment(null);
  };

  return {
    messages,
    setMessages,
    editingMessageId,
    setEditingMessageId,
    handleEditMessage,
    handleDeleteMessage,
    cursor,
    setCursor,
    hasMore,
    setHasMore,
    loadMessages,
    scrollToBottom,
    messagesEndRef,
    handlePinMessage,
    contextMenu,
    setContextMenu,
    handleStarMessage,
    setStarredMessageIds,
    starredMessageIds,
    showStarredPanel,
    setShowStarredPanel,
    fetchStarredMessages,
    starredMessages,
    loadingMore,
    handleReaction,
    pinnedMessages,
    loadOlderMessages,
    sendMessage,
    input,
    setInput,
    replyingTo,
    setReplyingTo,
    handleClearChat,
    scrollToMessage
  };
}