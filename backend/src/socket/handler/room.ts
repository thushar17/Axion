import type { Socket } from "socket.io";
import { MessageModel } from "../../models/messages.js";

export const registerRoomHandler = (socket: Socket) => {
    socket.on("join-room", async (roomId) => {
      
         for(const room of socket.rooms){
            if(room != socket.id){
                socket.leave(room)
            }
         }
           socket.join(roomId)
           console.log(socket.rooms)
        const historyMessages = await MessageModel.find({
            roomId
        })
            .sort({ createdAt: -1 })
            .limit(50)

        socket.emit("message-history", historyMessages)

        socket.emit("room-joined", roomId);
    })
}