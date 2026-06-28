import type { Socket } from "socket.io";
import { MessageModel } from "../../models/messages.js";

export const registerRoomHandler = (socket: Socket) => {
    socket.on("join-rooms", (roomIds: string[]) => {
        if (Array.isArray(roomIds)) {
            roomIds.forEach(id => socket.join(id));
        }
    });

    socket.on("join-room", async (roomId) => {
        socket.join(roomId);
        const historyMessages = await MessageModel.find({ roomId })
  .populate("sender", "username email")
  .populate({
    path: "replyTo",
    populate: {
      path: "sender",
      select: "username",
    },
  })
            .sort({ createdAt: -1 })
            .limit(50)

        socket.emit("message-history", historyMessages)

        socket.emit("room-joined", roomId);
    })
}