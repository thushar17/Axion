"use client";

import { useEffect } from "react";
import { socket } from "@/src/lib/socket";

export default function ChatPage() {
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);

      socket.emit("join-room", "backend")

      socket.emit("send-message",
        {
          content: " hello from frontend",
          roomId: "backend"
        },
        (response: any) => {
          console.log(response)
        }
      )
    });

    socket.on("room-joined", (roomId) => {
      console.log("hello")
      console.log("Joined room:", roomId);

      socket.emit("message-seen",
        roomId
      )
    });

    // revieved new message
    socket.on("new-message", (message) => {
      console.log("New Message:", message);

      socket.emit("message-delivered",
        { messageId: message._id }
      )
    });

    // listening for messsage deliverd 

    socket.on("message-status-updated", (data) => {
      console.log("MEssage status updates:", data)
    })

    socket.on("message-history", (messages) => {

      console.log("History:", messages);
    });



    return () => {
      socket.disconnect();
    };
  }, []);

  return <h1>Chat Page</h1>;
}