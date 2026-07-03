import { useRef } from "react";

export function useTypingIndicator(selectedRoom: any, emitTyping: (room: any) => void, emitStopTyping: (room: any) => void) {
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = () => {
    if (!selectedRoom) return;
    emitTyping(selectedRoom);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      emitStopTyping(selectedRoom);
    }, 1000);
  };

  const stopTyping = () => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (selectedRoom) {
      emitStopTyping(selectedRoom);
    }
  };

  return { handleTyping, stopTyping };
}
