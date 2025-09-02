const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // ✅ Receiver
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // ✅ Sender
    },
    type: {
      type: String,
      enum: ["like", "comment", "share", "follow", "message", "mention"],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false, // ✅ For unread count
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate notifications for same user/action/post (e.g., multiple likes)
notificationSchema.index(
  { user: 1, sender: 1, type: 1, post: 1 },
  { unique: false }
);

// ✅ Auto-format JSON output (cleaner data to frontend)
notificationSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
