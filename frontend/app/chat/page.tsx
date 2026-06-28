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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const [starredMessageIds, setStarredMessageIds] = useState<string[]>([]);
  const [starredMessages, setStarredMessages] = useState<any[]>([]);
  const [showStarredPanel, setShowStarredPanel] = useState(false);
  const [mutedRoomIds, setMutedRoomIds] = useState<string[]>([]);
  const [archivedRoomIds, setArchivedRoomIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: any } | null>(null);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [showArchivedSection, setShowArchivedSection] = useState(false);

  useEffect(() => {
    if (user) {
      setStarredMessageIds(user.starredMessages || []);
      setMutedRoomIds(user.mutedRooms || []);
      setArchivedRoomIds(user.archivedRooms || []);
    }
  }, [user]);

  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
      setShowRoomSettings(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

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
        if (message.sender._id !== user.id) {
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
              replyTo: {
                ...msg.replyTo,
                content: data.content,
                isDeleted: true
              }
            };
          }
          return msg;
        })
      );
    });

    socket.on("message-pinned", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, isPinned: data.isPinned } : msg
        )
      );
    });

    socket.on("room-renamed", (data) => {
      setAllRooms((prev) =>
        prev.map((room) =>
          room._id === data.roomId ? { ...room, name: data.newName } : room
        )
      );
      setSelectedRoom((current: any) => {
        if (current && current._id === data.roomId) {
          return { ...current, name: data.newName };
        }
        return current;
      });
    });

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
      socket.off("message-deleted");
      socket.off("message-pinned");
      socket.off("room-renamed");

      socket.disconnect();
    };
  }, [user, router]);
  // message send 
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !selectedRoom) return;
     
    if (editingMessageId) {
      handelEditMessage();
      return;
    }

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
    setReplyingTo(null)
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
    // handel edit
    const handelEditMessage = async () => {
      if (!input.trim()) return;
      try {
        const response = await axios.post(`${API_URL}/room/edit-message`, {
          messageId: editingMessageId,
          messageContent: input
        }, {
          withCredentials: true
        });
        
        if (response.data.success) {
          setMessages(messages.map(msg => 
            msg._id === editingMessageId ? { ...msg, content: input } : msg
          ));
          setEditingMessageId(null);
          setInput("");
        } else {
          alert(response.data.message || "Failed to edit message");
        }
      } catch (error) {
        console.error(error);
      }
    }

    const handleDeleteMessage = async (messageId: string) => {
      try {
        const response = await axios.post(`${API_URL}/room/delete-message`, {
          messageId
        }, {
          withCredentials: true
        });
        if (!response.data.success) {
          alert(response.data.message || "Failed to delete message");
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handlePinMessage = async (messageId: string, isPinned: boolean) => {
      try {
        const response = await axios.post(`${API_URL}/room/pin-message`, {
          messageId,
          isPinned
        }, {
          withCredentials: true
        });
        if (!response.data.success) {
          alert(response.data.message || "Failed to pin message");
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handleStarMessage = async (messageId: string) => {
      try {
        const response = await axios.post(`${API_URL}/auth/star-message`, {
          messageId
        }, {
          withCredentials: true
        });
        if (response.data.success) {
          const starred = response.data.starredMessages;
          setStarredMessageIds(starred);
          if (showStarredPanel) {
            fetchStarredMessages();
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchStarredMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/starred-messages`, {
          withCredentials: true
        });
        if (response.data.success) {
          setStarredMessages(response.data.messages);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handleMuteRoom = async (roomId: string) => {
      try {
        const response = await axios.post(`${API_URL}/auth/mute-room`, {
          roomId
        }, {
          withCredentials: true
        });
        if (response.data.success) {
          setMutedRoomIds(response.data.mutedRooms);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handleArchiveRoom = async (roomId: string) => {
      try {
        const response = await axios.post(`${API_URL}/auth/archive-room`, {
          roomId
        }, {
          withCredentials: true
        });
        if (response.data.success) {
          setArchivedRoomIds(response.data.archivedRooms);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handleClearChat = async (roomId: string) => {
      if (!confirm("Are you sure you want to clear chat history for this room? This cannot be undone.")) return;
      try {
        const response = await axios.post(`${API_URL}/auth/clear-chat`, {
          roomId
        }, {
          withCredentials: true
        });
        if (response.data.success) {
          setMessages([]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handleRenameRoom = async () => {
      if (!renameInput.trim() || !selectedRoom) return;
      try {
        const response = await axios.post(`${API_URL}/room/rename`, {
          roomId: selectedRoom._id,
          newName: renameInput
        }, {
          withCredentials: true
        });
        if (response.data.success) {
          setIsRenaming(false);
          setRenameInput("");
        } else {
          alert(response.data.message || "Failed to rename room");
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handleLeaveRoom = async (roomId: string) => {
      if (!confirm("Are you sure you want to leave this room?")) return;
      try {
        const response = await axios.post(`${API_URL}/room/leave`, {
          roomId
        }, {
          withCredentials: true
        });
        if (response.data.success) {
          setAllRooms(prev => {
            const updatedRooms = prev.filter(r => r._id !== roomId);
            if (selectedRoom?._id === roomId) {
              setSelectedRoom(updatedRooms[0] || null);
              setMessages([]);
              setMembers([]);
            }
            return updatedRooms;
          });
        }
      } catch (error: any) {
        console.error(error);
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          alert("Failed to leave room");
        }
      }
    };

    const scrollToMessage = (messageId: string, roomId?: string) => {
      if (roomId && selectedRoom?._id !== roomId) {
        const targetRoom = allRooms.find(r => r._id === roomId);
        if (targetRoom) {
          setSelectedRoom(targetRoom);
          setTimeout(() => {
            const element = document.getElementById(`msg-${messageId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('highlight-message');
              setTimeout(() => {
                element.classList.remove('highlight-message');
              }, 2000);
            }
          }, 800);
          return;
        }
      }
      const element = document.getElementById(`msg-${messageId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-message');
        setTimeout(() => {
          element.classList.remove('highlight-message');
        }, 2000);
      }
    };

    const formatMessageTimestamp = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.getDate() === now.getDate() &&
                      date.getMonth() === now.getMonth() &&
                      date.getFullYear() === now.getFullYear();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = date.getDate() === yesterday.getDate() &&
                          date.getMonth() === yesterday.getMonth() &&
                          date.getFullYear() === yesterday.getFullYear();
                          
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return timeStr;
      } else if (isYesterday) {
        return `Yesterday`;
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + timeStr;
      }
    };

    useEffect(() => {
      if (showStarredPanel) {
        fetchStarredMessages();
      }
    }, [showStarredPanel]);

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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
              Rooms
            </h2>

            <div className="space-y-2">
              {allRooms
                .filter((room: any) => !archivedRoomIds.includes(room._id))
                .map((room: any) => {
                  const isMuted = mutedRoomIds.includes(room._id);
                  return (
                    <button
                      key={room._id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition flex justify-between items-center ${
                        selectedRoom?._id === room._id
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-800 text-white hover:bg-zinc-700"
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-medium flex items-center gap-1.5 truncate">
                          <span># {room.name}</span>
                          {isMuted && (
                            <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" />
                            </svg>
                          )}
                        </div>

                        <div className="text-xs opacity-70">
                          {room.type}
                        </div>
                      </div>
                      {unreadMessageCount[room._id] ? (
                        <div className={`${isMuted ? "bg-zinc-600" : "bg-red-500"} text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center shrink-0`}>
                          {unreadMessageCount[room._id]}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Archived Section */}
          {allRooms.some((room: any) => archivedRoomIds.includes(room._id)) && (
            <div>
              <button
                onClick={() => setShowArchivedSection(!showArchivedSection)}
                className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-zinc-500 mb-2 hover:text-zinc-300 transition"
              >
                <span>Archived Rooms ({allRooms.filter((room: any) => archivedRoomIds.includes(room._id)).length})</span>
                <svg className={`w-3.5 h-3.5 transform transition-transform ${showArchivedSection ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {showArchivedSection && (
                <div className="space-y-2 pl-1">
                  {allRooms
                    .filter((room: any) => archivedRoomIds.includes(room._id))
                    .map((room: any) => {
                      const isMuted = mutedRoomIds.includes(room._id);
                      return (
                        <button
                          key={room._id}
                          onClick={() => setSelectedRoom(room)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl transition flex justify-between items-center ${
                            selectedRoom?._id === room._id
                              ? "bg-blue-600 text-white"
                              : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60"
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="font-medium flex items-center gap-1.5 text-sm truncate">
                              <span># {room.name}</span>
                              {isMuted && (
                                <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" />
                                </svg>
                              )}
                            </div>
                            <div className="text-[11px] opacity-70">
                              {room.type}
                            </div>
                          </div>
                          {unreadMessageCount[room._id] ? (
                            <div className={`${isMuted ? "bg-zinc-600" : "bg-red-500"} text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center shrink-0`}>
                              {unreadMessageCount[room._id]}
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center bg-white relative">
          <div>
            {selectedRoom ? (
              <div className="flex items-center gap-2">
                {isRenaming ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRenameRoom();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      className="border border-zinc-300 rounded-lg px-2.5 py-1 text-black text-sm outline-none focus:border-blue-500"
                      placeholder="Room Name"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRenaming(false);
                        setRenameInput("");
                      }}
                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs px-2.5 py-1.5 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <h1 className="text-xl font-semibold text-black flex items-center gap-1.5">
                    <span>{selectedRoom.name}</span>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsRenaming(true);
                          setRenameInput(selectedRoom.name);
                        }}
                        className="text-zinc-400 hover:text-zinc-600 transition p-1 hover:bg-zinc-100 rounded-full"
                        title="Rename Room"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </h1>
                )}
              </div>
            ) : (
              <h1 className="text-xl font-semibold text-black">Select Room</h1>
            )}

            <p className="text-sm text-zinc-500">
              {selectedRoom?.type || "Room"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedRoom && (
              <>
                {/* Starred Messages Panel Toggle */}
                <button
                  onClick={() => setShowStarredPanel(!showStarredPanel)}
                  className={`p-2 rounded-full transition ${showStarredPanel ? "bg-amber-100 text-amber-600" : "text-zinc-500 hover:bg-zinc-100"}`}
                  title="Starred Messages"
                >
                  <svg className="w-5 h-5" fill={showStarredPanel ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.773-.564-.373-1.81.588-1.81h4.906a1 1 0 00.95-.69l1.519-4.674z" />
                  </svg>
                </button>

                {/* Room Options Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRoomSettings(!showRoomSettings);
                    }}
                    className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition"
                    title="Room Settings"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  {showRoomSettings && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg py-1.5 z-50"
                    >
                      <button
                        onClick={() => {
                          handleMuteRoom(selectedRoom._id);
                          setShowRoomSettings(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                        <span>{mutedRoomIds.includes(selectedRoom._id) ? "Unmute Room" : "Mute Room"}</span>
                      </button>

                      <button
                        onClick={() => {
                          handleArchiveRoom(selectedRoom._id);
                          setShowRoomSettings(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span>{archivedRoomIds.includes(selectedRoom._id) ? "Unarchive Room" : "Archive Room"}</span>
                      </button>

                      <button
                        onClick={() => {
                          handleClearChat(selectedRoom._id);
                          setShowRoomSettings(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Clear Chat</span>
                      </button>

                      <div className="border-t border-zinc-100 my-1"></div>

                      <button
                        onClick={() => {
                          handleLeaveRoom(selectedRoom._id);
                          setShowRoomSettings(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Leave Room</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="text-sm text-zinc-500">
              {members.length} Members
            </div>
          </div>
        </div>

        {/* Pinned Messages Banner */}
        {selectedRoom && messages.filter(m => m.isPinned).length > 0 && (
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 flex items-center justify-between text-xs text-blue-900 z-10 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="truncate">
                Pinned: <strong className="font-semibold">{messages.filter(m => m.isPinned)[messages.filter(m => m.isPinned).length - 1].content}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <button
                onClick={() => {
                  const pinnedList = messages.filter(m => m.isPinned);
                  if (pinnedList.length > 0) {
                    scrollToMessage(pinnedList[pinnedList.length - 1]._id);
                  }
                }}
                className="underline font-semibold hover:text-blue-950 transition"
              >
                Jump
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    const pinnedList = messages.filter(m => m.isPinned);
                    if (pinnedList.length > 0) {
                      handlePinMessage(pinnedList[pinnedList.length - 1]._id, false);
                    }
                  }}
                  className="text-[10px] text-blue-700 hover:text-blue-950 hover:underline transition"
                >
                  Unpin
                </button>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-zinc-50 space-y-4">
          {messages.map((message) => {
            const isMe = message.sender._id === user?.id;
            return (
              <div
                key={message._id}
                id={`msg-${message._id}`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenu({ x: e.clientX, y: e.clientY, message });
                }}
                className={`flex group py-1 px-2 rounded-xl transition-all duration-300 ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className="relative flex flex-col max-w-[70%]">
                  {message.isPinned && (
                    <div className={`flex items-center gap-1 text-[10px] text-zinc-400 mb-1 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                      <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Pinned Message</span>
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm w-full ${isMe
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white border border-zinc-100 text-black rounded-bl-sm"
                      }`}
                  >
                    <div>
                      {message.replyTo && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollToMessage(message.replyTo._id);
                          }}
                          className={`border-l-4 rounded p-2 mb-2 text-sm cursor-pointer hover:opacity-80 transition ${
                            isMe ? 'border-white/50 bg-black/10 text-white' : 'border-blue-500 bg-zinc-100 text-black'
                          }`}
                        >
                          <p className={`font-semibold text-xs ${isMe ? 'text-white' : 'text-blue-600'}`}>
                            {message.replyTo.sender?.username}
                          </p>
                          <p className={`text-xs mt-0.5 line-clamp-2 ${isMe ? 'text-blue-100' : 'text-zinc-600'}`}>
                            {message.replyTo.content}
                          </p>
                        </div>
                      )}

                      <p className={`text-[15px] leading-relaxed break-words ${message.isDeleted ? 'italic text-zinc-400' : ''}`}>
                        {message.content}
                      </p>
                    </div>

                    <div className={`mt-1.5 text-[10px] flex justify-end items-center gap-1 ${isMe ? 'text-blue-200' : 'text-zinc-400'}`}>
                      <span>{formatMessageTimestamp(message.createdAt)}</span>
                      {message.isEdited && <span className="opacity-70">(edited)</span>}
                      {isMe && <span>{message.status === 'seen' ? '✓✓' : '✓'}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        {editingMessageId ? (
          <div className="border-t bg-zinc-50/90 px-6 py-2.5 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-xs font-semibold text-blue-600">
                  Editing Message
                </p>
                <p className="text-sm text-zinc-600 line-clamp-1">
                  {input}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingMessageId(null);
                setInput("");
              }}
              className="text-zinc-400 hover:text-zinc-600 transition-colors p-2 rounded-full hover:bg-zinc-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        ) : replyingTo && (
          <div className="border-t bg-zinc-50/90 px-6 py-2.5 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-xs font-semibold text-blue-600">
                  Replying to {replyingTo.sender.username}
                </p>
                <p className="text-sm text-zinc-600 line-clamp-1">
                  {replyingTo.content}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-zinc-400 hover:text-zinc-600 transition-colors p-2 rounded-full hover:bg-zinc-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )}

        <form
          onSubmit={sendMessage}
          className="border-t bg-white p-4 flex gap-3"
        >
          {typingUsers.length > 0 && (
            <div className="px-6 py-2 text-sm italic text-zinc-500">
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
            className="flex-1 border rounded-xl px-4 py-3 outline-none text-black"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl"
          >
            Send
          </button>
        </form>
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

      {/* STARRED MESSAGES PANEL */}
      {showStarredPanel && (
        <div className="w-80 h-full bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden text-white shrink-0">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <span>Starred Messages</span>
            </h2>
            <button
              onClick={() => setShowStarredPanel(false)}
              className="text-zinc-400 hover:text-white transition p-1 hover:bg-zinc-800 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {starredMessages.length === 0 ? (
              <div className="text-center text-zinc-500 py-8 text-sm">
                No starred messages yet. Right click a message to star it.
              </div>
            ) : (
              starredMessages.map((msg: any) => (
                <div key={msg._id} className="bg-zinc-800/80 rounded-xl p-3 border border-zinc-700/50 space-y-2 hover:border-zinc-600 transition duration-200">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-blue-400">{msg.sender?.username}</span>
                    <span className="text-zinc-500">{new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className="text-xs text-zinc-200 break-words leading-relaxed">{msg.content}</p>
                  <div className="flex justify-end gap-3 text-[10px] pt-1">
                    <button
                      onClick={() => handleStarMessage(msg._id)}
                      className="text-red-400 hover:underline font-medium"
                    >
                      Unstar
                    </button>
                    <button
                      onClick={() => scrollToMessage(msg._id, msg.roomId)}
                      className="text-blue-400 hover:underline font-medium"
                    >
                      Jump
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTEXT MENU */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-white border border-zinc-200 rounded-xl shadow-xl py-1.5 w-44 z-[9999] text-black text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {!contextMenu.message.isDeleted && (
            <>
              <button
                onClick={() => {
                  setReplyingTo(contextMenu.message);
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                </svg>
                <span>Reply</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.message.content);
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copy Message</span>
              </button>

              <button
                onClick={() => {
                  handleStarMessage(contextMenu.message._id);
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-amber-500" fill={starredMessageIds.includes(contextMenu.message._id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.773-.564-.373-1.81.588-1.81h4.906a1 1 0 00.95-.69l1.519-4.674z" />
                </svg>
                <span>{starredMessageIds.includes(contextMenu.message._id) ? "Unstar Message" : "Star Message"}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    handlePinMessage(contextMenu.message._id, !contextMenu.message.isPinned);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>{contextMenu.message.isPinned ? "Unpin Message" : "Pin Message"}</span>
                </button>
              )}

              {contextMenu.message.sender._id === user?.id && (
                <>
                  <div className="border-t border-zinc-100 my-1"></div>
                  <button
                    onClick={() => {
                      setEditingMessageId(contextMenu.message._id);
                      setInput(contextMenu.message.content);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      handleDeleteMessage(contextMenu.message._id);
                      setContextMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </>
              )}
            </>
          )}
          {contextMenu.message.isDeleted && (
            <div className="px-4 py-2 text-zinc-400 italic text-xs">
              No actions available
            </div>
          )}
        </div>
      )}

     </main>
  );
}