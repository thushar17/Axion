"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { socket } from "@/src/lib/socket";

export default function ChatPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  // verifying user auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/auth/me",
          {
            withCredentials: true,
          }
        );
        setUser(response.data.user);
        socket.connect();
        setLoading(false);
      } catch (error) {
        console.log(error);
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);


  // trigerring socket events 
  useEffect(() => {
    if (!user) return;

    socket.on("connect", () => {

      socket.emit("join-room", "backend");
    });

    socket.on("connect_error", (err) => {
      console.log("Socket Error:", err.message);
      router.push("/login");
    });

    socket.on("room-joined", (roomId) => {
      socket.emit("message-seen", roomId);
    });

    socket.on("message-history", (history) => {
      setMessages(history.reverse());
      console.log("history", history)
    });

    socket.on("new-message", (message) => {
      setMessages((prev) => [...prev, message]);
      socket.emit("message-delivered", {
        messageId: message._id,
      }
      )
      if (message.sender !== user.id) {
        socket.emit("message-seen", "backend");
      }
    })
    socket.on("message-status-updated", (data) => {
      const ids = Array.isArray(data.messageId) ? data.messageId : [data.messageId];

      setMessages((prev) =>
        prev.map((msg) =>
          ids.includes(String(msg._id))
            ? { ...msg, status: data.status }
            : msg
        )
      );
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("room-joined");
      socket.off("message-history");
      socket.off("new-message");
      socket.off("message-status-updated");

      socket.disconnect();
    };
  }, [user, router]);
  // message send 
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    socket.emit(
      "send-message",
      {
        roomId: "backend",
        content: input,
      },
      (response: any) => {
        console.log("ACK:", response);
      }
    );

    setInput("");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="h-screen bg-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-xl shadow-lg flex flex-col">

        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold">
            Backend Room
          </h1>

          <p className="text-sm text-black">
            {user?.email}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender === user?.id
                ? "justify-end"
                : "justify-start"
                }`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${message.sender === user?.id
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-200 text-black"
                  }`}
              >
                <p>{message.content}</p>

                <div className="mt-1 text-xs opacity-80">
                  {message.status}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="border-t p-4 flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2 outline-none text-black"
          />

          <button
            type="submit"
            className="bg-blue-500 text-white px-5 py-2 rounded-lg"
          >
            Send
          </button>
        </form>

      </div>
    </main>
  );
}