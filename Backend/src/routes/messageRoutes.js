const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/messages/";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = (io) => {
  // ✅ Send message (text or media)
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { receiver, content, media, messageType } = req.body;
      if (!receiver || (!content && !media)) {
        return res.status(400).json({ message: "Content or media required" });
      }

      const message = new Message({
        sender: req.user.id,
        receiver,
        content: content || "",
        media: media || "",
        messageType: messageType || "text",
      });

      await message.save();

      io.to(receiver).emit("receiveMessage", message);
      res.status(201).json({ message: "Message sent", data: message });
    } catch (error) {
      console.error("❌ Error sending message:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  // ✅ Upload media (image, video, audio, file)
  router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/messages/${req.file.filename}`;
      res.status(200).json({ url: fileUrl });
    } catch (error) {
      console.error("❌ File upload failed:", error);
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  });

  // ✅ Get conversation
  router.get("/conversation/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username profilePic")
      .populate("receiver", "username profilePic")
      .populate("sharedPost", "image video content user");

    res.status(200).json({ messages });
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

  // ✅ Last message
  router.get("/last/:friendId", authMiddleware, async (req, res) => {
    try {
      const { friendId } = req.params;

      const lastMessage = await Message.findOne({
        $or: [
          { sender: req.user.id, receiver: friendId },
          { sender: friendId, receiver: req.user.id },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({ lastMessage });
    } catch (error) {
      console.error("❌ Error fetching last message:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  // ✅ Delete
  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      const message = await Message.findById(req.params.id);
      if (!message) return res.status(404).json({ message: "Message not found" });

      if (String(message.sender) !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await message.deleteOne();
      res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting message:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  return router;
};
