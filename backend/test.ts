import mongoose from 'mongoose';
import { Types } from 'mongoose';

const RoomSchema = new mongoose.Schema({
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: String
    }]
});
const RoomModel = mongoose.model("RoomTest", RoomSchema);

async function run() {
    await mongoose.connect('mongodb://localhost:27017/test_db');
    await RoomModel.deleteMany({});
    
    const userId = new Types.ObjectId();
    const roomId = new Types.ObjectId();
    
    await RoomModel.create({
        _id: roomId,
        members: [{ user: userId, role: 'admin' }]
    });

    const room = await RoomModel.findOne({
        _id: roomId,
        members: {
            $elemMatch: { user: new Types.ObjectId(userId.toString()) }
        }
    }, { 'members.$': 1 });

    console.log("room:", room);
    console.log("role:", room?.members[0]?.role ?? null);
    
    process.exit(0);
}
run();
