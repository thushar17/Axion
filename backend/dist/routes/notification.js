import { Router } from "express";
import { notificationModel } from "../models/notification.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const NotificationRouter = Router();
// Get all notifications for the authenticated user
NotificationRouter.get("/", authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const notifications = await notificationModel
            .find({ recipient: user.id })
            .populate("sender", "username avatar status")
            .populate("roomId", "name type")
            .populate("messageId", "content")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            data: notifications,
        });
    }
    catch (error) {
        console.error("[NotificationRouter] Error getting notifications:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
// Mark all notifications as read
NotificationRouter.put("/mark-all-read", authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        await notificationModel.updateMany({ recipient: user.id, isRead: false }, { isRead: true });
        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    }
    catch (error) {
        console.error("[NotificationRouter] Error marking all notifications as read:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
// Mark a single notification as read
NotificationRouter.put("/:id/read", authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { id } = req.params;
        const notification = await notificationModel.findOneAndUpdate({ _id: id, recipient: user.id }, { isRead: true }, { new: true }).populate("sender", "username avatar status")
            .populate("roomId", "name type")
            .populate("messageId", "content");
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: notification,
        });
    }
    catch (error) {
        console.error("[NotificationRouter] Error marking notification as read:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
export default NotificationRouter;
//# sourceMappingURL=notification.js.map