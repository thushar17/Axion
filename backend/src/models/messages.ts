import { Schema, model } from 'mongoose'

const MessageSchema = new Schema({
    roomId: {
        type: String,
        required: true
    },
    sender: {
        type: String,
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
    }
})

export const MessageModel = model("Message", MessageSchema)