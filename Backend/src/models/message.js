const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String, // for text messages
      default: "",
    },
    media: {
      type: String, // for media URL
      default: "",
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio"],
      default: "text",
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

module.exports = Message;
