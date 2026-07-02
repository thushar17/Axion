import { socket } from "@/src/lib/socket";
import React, { useEffect, useState } from "react";
import { getSenderId } from "@/test-helper";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type Props = {
  selectedRoomRef: React.MutableRefObject<any>;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  user: any;
  scrollToBottom: () => void;
  setUnreadMessageCount: React.Dispatch<React.SetStateAction<{ [roomId: string]: number }>>;
  setAllRooms: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedRoom: React.Dispatch<React.SetStateAction<any>>;
  setMembers: React.Dispatch<React.SetStateAction<any[]>>;
  router: AppRouterInstance | any;
}

export function useSocket({
  selectedRoomRef,
  setMessages,
  user,
  scrollToBottom,
  setUnreadMessageCount,
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




    // new message 
    socket.on("new-message", (message) => {
      const currentRoom = selectedRoomRef.current;
      if (currentRoom && message.roomId === currentRoom._id) {
        setMessages((prev) => [...prev, message]);
        if (getSenderId(message.sender) !== user.id) {
          socket.emit("message-seen", currentRoom._id);
        }
        setTimeout(scrollToBottom, 60);
      } else {
        setUnreadMessageCount((prev: any) => ({
          ...prev,
          [message.roomId]: (prev[message.roomId] || 0) + 1,
        }));
      }
      socket.emit("message-delivered", { messageId: message._id });
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


    // message status update 
    socket.on("message-status-updated", (data) => {
      const ids = Array.isArray(data.messageId)
        ? data.messageId
        : [data.messageId];
      setMessages((prev) =>
        prev.map((msg) =>
          ids.includes(String(msg._id))
            ? { ...msg, status: data.status }
            : msg
        )
      );
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


    // delete room 
    socket.on("room-deleted", (data) => {
      setAllRooms((prev) => {
        const roomId = selectedRoomRef.current?._id;
        const updateRoom = prev.filter((room) => room._id !== data.roomId);
        if (roomId === data.roomId) {
          setSelectedRoom(updateRoom[0] || null);
          setMembers([]);
          setMessages([]);
        }
        return updateRoom;
      });
    });



    // message delete 


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
                isDeleted: true,
              },
            };
          }
          return msg;
        })
      );
    });

    // pin message
    socket.on("message-pinned", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? {
              ...msg,
              pinned: data.pinned
            }
            : msg
        )
      );
    });


    // edit message

    socket.on("message-edit", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, content: data.content, isEdited: data.isEdited }
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
                isEdited: data.isEdited,
              },
            };
          }
          return msg;
        })
      );
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

    // user reacted 
    socket.on(
      "user-reacted",

      (data) => {

        setMessages(prev =>

          prev.map(message =>

            message._id === data.messageId

              ? {

                ...message,

                reactions: data.messageReaction

              }

              : message

          )

        )

      }
    )



    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("new-message");
      socket.off("typing-status");
      socket.off("stop-typing-status");
      socket.off("room-joined");
      socket.off("message-status-updated");
      socket.off("member-removed");
      socket.off("room-deleted");
      socket.off("message-deleted");
      socket.off("message-pinned");
      socket.off("message-edit");
      socket.off("room-renamed");
      socket.off("user-reacted");
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