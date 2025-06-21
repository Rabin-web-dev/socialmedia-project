const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: "",
    },
    profileCreated: {
      type: Boolean,
      default: false,
    },
    resetPasswordExpires: {
      type: Date,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
