import { Server } from "socket.io";
import http from "http";
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
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register handlers synchronously first to avoid race condition
    registerRoomHandler(socket)
    console.log("Room handlers registered");
    registerMessageHandlers(socket, io)

    // Handle online users without blocking listener registration
    handelOnlineUsers(socket).catch(err => {
      console.error("Error in handelOnlineUsers:", err);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};