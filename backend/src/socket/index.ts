import { Server } from "socket.io";
import http from "http";
import { handelOnlineUsers } from "./handler/presence.js";
import { socketAuthMiddleware } from "./middleware/auth.js";
import { registerMessageHandlers } from "./handler/message.js";
import { registerRoomHandler } from "./handler/room.js";
import type { AuthSocket } from "../types/index.js";
let io: Server;

export const initializedSocket = (server: http.Server) => {
  console.log("Socket server initialized");

   io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  socketAuthMiddleware(io)
  io.on("connection", (socket) => {
    const authSocket = socket as AuthSocket;
    console.log(`Socket connected: ${authSocket.id}`);

    // Register handlers synchronously first to avoid race condition
    registerRoomHandler(authSocket)
    console.log("Room handlers registered");
    registerMessageHandlers(authSocket, io)

    // Handle online users without blocking listener registration
    handelOnlineUsers(authSocket).catch(err => {
      console.error("Error in handelOnlineUsers:", err);
    });

    authSocket.on("disconnect", () => {
      console.log(`Socket disconnected: ${authSocket.id}`);
    });
  });

 
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};