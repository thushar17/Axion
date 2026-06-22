
import jwt from "jsonwebtoken";
import {Server , Socket} from 'socket.io'

  export const socketAuthMiddleware=(io: Server)=>{

     io.use((socket: Socket, next) => {
    const cookie = socket.handshake.headers.cookie;

    if (!cookie) {
      return next(new Error("Authentication error"));
    }

    try {
      const token = cookie?.split(";").find(c=>c.trim().startsWith("token="))
      ?.split("=")[1];
 
       const decoded = jwt.verify(token as string,process.env.JWT_SECRET as string);

       (socket as any).user = decoded;
      next();
    } catch (error) {
      console.error(error);
      next(new Error("Invalid token"));
    }
  });
  }
 