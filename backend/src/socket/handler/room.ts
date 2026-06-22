import type { Socket } from "socket.io";
import { MessageModel } from "../../models/messages.js";

export const registerRoomHandler =(socket: Socket)=>{
    socket.on("join-roon",async (roomId)=>{
        socket.join(roomId)

        const historyMessages = await MessageModel.find({
            roomId
        })
        .sort({createdAt: -1})
        .limit(50)

        socket.emit("message-history", historyMessages)
         console.log(`${socket.id} joined ${roomId}`);
         socket.emit("room-joined", roomId);
    })
}