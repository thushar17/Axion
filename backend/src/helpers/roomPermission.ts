import { RoomModel } from "../models/rooms.js"
import { Types } from "mongoose";
export const checkForUserRole= async (roomId: any,userId: string)=>{
   try {
    const room = await RoomModel.findOne({
  _id: roomId,
  members: {
    $elemMatch: { user: new Types.ObjectId(userId.toString()) }
  }
}, { 'members.$': 1 });

return room?.members[0]?.role ?? null;
   } catch (error) {
    console.log(error)
   }
}