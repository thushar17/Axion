import { useState } from "react";
import { attachment } from "@/src/types/attachment";
export function useMessageStore() {
  const [messages, setMessages] = useState<any[]>([]);
    const [attachment , setAttachment] = useState<attachment | null>(null)
  return {
    messages,
    setMessages,
    attachment, 
    setAttachment
  };
}
