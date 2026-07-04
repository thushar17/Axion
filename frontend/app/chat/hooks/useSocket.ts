import { socket } from "@/src/lib/socket";
import React, { useEffect, useState } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type Props = {
  selectedRoomRef: React.MutableRefObject<any>;
  onActiveRoomCleared: () => void;
  user: any;
  setAllRooms: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedRoom: React.Dispatch<React.SetStateAction<any>>;
  setMembers: React.Dispatch<React.SetStateAction<any[]>>;
  router: AppRouterInstance | any;
}

export function useSocket({
  selectedRoomRef,
  onActiveRoomCleared,
  user,
  setAllRooms,
  setMembers,
  setSelectedRoom,
  router

}: Props) {
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  // emits. 
  const emitMessage = (selectedRoom: any, input: string, replyingTo: any) => {
    socket.emit(
      "send-message",
      {
        roomId: selectedRoom._id,
        content: input,
        replyTo: replyingTo?._id,
      },
      (response: any) => {
        console.log("ACK:", response);
      }
    );
  }

  const emitStopTyping = (selectedRoom: any) => {
    socket.emit("stop-typing", {
      roomId: selectedRoom._id,
      username: user?.username,
    });
  }

  const emitTyping = (selectedRoom: any) => {
    socket.emit("typing", {
      roomId: selectedRoom._id,
      username: user?.username,
    });
  };

  const emitJoinRooms = (roomIds: string[]) => {
    socket.emit("join-rooms", roomIds);
  };

  const emitJoinRoom = (selectedRoom: any) => {
    socket.emit("join-room", selectedRoom._id);
  };




  useEffect(() => {

    if (!user) return;

    socket.on("connect", () => { });

    socket.on("connect_error", (err) => {
      console.log("Socket Error:", err.message);
      router.push("/auth/login");
    });






    socket.on("typing-status", (data) => {
      setTypingUsers((prev) => {
        if (prev.includes(data.username)) return prev;
        return [...prev, data.username];
      });
    });

    socket.on("stop-typing-status", (data) => {
      setTypingUsers((prev) =>
        prev.filter((name) => name !== data.username)
      );
    });

    socket.on("room-joined", (roomId) => {
      socket.emit("message-seen", roomId);
    });


    // remove members

    socket.on("member-removed", (data) => {
      if (data.memberId === user.id) {
        setAllRooms((prev) => {
          const updatedRooms = prev.filter(
            (room) => room._id !== data.roomId
          );
          if (selectedRoomRef.current?._id === data.roomId) {
            setSelectedRoom(updatedRooms[0] ?? null);
            onActiveRoomCleared();
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


    // delete room 
    socket.on("room-deleted", (data) => {
      setAllRooms((prev) => {
        const roomId = selectedRoomRef.current?._id;
        const updateRoom = prev.filter((room) => room._id !== data.roomId);
        if (roomId === data.roomId) {
          setSelectedRoom(updateRoom[0] || null);
          setMembers([]);
          onActiveRoomCleared();
        }
        return updateRoom;
      });
    });





    // rename room 

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


    // room last message

    socket.on("last-message",(data)=>{
      setAllRooms((prev)=>
        prev.map((room)=>
          room._id === data.roomId ?
           {...room, lastMessage: data.lastMessage, lastMessageAt: data.lastMessageAt}
           : room
        )
      )
    })



    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("typing-status");
      socket.off("stop-typing-status");
      socket.off("room-joined");
      socket.off("member-removed");
      socket.off("room-deleted");
      socket.off("room-renamed");
      socket.off("last-message");
    };
  }, [user, router]);




  return {
    typingUsers,
    emitMessage,
    emitStopTyping,
    emitTyping,
    emitJoinRooms,
    emitJoinRoom
  }

}