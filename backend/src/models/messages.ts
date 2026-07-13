import mongoose, { Schema, model, mongo } from 'mongoose' 

const MessageSchema = new Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "seen"],
        default: "sent"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    replyTo:{
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    isEdited:{
      type: Boolean,
      default: false
    },
    isDeleted:{
      type: Boolean,
      default: false
    },
    pinned:{
        isPinned:{
            type: Boolean,
            default: false
        },
        pinnedBy:{
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        pinnedAt:{
            type: Date,
            default: null
        }
    },
   
    reactions:{
        type:[
            {
                user:{
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },

                emoji:{
                    type: String,
                    required: true
                }
            }


        ],
        default: []
    },
     attachment: {
      url: String,
      publicId: String,
      fileName: String,
      mimeType: String,
      size: Number,
    },
        
})

export const MessageModel = model("Message", MessageSchema)