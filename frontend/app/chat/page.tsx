"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, FormEvent } from "react";
import { socket } from "@/src/lib/socket";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ChatPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [roomName, setRoomName] = useState("")
  const [roomType, setRoomType] = useState("")
  const [allRooms, setAllRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const selectedRoomRef = useRef<any>(null);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  const [members, setMembers] = useState<any[]>([])
  const [showAddMember, setShowAddMember] = useState(false);
  const [email, setEmail] = useState("")
  const [typingUsers, setTypingUsers] = useState<any[]>([])
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState<{ [roomId: string]: number }>({})
  const [inviteLink , setInviteLink] = useState("")
  const [replyingTo, setReplyingTo] = useState<any>(null)
  // verifying user auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/auth/me`,
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
      const currentRoom = selectedRoomRef.current;
      console.log(`hello i amm message id`, currentRoom)
      
      if (currentRoom && message.roomId === currentRoom._id) {
        setMessages((prev) => [...prev, message]);
        if (message.sender !== user.id) {
          socket.emit("message-seen", currentRoom._id);
        }
      } else {
        setUnreadMessageCount((prev) => ({
          ...prev,
          [message.roomId]: (prev[message.roomId] || 0) + 1,
        }))
      }

      socket.emit("message-delivered", {
        messageId: message._id,
      })
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

    socket.on("typing-status", (data) => {
      setTypingUsers((prev) => {
        if (prev.includes(data.username)) return prev;
        return [...prev, data.username]
      })
    })

    socket.on("stop-typing-status", (data) => {
      setTypingUsers((prev) =>
        prev.filter((name) => name !== data.username)
      );
    });

    socket.on("member-removed", (data) => {
      if (data.memberId === user.id) {
        setAllRooms((prev) => {
          const updatedRooms = prev.filter((room) => room._id !== data.roomId);

          if (selectedRoomRef.current?._id === data.roomId) {
            setSelectedRoom(updatedRooms[0] ?? null);
            setMessages([]);
            setMembers([]);
          }

          return updatedRooms;
        });

        return;
      }

      setMembers((prev) =>
        prev.filter((member) => member.user._id !== data.memberId)
      );
    });

    socket.on("room-deleted",(data)=>{
       setAllRooms((prev)=>{
        const roomId = selectedRoomRef.current?._id
          const updateRoom = prev.filter((room)=> room._id!== data.roomId)
          if(roomId === data.roomId){
            setSelectedRoom(updateRoom[0]|| null)
            setMembers([])
            setMembers([])
          }
          return updateRoom
         
       })
       
       return;
    })

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("room-joined");
      socket.off("message-history");
      socket.off("new-message");
      socket.off("message-status-updated");
      socket.off("typing-status")
      socket.off("stop-typing-status");
      socket.off("typing-status");
      socket.off("member-removed");
      socket.off("room-deleted")

      socket.disconnect();
    };
  }, [user, router]);
  // message send 
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !selectedRoom) return;
     
    socket.emit(
      "send-message",
      {
        roomId: selectedRoom._id,
        content: input,
        replyTo: replyingTo?._id
      },
      (response: any) => {
        console.log("ACK:", response);
      }
    );
    socket.emit("stop-typing", {
      roomId: selectedRoom.name,
      username: user.username,
    });

    setInput("");
  };


  // fetching all rooms
  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/room/getRooms`, {
        withCredentials: true
      })
      if (response.status !== 200) {
        return alert(
          'faliled to fetch rooms'
        )
      }
      setAllRooms(response.data.data)

      const roomIds = response.data.data.map((r: any) => r._id);
      socket.emit('join-rooms', roomIds);

      if (response.data.data.length > 0) {
        setSelectedRoom(response.data.data[0])
      }

    } catch (error) {

    }
  }

  // room creatin form 
  const handleRoomCreation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/room/create`,
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

  useEffect(() => {
    fetchRooms()

  }, [])

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/room/${selectedRoom._id}/members`, {
        withCredentials: true
      })
      
      setMembers(response.data.members)
    } catch (error) {
      console.error(error)
    }
  }
  // join selected rooms
  useEffect(() => {
    if (!selectedRoom) return

    socket.emit('join-room', selectedRoom._id)

    setUnreadMessageCount(prev => {
      const newCount = { ...prev };
      delete newCount[selectedRoom._id];
      return newCount;
    });

    fetchMembers()
  }, [selectedRoom])


  // add member handel

  const handleAddMember = async () => {
    if (!selectedRoom) return;
    try {
      const response = await axios.post(`${API_URL}/room/add-member`, {
        email,
        roomId: selectedRoom._id
      }, {
        withCredentials: true
      })

      if (response.data.success) {
        alert(response.data.message)
      }
      await fetchMembers()
    } catch (error) {
      console.log(error)
    }
  }

  // 
  const handelInputChange = (e: any) => {
    setInput(e.target.value)
    if (!selectedRoom) return;
    socket.emit("typing",
      {
        roomId: selectedRoom._id,
        username: user?.username


      }
    )
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
    }

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop-typing", {
        roomId: selectedRoom._id,
        username: user.username

      })
    }, 1000);
  }

 // remove member
 const handelRemoveMember = async(memberId: string) =>{
      try {
        const response = await axios.delete(`${API_URL}/room/remove-member`,
          {
            data:{
               memberId,
            roomId: selectedRoom._id
            },
            withCredentials: true
          }
           
        )
       if(response.data.success){
        alert('member removed ')
       }
      } catch (error) {
        console.log(error) 
      }
 }

 // is Admin
  const isAdmin = members.some(
  (member) =>
    member.user._id === user.id &&
    member.role === "admin"
);

// generate invite link 
  const handelLinkGeneration =async ()=>{
       try {
          const response = await axios.post(`${API_URL}/room/generate-invite`,{
            roomId: selectedRoom._id
          },{
            withCredentials: true
          }
          )

          if(!response.data.success){
             alert(response.data.message)
          }

           setInviteLink(response.data.inviteLink)
          
       } catch (error) {
         console.log(error)
       }
  }
// delete room 
    const handelRoomDelete=async(roomId:string)=>{
      try {
        const response = await axios.delete(`${API_URL}/room/delete`,{
          data:{
            roomId
          },
          withCredentials: true
        }
      )
        if(!response.data.success){
          return alert(response.data.message)
        }
        console.log(response)
      } catch (error) {
        console.error(error)
      }
    }   

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="h-screen bg-zinc-950 flex gap-4 p-4">

      {/* LEFT SIDEBAR */}
      <div className="w-80 h-full bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden">

        {/* User */}
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
              className="w-full rounded-lg bg-zinc-800 text-white px-3 py-2 border border-zinc-700 outline-none"
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
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-2 text-white"
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
                onClick={() => setSelectedRoom(room)}
                className={`w-full text-left px-4 py-3 rounded-xl transition flex justify-between items-center ${selectedRoom?._id === room._id
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
              >
                <div>
                  <div className="font-medium">
                    # {room.name}
                  </div>

                  <div className="text-xs opacity-70">
                    {room.type}
                  </div>
                </div>
                {unreadMessageCount[room._id] ? (
                  <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                    {unreadMessageCount[room._id]}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-black">
              {selectedRoom?.name || "Select Room"}
            </h1>

            <p className="text-sm text-zinc-500">
              {selectedRoom?.type || "Room"}
            </p>
          </div>

          <div className="text-sm text-zinc-500">
            {members.length} Members
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-zinc-50 space-y-4">

          {messages.map((message) => {
            const isOwnMessage = (message.sender?._id || message.sender) === user?.id;
            return (
            <div
              key={message._id}
              className={`flex group ${isOwnMessage
                ? "justify-end"
                : "justify-start"
                }`}
            >
              <div
                className={`max-w-md rounded-2xl px-4 py-3 shadow-sm flex flex-col gap-1 ${isOwnMessage
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-zinc-200 text-black"
                  }`}
              >
                {/* Reply context */}
                {message.replyTo && (
                  <div className={`text-xs p-2 rounded bg-opacity-20 border-l-2 mb-1 truncate ${
                    isOwnMessage 
                      ? 'bg-black border-white text-blue-100' 
                      : 'bg-zinc-200 border-blue-500 text-zinc-600'
                  }`}>
                    {typeof message.replyTo === 'object' 
                      ? message.replyTo.content 
                      : (messages.find(m => m._id === message.replyTo)?.content || 'Replied to a message')}
                  </div>
                )}
                
                <div className="flex justify-between items-start gap-3">
                  <p className="break-words">{message.content}</p>
                  <button 
                    onClick={() => setReplyingTo(message)}
                    className={`text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isOwnMessage ? "text-blue-200 hover:text-white" : "text-zinc-400 hover:text-blue-600"
                    }`}
                  >
                     Reply
                  </button>
                </div>

                <div className="mt-1 text-[10px] opacity-70 flex justify-end">
                  {message.status}
                </div>
              </div>
            </div>
          )})}
        </div>

        {/* Message Input */}
        <div className="border-t bg-white flex flex-col">
          {replyingTo && (
            <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-200 flex justify-between items-center text-sm text-zinc-600">
              <div className="flex flex-col">
                <span className="font-semibold text-blue-600">Replying to</span>
                <span className="text-zinc-800 truncate max-w-md">{replyingTo.content}</span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                ✕
              </button>
            </div>
          )}
          <form
            onSubmit={sendMessage}
            className="p-4 flex gap-3"
          >
            {typingUsers.length > 0 && (
              <div className="absolute bottom-20 px-6 py-2 text-sm italic text-zinc-500">
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.join(", ")} are typing...`}
              </div>
            )}
            <input
              type="text"
              value={input}
              onChange={handelInputChange}
              placeholder={`Message #${selectedRoom?.name || "room"}`}
              className="flex-1 border border-zinc-200 rounded-xl px-4 py-3 outline-none text-black bg-zinc-50 focus:bg-white focus:border-blue-500 transition-colors"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-medium transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-72 h-full bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden">

        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">
            Members
          </h2>

          <p className="text-zinc-400 text-sm">
            {members.length} members
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">

          {members.map((member) => (
            <div
              key={member.user._id}
              className="bg-zinc-800 rounded-xl px-3 py-3 flex items-center justify-between"
            >
              <div>
      
                <p className="text-white font-medium">
                  {member.user.username}
                </p>
              <div className="flex gap-10">
 <p className="text-xs text-zinc-400">
                  {member.user.email}
                </p>
                <p className="text-xs text-zinc-400">
                  {member.role}
                </p>
              </div>
               { isAdmin && member.user._id !== user.id &&(
                <button onClick={()=>handelRemoveMember(member.user._id)}>
                  Remove
                </button>
               )}
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${member.user.status === "online"
                    ? "bg-green-500"
                    : "bg-zinc-500"
                    }`}
                />

                <span className="text-xs text-zinc-400">
                  {member.status}
                </span>
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="text-center text-zinc-500 py-8">
              No members found
            </div>
          )}

          <button onClick={() => { setShowAddMember(true) }}>
            Add member +
          </button>

          {showAddMember && (
            <form
              onSubmit={handleAddMember}
              className="mt-3 space-y-2"
            >
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                >
                  Add
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
           
           <button onClick={()=> handelLinkGeneration()}>
             Invite Link
           </button>
           {inviteLink &&(
            <div>
               {inviteLink}
            </div>
           )}

           <div>
            {isAdmin && (
              <button onClick={()=> handelRoomDelete(selectedRoom._id)}>
              Delete Room
            </button>
            )}
            
           </div>

        </div>

      </div>

    </main>
  );
}