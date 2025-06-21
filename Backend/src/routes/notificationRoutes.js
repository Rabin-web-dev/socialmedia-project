const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Notification = require("../models/notification");
const authMiddleware = require("../middleware/authMiddleware");

//Create notification
router.post("/", authMiddleware, async (req, res) => {
   // const { receiver, sender, type, post, message } = req.body;

    try {
        const { receiver, sender, type, post, message } = req.body;
        const notification = new Notification({
            user: receiver,
            receiver,
            sender,
            type,
            post: post || null,
            message,
        });

        await notification.save();

        res.status(201).json({ message: "Notification created successfully", notification });
    } catch (error) {
        console.error ("Error creating notification:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

//Get all notifications for a user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user.id })
        .sort({ createdAt: -1 })
        .populate("sender", "username")
        .populate("post", "title");
        
        res.status(200).json({ notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//Mark notification as read
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const notificationId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }

        const notification = await Notification.findById(notificationId);
        
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (!notification.user) {
            return res.status(400).json({ message: "Notification user is missing" });
        }


        if ( notification.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//Unread notification
router.get("/unread", authMiddleware, async (req, res) => {
    try {
        const unreadNotifications = await Notification.find({
            user: req.user.id,
            isRead: false
        }).sort({ createdAt: -1 }); // Get latest unread notifications first

        res.status(200).json(unreadNotifications);
    } catch (error) {
        console.error("Error fetching unread notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
});


//Delete notification
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.user.toString() !== String(req.user.id)) {
            return res.status(403).json({ message: "unauthorized" });
        }

        await Notification.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//Delete all notifications
router.delete("/", authMiddleware, async (req, res) => {
    try {
        const result = await Notification.deleteMany({ user: req.user.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No notifications found to delete" });
        }

        res.status(200).json({ message: "All notifications deleted successfully" });
    } catch (error) {
        console.error("Error deleting notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;