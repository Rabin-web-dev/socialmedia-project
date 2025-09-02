const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/user");
const Profile = require("../models/profile");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Utility to find user by ID or username+ID
const findUser = async (username, userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;
  const user = await User.findOne({ _id: userId, username });
  return user;
};

// 1. GET user details (only user, not profile or posts)
router.get("/:username/:userId", async (req, res) => {
  try {
    const { username, userId } = req.params;

    // Get User
    const user = await User.findOne({ username, _id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get Profile linked to that user
    const profile = await Profile.findOne({ "user._id": user._id });

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        gender: user.gender,
        profileCreated: user.profileCreated,
        createdAt: user.createdAt,
      },
      profile: {
        profilePic: profile.profilePic,
        followers: profile.followers,
        following: profile.following,
        posts: profile.posts,
      },
    });
  } catch (error) {
    console.error("Error fetching full profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. UPDATE user details
router.put("/:username/:userId", async (req, res) => {
  const { username, id } = req.params;
  try {
    const user = await findUser(username, id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedUser = await User.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 3. DELETE user
router.delete("/:username/:userId", authMiddleware, async (req, res) => {
  const { username, id } = req.params;
  try {
    if (req.user.id !== id && !req.user.isAdmin)
      return res.status(403).json({ message: "You can delete only your account" });

    const user = await findUser(username, id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 4. FOLLOW user
router.post("/follow/:username/:userId", authMiddleware, async (req, res) => {
  const { username, userId  } = req.params;
  const currentUserId = req.user.id;
  try {
     if (currentUserId === userId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }
    const userToFollow = await findUser(username, userId );
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) return res.status(404).json({ message: "User not found" });
    if (userToFollow.followers.includes(currentUserId))
      return res.status(400).json({ message: "Already following this user" });

    userToFollow.followers.push(currentUserId);
    currentUser.following.push(userToFollow._id);

    await userToFollow.save();
    await currentUser.save();

    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 5. UNFOLLOW user
router.post("/unfollow/:username/:userId", authMiddleware, async (req, res) => {
  const { username, userId } = req.params;
  const currentUserId = req.user.id;

  try {
    if (currentUserId === userId) {
      return res.status(400).json({ message: "You can't unfollow yourself" });
    }

    const userToUnfollow = await findUser(username, userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already not following
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    // Remove userId from currentUser.following
    currentUser.following = currentUser.following.filter(
      (f) => f.toString() !== userId
    );

    // Remove currentUserId from userToUnfollow.followers
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (f) => f.toString() !== currentUserId
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// 6. GET followers list
router.get("/profile/:username/:userId/followers", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate("followers", "username name profilePic followers");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ followers: user.followers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 7. GET following list
router.get("/profile/:username/:userId/following", authMiddleware, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate("following", "username name profilePic");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ following: user.following });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Get basic user info by ID (for chat header/sidebar)
router.get("/user/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username name profilePic");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 8. GET all users (for ShareModal)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("username name profilePic _id");
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET current logged-in user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username name email profilePic");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
