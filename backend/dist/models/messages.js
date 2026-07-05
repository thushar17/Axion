import mongoose, { Schema, model, mongo } from 'mongoose';
import { required } from 'zod/mini';
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
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    pinned: {
        isPinned: {
            type: Boolean,
            default: false
        },
        pinnedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        pinnedAt: {
            type: Date,
            default: null
        }
    },
    reactions: {
        type: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                emoji: {
                    type: String,
                    required: true
                }
            }
        ],
        default: []
    }
});
export const MessageModel = model("Message", MessageSchema);
//# sourceMappingURL=messages.js.map