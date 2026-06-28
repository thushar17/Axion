import type { AuthSocket } from "../../types/index.js";
import { MessageModel } from "../../models/messages.js";
import { UserModel } from "../../models/user.js";

export const registerRoomHandler = (socket: AuthSocket) => {
    socket.on("join-rooms", (roomIds: string[]) => {
        if (Array.isArray(roomIds)) {
            roomIds.forEach(id => socket.join(id));
        }
    });

    socket.on("join-room", async (roomId) => {
        socket.join(roomId);
        const userId = socket.user?.id;
        
        let query: any = { roomId };
        if (userId) {
            const dbUser = await UserModel.findById(userId);
            const clearRecord = dbUser?.clearedRooms?.find(
                (c: any) => c.roomId.toString() === roomId.toString()
            );
            if (clearRecord) {
                query.createdAt = { $gt: clearRecord.clearedAt };
            }
        }

        const historyMessages = await MessageModel.find(query)
            .populate("sender", "username email")
            .populate({
                path: "replyTo",
                populate: {
                    path: "sender",
                    select: "username",
                },
            })
            .sort({ createdAt: -1 })
            .limit(50)

        socket.emit("message-history", historyMessages)

        socket.emit("room-joined", roomId);
    })
}