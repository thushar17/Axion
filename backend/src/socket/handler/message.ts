import type { Socket, Server } from "socket.io";
import { MessageModel } from "../../models/messages.js";
import type { AuthSocket } from "../../types/index.js";

export const registerMessageHandlers = (socket: AuthSocket, io: Server) => {
  socket.on("send-message", async (data, callback) => {
    const userId = socket.user.id;
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
  socket.on("message-delivered", async ({ messageId }) => {
    console.log("meesageID", messageId)
    const message = await MessageModel.findByIdAndUpdate(
      messageId,
      { status: "delivered" },
      {
        new: true
      }
    )
    if (!message) {
      console.log("message not found")
      return
    }

    console.log("updated message", message)
    io.to(message.roomId.toString()).emit("message-status-updated", {
      messageId: message._id,
      status: "delivered"
    });
  })


  // message seen by user
  socket.on("message-seen", async (roomId) => {
    const messages = await MessageModel.find({ roomId: roomId })
    const ids = messages.map(e => e._id)
    const updateMessagesStatus = await MessageModel.updateMany({
      roomId: roomId,
      status: "delivered"
    },
      { status: "seen" }
    )
    io.to(roomId).emit("message-status-updated", {
      messageId: ids,
      status: "seen"
    });
  })

  socket.on("typing",(data)=>{
    socket.to(data.roomId).emit("typing-status",{
       username: data.username
    })
    
  })
  
  socket.on("stop-typing", (data) => {
  socket.to(data.roomId).emit("stop-typing-status", {
    username: data.username,
  });
});



}

