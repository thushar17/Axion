import { useState } from "react";

export function useMessageStore() {
  const [messages, setMessages] = useState<any[]>([]);

  return {
    messages,
    setMessages,
  };
}
