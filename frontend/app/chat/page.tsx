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
  const [roomName, setRoomName] = useState("")
  const [roomType, setRoomType] = useState("")
  const [allRooms , setAllRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
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

  // fetching all rooms
const fetchRooms = async()=>{
     try {
       const response = await axios.get("http://localhost:8000/room/getRooms")
       if(response.status!== 200){
        return alert(
          'faliled to fetch rooms'
        )
       }
      setAllRooms(response.data.data)
      if(response.data.data.length>0){
        setSelectedRoom(response.data.data[0])
      }

     } catch (error) {
      
     }
  }

  // room creatin form 
  const handleRoomCreation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/room/create",
        {
          name: roomName,
          type: roomType
        }, {
        withCredentials: true
      }
      )

      if (response.status == 400) {
        return alert("Error while creating room")
      }
      alert(response.data.message)
      await fetchRooms()
      setRoomName("")
      setRoomType("")
    } catch (error) {
      console.log(error)
    }

  }

useEffect(()=>{
  fetchRooms()
},[])

// join selected rooms
useEffect(()=>{
  if(!selectedRoom) return

  socket.emit('join-room',selectedRoom.name)
},[selectedRoom])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

 return (
  <main className="h-screen bg-zinc-950 flex p-4 gap-4">

    {/* Sidebar */}
    <div className="w-80 h-full bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden">

      {/* User Info */}
      <div className="p-5 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-white">
          Zync
        </h1>

        <p className="text-zinc-400 text-sm mt-1">
          {user?.email}
        </p>
      </div>

      {/* Create Room */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-white font-semibold mb-3">
          Create Room
        </h2>

        <form
          onSubmit={handleRoomCreation}
          className="space-y-3"
        >
          <input
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full rounded-lg bg-zinc-800 text-white px-3 py-2 outline-none border border-zinc-700"
          />

          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full rounded-lg bg-zinc-800 text-white px-3 py-2 border border-zinc-700"
          >
            <option value="">Select Type</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-2 text-white font-medium"
          >
            + Create Room
          </button>
        </form>
      </div>

      {/* Rooms */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
          Rooms
        </h2>

        <div className="space-y-2">
          {allRooms.map((room: any) => (
            <button
              key={room._id}
              onClick={()=>setSelectedRoom(room)}
              className={`w-full text-left px-3 py-3 rounded-lg transition ${
  selectedRoom?._id === room._id
    ? "bg-blue-600 text-white"
    : "bg-zinc-800 text-white hover:bg-zinc-700"
}`}
            >
              # {room.name}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Chat Area */}
    <div className="flex-1 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">

      {/* Chat Header */}
      <div className="border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-black">
              {selectedRoom?.name || "Select Room"}
          </h1>

          <p className="text-sm text-zinc-500">
            Real-time chat room
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>

          <span className="text-sm text-zinc-600">
            Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-zinc-50">

        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.sender === user?.id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                message.sender === user?.id
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
              }`}
            >
              <p>{message.content}</p>

              <div className="mt-2 text-xs opacity-70 flex justify-end">
                {message.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="border-t bg-white p-4 flex gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-xl px-4 py-3 outline-none text-black focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 rounded-xl"
        >
          Send
        </button>
      </form>
    </div>
  </main>
);
}