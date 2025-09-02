const Notification = require("../models/notification");
const User = require("../models/user");

/**
 * ✅ Create Notification Utility
 * @param {Object} data - Notification data
 * @param {String} data.receiver - The user who will receive the notification
 * @param {String} data.sender - The user who triggered the notification
 * @param {String} data.type - Type of notification (like, comment, share, follow, message)
 * @param {String} [data.post] - Post ID (if related to a post)
 * @param {String} data.message - Notification message
 */
const createNotification = async ({ receiver, sender, type, post, message }) => {
  try {
    // ✅ Avoid sending notification to self
    if (receiver.toString() === sender.toString()) return null;

    // ✅ Optional: Avoid duplicate like notifications
    if (type === "like") {
      const existing = await Notification.findOne({
        user: receiver,
        sender,
        type,
        post,
      });
      if (existing) return existing;
    }

    // ✅ Create notification
    const notification = new Notification({
      user: receiver,
      sender,
      type,
      post: post || null,
      message,
    });

    await notification.save();

    // ✅ Populate sender details for real-time frontend display
    const populatedNotification = await Notification.findById(notification._id)
      .populate("sender", "username profilePic")
      .populate("post", "_id content image");

    console.log(`✅ Notification created for user ${receiver}: ${type}`);
    return populatedNotification;
  } catch (error) {
    console.error("❌ Error creating notification:", error.message);
    return null;
  }
};

module.exports = createNotification;
