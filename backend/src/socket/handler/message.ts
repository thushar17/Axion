import type { Socket, Server } from "socket.io";
import { MessageModel } from "../../models/messages.js";
import { success } from "zod";


export const registerMessageHandlers = (socket: Socket, io: Server) => {
  socket.on("send-message", async (data, callback) => {
    const userId = (socket as any).user.id;
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
    io.to(data.roomId).emit("message-status-updated", {
      status: "seen"
    })
  });





  socket.on("message-delivered", async ({ messageId }) => {
    console.log("meesageID", messageId)
    const message = await MessageModel.findByIdAndUpdate(
      messageId,
      { status: "delivered" },
      {
        new: true
      }
    )
    console.log("updaeed message", message)

  })


  // message seen by user
  socket.on("message-seen", async (roomId) => {
    console.log(roomId)
    const messages = await MessageModel.updateMany({
      roomId: roomId,
      status: "sent"
    }, {
      status: "seen"
    })
    console.log("heelo", messages)
  })
}

