import { RoomModel } from "../models/rooms.js";
import { Types } from "mongoose";
export const checkForUserRole = async (roomId, userId) => {
    try {
        const room = await RoomModel.findOne({
            _id: roomId,
            members: {
                $elemMatch: { user: new Types.ObjectId(userId.toString()) }
            }
        }, { 'members.$': 1 });
        return room?.members[0]?.role ?? null;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
//# sourceMappingURL=roomPermission.js.map