import type { Socket , Server } from "socket.io";
import { MessageModel } from "../../models/messages.js";
import { success } from "zod";


export const registerMessageHandlers = (socket: Socket, io:Server)=>{
      socket.on("send-message", async (data, callback) => {
          const userId =(socket as any).user.id;
          const message = await MessageModel.create({
            roomId: data.roomId,
            sender: userId,
            content: data.content,
          });
          callback({
            success: true,
            messageId: message._id
          })
    
          io.to(data.roomId).emit("new-message", message);
        });
}