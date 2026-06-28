import {Schema, model} from 'mongoose'

const RoomSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    type:
    {
        type: String,
        enum: ["public","private"],
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
    }
},
{
    timestamps: true
}
)

export const RoomModel = model("Room", RoomSchema)