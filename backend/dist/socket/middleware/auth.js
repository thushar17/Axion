import jwt from "jsonwebtoken";
import { Socket, Server } from "socket.io";
export const socketAuthMiddleware = (io) => {
    io.use((socket, next) => {
        const cookie = socket.handshake.headers.cookie;
        if (!cookie) {
            return next(new Error("Authentication error"));
        }
        try {
            const token = cookie
                .split(";")
                .find(c => c.trim().startsWith("token="))
                ?.split("=")[1];
            if (!token) {
                return next(new Error("Authentication token missing"));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        }
        catch (error) {
            console.error(error);
            next(new Error("Invalid token"));
        }
    });
};
//# sourceMappingURL=auth.js.map