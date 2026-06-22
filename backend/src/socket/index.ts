import { Server } from "socket.io";
import http from "http";
import { MessageModel } from "../models/messages.js";
import { handelOnlineUsers } from "./handler/presence.js";
import { socketAuthMiddleware } from "./middleware/auth.js";
import { registerMessageHandlers } from "./handler/message.js";
import { registerRoomHandler } from "./handler/room.js";


export const initializedSocket = (server: http.Server) => {
  console.log("Socket server initialized");

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  socketAuthMiddleware(io)
  io.on("connection",async (socket) => {
   await   handelOnlineUsers(socket) 
    console.log(`Socket connected: ${socket.id}`);
    //join room
    registerRoomHandler(socket)
    // Send Message
   registerMessageHandlers(socket , io)

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};