import {Schema, model} from 'mongoose'

const UserSchema = new Schema({
    email:{
        type: String,
        required:true,
        unique: true
    },
    username:{
        type: String,
        required:true,
        unique: true
    },
    passwordHash:{
        type: String,
        required:true
    },
    avatar:{
        type:String
    },
    status:{
        type: String,
        enum:["online","offline"],
        default: "offline"
    },
    lastSeen:{
        type: Date
    },
    starredMessages: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
        default: []
    },
    mutedRooms: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
        default: []
    },
    archivedRooms: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
        default: []
    },
    clearedRooms: {
        type: [{
            roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
            clearedAt: { type: Date, default: Date.now }
        }],
        default: []
    }

})

export const UserModel = model("User", UserSchema);