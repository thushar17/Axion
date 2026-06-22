"use client";

import { useEffect } from "react";
import { socket } from "@/src/lib/socket";

export default function ChatPage() {
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);

      socket.emit("join-room","backend")

      socket.emit("send-message",
        {
          content: " hello from frontend",
          roomId: "backend"
        },
        (response: any)=>{
          console.log(response)
        }
      )
    });

      socket.on("room-joined", (roomId) => {
  console.log("Joined room:", roomId);
});

socket.on("message-history", (messages) => {
  console.log("History:", messages);
});

socket.on("new-message", (message) => {
  console.log("New Message:", message);
});

    return () => {
      socket.disconnect();
    };
  }, []);

  return <h1>Chat Page</h1>;
}