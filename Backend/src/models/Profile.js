const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  website: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  socialLinks: {
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
    linkedin: { type: String, default: "" },
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
