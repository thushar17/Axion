"use client";

import { useEffect } from "react";
import { socket } from "@/src/lib/socket";

export default function ChatPage() {
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <h1>Chat Page</h1>;
}