const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/cloudinaryUpload");

// CREATE profile
router.post("/create-profile", authMiddleware, upload.single("profilePic"), async (req, res) => {
  const { bio, location, website, socialLinks } = req.body;

  try {
    const existingProfile = await Profile.findOne({ "user.username": req.user.username });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists for this user" });
    }

    // 🔹 Fetch full user object to embed
    const fullUser = await User.findById(req.user.userId).lean();
    if (!fullUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Prepare profilePic from Cloudinary
    const profilePicUrl = req.file ? req.file.path : "";

    // 🔹 Update profilePic in embedded user
    fullUser.profilePic = profilePicUrl;

    const profile = new Profile({
      user: fullUser,
      bio,
      location,
      website,
      socialLinks: JSON.parse(socialLinks || "{}"), // in case socialLinks are sent as JSON string
    });

    await profile.save();

    // ✅ Update profileCreated flag in User model here:
    await User.findByIdAndUpdate(req.user.userId, { profileCreated: true });

    res.status(201).json({ userId: fullUser._id, username: fullUser.username });
  } catch (error) {
    console.error("🔥 Profile creation failed:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// GET profile by username and userId
router.get("/:username/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ 
      username: req.params.username,
       _id: req.params.userId 
      })
      .populate("followers", "username name profilePic")
      .populate("following", "username name profilePic")
      .populate("posts");

      
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = await Profile.findOne({ "user._id": user._id })

    res.status(200).json({
      user,
      profile
    });
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message });
  }
});

// EDIT/UPDATE profile by username and userId
router.put(
  "/edit-profile/:username/:userId",
  authMiddleware,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const { username, userId } = req.params;
      const { name, gender, bio } = req.body;
      let { socialLinks } = req.body;  // 🛠️

      if (req.user.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // ✅ Handle profilePic (uploaded file or text URL)
      let profilePicUrl = req.body.profilePic;
      if (req.file) {
        profilePicUrl = req.file.path;
      }

      // ✅ Fix: if socialLinks is string, parse it
      if (typeof socialLinks === "string") {
        socialLinks = JSON.parse(socialLinks);
      }

      // ✅ Update User model
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          name,
          username: username.toLowerCase(),
          gender,
          profilePic: profilePicUrl,
          bio
        },
        { new: true }
      ).lean();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // ✅ Update Profile model
      const updatedProfile = await Profile.findOneAndUpdate(
        { "user._id": userId },
        {
          bio,
          socialLinks,
          user: {
            ...updatedUser,
            profilePic: profilePicUrl, // Important
          },
        },
        { new: true }
      );

      res.status(200).json({
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    } catch (error) {
      console.error("🔥 Profile update error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);


// DELETE profile by username and userId
router.delete("/:username/:userId", authMiddleware, async (req, res) => {
  try {
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this profile" });
    }

    const user = await User.findOne({ username: req.params.username, _id: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    await Profile.findOneAndDelete({ user: req.params.userId });
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
