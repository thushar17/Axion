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

   const allowedOrigins = [
    'http://localhost:3000',
    'https://axion-alpha-blush.vercel.app',
  ];

   io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
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