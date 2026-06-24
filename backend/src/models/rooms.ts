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
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
    ],
    createdBy:{
        type: String,
        required: true
    }
},
{
    timestamps: true
}
)

export const RoomModel = model("Room", RoomSchema)