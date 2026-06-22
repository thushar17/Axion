import {Server} from 'socket.io'
import http from 'http'
import { MessageModel } from '../models/messages.js';

export const initializedSocket = (server: http.Server)=>{
    console.log("Socket server initialized");
    const io = new Server (server, {
        cors:{
            origin: "*"
        }
    })

    
    // seeting up a connection with room
  io.on("connection",(socket)=>{
    socket.on("join-room", async (roomId)=>{
        socket.join(roomId)
         // load previous messages
        const historyMessages = await MessageModel.find({
            roomId
        })
        .sort({createdAt: -1})
        .limit(50)

        socket.emit('message-history',historyMessages)
    
            console.log(`${socket.id} joined ${roomId}`)
        socket.emit("room-joined", roomId)
    })

    
    socket.on("send-message", async (data)=>{
            const message = await MessageModel.create({
                roomId: data.roomId,
                sender: data.sender, 
                content: data.content
            })

            io.to(data.roomId).emit("new-message",message)
        })
  })
   
    return io;
}
