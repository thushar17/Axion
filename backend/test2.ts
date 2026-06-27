import mongoose from 'mongoose';
import { RoomModel } from './src/models/rooms.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log("Connected to DB");

    const room = await RoomModel.findOne({});
    if (!room) {
        console.log("No rooms found");
        process.exit(0);
    }
    console.log("Found room:", room._id.toString());
    const member = room.members[0];
    console.log("Member:", member);
    
    if (member) {
        const roomId = room._id.toString();
        const userId = member.user.toString();
        
        console.log("Testing with roomId:", roomId, "userId:", userId);
        
        const found = await RoomModel.findOne({
            _id: roomId,
            members: {
                $elemMatch: { user: new mongoose.Types.ObjectId(userId) }
            }
        }, { 'members.$': 1 });
        
        console.log("Found with elemMatch:", found);
    }

    process.exit(0);
}
run();
