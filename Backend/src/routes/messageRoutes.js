const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const authMiddleware = require("../middleware/authMiddleware");

module.exports = (io) => {
    // Send message
    router.post("/", authMiddleware, async (req, res) => {
        try {
            const { receiver, content } = req.body;
            if (!receiver || !content) {
                return res.status(400).json({ message: "Receiver and content are required" });
            }

            console.log("🔹 Authenticated User:", req.user);

            const message = new Message({
                sender: req.user.userId,
                receiver,
                content,
            });

            await message.save();

            // Emit the message to the receiver in real-time
            io.to(receiver).emit("receiveMessage", message);

            res.status(201).json({ message: "Message sent successfully", data: message });

        } catch (error) {
            console.error("Error sending message:", error);
            res.status(500).json({ message: "Server error:", error: error.message });
        }
    });

    // Get all messages in a conversation
    router.get("/:userId", authMiddleware, async (req, res) => {
        try {
            const { userId } = req.params;
            const messages = await Message.find({
                $or: [
                    { sender: req.user.id, receiver: userId },
                    { sender: userId, receiver: req.user.id }
                ]
            }).sort({ createdAt: 1 });

            res.status(200).json({ messages });
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    });

    // Delete a message
    router.delete("/:id", authMiddleware, async (req, res) => {
        try {
            const message = await Message.findById(req.params.id);

            if (!message) {
                return res.status(404).json({ message: "Message not found" });
            }

            if (message.sender.toString() !== req.user.id) {
                return res.status(403).json({ message: "You can only delete your own messages" });
            }

            await Message.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: "Message deleted successfully" });
        } catch (error) {
            console.error("Error deleting message:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    });

    return router;
};
