import { Worker } from "bullmq";
import { bullConnection } from "../lib/bullmq.js";
import { MessageModel } from "../models/messages.js";
import { extractMentions } from "../helpers/extractMentions.js";
import { UserModel } from "../models/user.js";
import { RoomModel } from "../models/rooms.js";
import { notificationModel } from "../models/notification.js";
import { getIO } from "../socket/index.js";

export const notificationWorker = new Worker(
    "notification",
    async (job) => {
        try {
            switch (job.name) {
                case 'new-message':
                    const { messageId } = job.data;
                    const message = await MessageModel.findById(messageId);
                    if (!message) {
                        console.log(`[NotificationWorker] Message with ID ${messageId} not found in DB`);
                        return;
                    }

                    const room = await RoomModel.findById(message.roomId);
                    const notifiedRecipients = new Set<string>();

                    // 1. Direct Messages
                    if (room && room.type === "dm") {
                        const recipientMember = room.members.find(
                            (m) => m.user.toString() !== message.sender.toString()
                        );
                        if (recipientMember) {
                            const recipientId = recipientMember.user.toString();
                            const notification = await notificationModel.create({
                                recipient: recipientId,
                                sender: message.sender,
                                type: "direct_message",
                                roomId: message.roomId,
                                messageId: message._id
                            });

                            notifiedRecipients.add(recipientId);

                            try {
                                const populated = await notification.populate([
                                    { path: "sender", select: "username avatar status" },
                                    { path: "roomId", select: "name type" }
                                ]);
                                const io = getIO();
                                io.to(recipientId).emit("notification", populated);
                            } catch (ioErr) {
                                console.error(`[NotificationWorker] Error emitting DM notification:`, ioErr);
                            }
                        }
                    }

                    // 2. Replies
                    if (message.replyTo) {
                        const originalMessage = await MessageModel.findById(message.replyTo);
                        if (originalMessage && originalMessage.sender.toString() !== message.sender.toString()) {
                            const recipientId = originalMessage.sender.toString();
                            if (!notifiedRecipients.has(recipientId)) {
                                const notification = await notificationModel.create({
                                    recipient: recipientId,
                                    sender: message.sender,
                                    type: "reply",
                                    roomId: message.roomId,
                                    messageId: message._id
                                });

                                notifiedRecipients.add(recipientId);

                                try {
                                    const populated = await notification.populate([
                                        { path: "sender", select: "username avatar status" },
                                        { path: "roomId", select: "name type" }
                                    ]);
                                    const io = getIO();
                                    io.to(recipientId).emit("notification", populated);
                                } catch (ioErr) {
                                    console.error(`[NotificationWorker] Error emitting reply notification:`, ioErr);
                                }
                            }
                        }
                    }

                    // 3. Mentions
                    const mentions = extractMentions(message.content);
                    if (mentions.length > 0) {
                        const users = await UserModel.find({
                            username: {
                                $in: mentions
                            }
                        });

                        for (const user of users) {
                            const recipientId = user._id.toString();
                            if (recipientId === message.sender.toString()) {
                                continue;
                            }
                            if (!notifiedRecipients.has(recipientId)) {
                                const notification = await notificationModel.create({
                                    recipient: user._id,
                                    sender: message.sender,
                                    type: "mention",
                                    roomId: message.roomId,
                                    messageId: message._id
                                });

                                notifiedRecipients.add(recipientId);

                                try {
                                    const populated = await notification.populate([
                                        { path: "sender", select: "username avatar status" },
                                        { path: "roomId", select: "name type" }
                                    ]);
                                    const io = getIO();
                                    io.to(recipientId).emit("notification", populated);
                                } catch (ioErr) {
                                    console.error(`[NotificationWorker] Error emitting mention notification:`, ioErr);
                                }
                            }
                        }
                    }
                    break;

                default:
                    console.log("[NotificationWorker] Unknown job:", job.name);
            }
        } catch (error) {
            console.error(`[NotificationWorker] Error processing job ${job.id}:`, error);
            throw error;
        }
    },
    {
        connection: bullConnection as any
    }
)
