const Notification = require("../models/notification");

let io; // will be set from server.js
let activeUsers; // store reference to activeUsers map

/**
 * ✅ Inject Socket.IO instance and active users map
 */
function setSocketInstance(socketInstance, activeUsersMap) {
  io = socketInstance;
  activeUsers = activeUsersMap;
}

/**
 * ✅ Create and send notification
 */
const createNotification = async ({ receiver, sender, type, post, message }) => {
  try {
    // ✅ Prevent self notifications
    if (receiver.toString() === sender.toString()) return null;

    // ✅ Prevent duplicate like notifications
    if (type === "like") {
      const existing = await Notification.findOne({ user: receiver, sender, type, post });
      if (existing) return existing;
    }

    // ✅ Create & save
    const notification = await Notification.create({
      user: receiver,
      sender,
      type,
      post: post || null,
      message,
    });

    // ✅ Re-fetch populated version
    const populated = await Notification.findById(notification._id)
      .populate("sender", "username profilePic")
      .populate("post", "_id content image");

    // ✅ Emit to receiver if online
    if (io && activeUsers) {
      const receiverSocketId = activeUsers.get(receiver.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newNotification", populated.toObject());
        console.log(`📩 Sent notification to ${receiver} (${type})`);
      } else {
        console.log(`🕓 User ${receiver} offline — stored notification`);
      }
    }

    return populated;
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    return null;
  }
};

module.exports = { createNotification, setSocketInstance };
