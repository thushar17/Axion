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
        required: true
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
    }
})

export const MessageModel = model("Message", MessageSchema)