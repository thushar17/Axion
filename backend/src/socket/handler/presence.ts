import { UserModel } from "../../models/user.js";
import { Socket } from "socket.io";

const onlineUser = new Map<string , number>()

export const handelOnlineUsers = async(socket:Socket)=>{
            const userId = (socket as any).user.id;

            const currentCount = onlineUser.get(userId)?? 0;
            const newCount = currentCount +1;
            onlineUser.set(userId, newCount);
        
            if (newCount === 1) {
    await UserModel.findByIdAndUpdate(userId, { status: "online" });
    console.log(`User ${userId} is now online`);
  }

  socket.on("disconnect", async () => {
    const count = onlineUser.get(userId) ?? 1;
    const updatedCount = count - 1;

    if (updatedCount <= 0) {
      // Remove from map and mark offline
      onlineUser.delete(userId);
      await UserModel.findByIdAndUpdate(userId, { status: "offline" , lastSeen: new Date()});
      console.log(`User ${userId} is now offline`);
    } else {
      onlineUser.set(userId, updatedCount);
    }
  });
   }