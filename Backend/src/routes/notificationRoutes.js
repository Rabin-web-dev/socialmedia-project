const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/notification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * ✅ Create Notification (manual endpoint, usually handled by createNotification util)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { receiver, type, post, message } = req.body;

    const notification = new Notification({
      user: receiver, // receiver of the notification
      sender: req.user.id, // logged-in user as sender
      type,
      post: post || null,
      message,
    });

    await notification.save();

    // ✅ Emit real-time notification if Socket.IO is active
    const io = req.app.get("io");
    if (io) {
      io.to(receiver.toString()).emit("newNotification", notification);
    }

    res.status(201).json({ message: "Notification created successfully", notification });
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * ✅ Get all notifications for logged-in user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("sender", "username profilePic")
      .populate("post", "image video content")
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Get unread notifications count
 */
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("❌ Error fetching unread count:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Get unread notifications (full list)
 */
router.get("/unread", authMiddleware, async (req, res) => {
  try {
    const unreadNotifications = await Notification.find({
      user: req.user.id,
      isRead: false,
    })
      .populate("sender", "username profilePic")
      .populate("post", "image video")
      .sort({ createdAt: -1 });

    res.status(200).json(unreadNotifications);
  } catch (error) {
    console.error("❌ Error fetching unread notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Mark a single notification as read
 */
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Mark all notifications as read
 */
router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("❌ Error marking all as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Delete a single notification
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Delete all notifications for the logged-in user
 */
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ user: req.user.id });

    res.status(200).json({ message: `${result.deletedCount} notifications deleted` });
  } catch (error) {
    console.error("❌ Error deleting notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
