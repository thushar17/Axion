import {Schema, model} from 'mongoose'

const RoomSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    type:
    {
        type: String,
        enum: ["public","private","dm"],
        required: true
    },
    members:[{
        user:{
          type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
        },

       role:{
        type: String,
        enum: ['admin','member'],
        required: true
       }

        
    }
    ],
    createdBy:{
        type: String,
        required: true
    },
    inviteLink:{
        type: String,
        unique: true,
        sparse: true
    },
    inviteLinkExpiresAt:{
        type: Date
    },
    
    lastMessage:{
        content:{
            type: String,
            default: ""
        },
        sender:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },
        type:{
            type:String,
            enum:["text","image","file","video","audio"],
            default: 'text'
        }
    },
    lastMessageAt:{
        type: Date,
    }

},

{
    timestamps: true
}
)

export const RoomModel = model("Room", RoomSchema)