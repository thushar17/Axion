import type { Socket, Server } from "socket.io";
import { MessageModel } from "../../models/messages.js";
import type { AuthSocket } from "../../types/index.js";
import { RoomModel } from "../../models/rooms.js";
import { notificationQueue } from "../../jobs/notification.queue.js";
export const registerMessageHandlers = (socket: AuthSocket, io: Server) => {
  socket.on("send-message", async (data, callback) => {
    
    const userId = socket.user.id; 
  
    const room = await RoomModel.findById({_id: data.roomId})

    const isMember = room?.members.some(
      member => member.user.toString()== userId
    )
    if (!isMember) {
        return callback({
          success: false,
          message: 'You are no longer member of this room'
        })
    }

    let repliedMessage = null;
    if(data.replyTo){
       repliedMessage = await MessageModel.findById(data.replyTo)

       if (!repliedMessage) {
        return callback({
            success: false,
            message: "Original message not found"
        });
    }
    }
    
    const Dbmessage = await MessageModel.create({
      roomId: data.roomId,
      sender: userId,
      content: data.content || "",
      replyTo: data.replyTo || null,
      attachment: data.attachment || null
    });
    
    // updating room for last message
    const updatedRoom =  await RoomModel.findByIdAndUpdate(Dbmessage.roomId,{
      lastMessage:{
        content: Dbmessage.content || (data.attachment ? "Sent an attachment" : ""),
        sender: userId,
        type: data.attachment ? "attachment" : "text"
      },
      lastMessageAt:Dbmessage.createdAt
    },
  {  new: true})
    
    const message=  await Dbmessage.populate([
        {
        path: "sender",
        select: "username email"
    },
    {
        path: "replyTo",
        populate: {
            path: "sender",
            select: "username"
        }
    }
      ])
      console.log(message)

      // bullMq notification 
      console.log("Adding BullMQ job...");
    try {
  await notificationQueue.add("new-message", {
    roomId: data.roomId,
    senderId: userId,
    messageId: Dbmessage._id,
  });
} catch (err) {
  console.error("Failed to enqueue notification:", err);
}

callback({
      success: true,
      messageId: Dbmessage._id
    })
    io.to(data.roomId).emit("new-message", message);
    io.to(data.roomId).emit("last-message",{
      roomId: data.roomId,
      lastMessage: updatedRoom?.lastMessage,
      lastMessageAt: updatedRoom?.lastMessageAt 
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
    if (!message) {
      console.log("message not found")
      return
    }
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

