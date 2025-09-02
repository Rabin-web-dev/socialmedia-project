const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const Post = require("../models/post");
const User = require("../models/user");
const createNotification = require("../utils/createNotification");

const router = express.Router();

/* ------------------------------------
   ✅ Create Post
------------------------------------ */
router.post(
  "/create-post",
  authMiddleware,
  async (req, res) => {
    try {
      const { content, image, video } = req.body;

      if (!content && !image && !video) {
        return res.status(400).json({ message: "Post must have text, image, or video" });
      }

      const newPost = new Post({
        user: req.user.id,
        content: content || "",
        image: image || "",
        video: video || "",
      });

      const savedPost = await newPost.save();

      await User.findByIdAndUpdate(
        req.user.userId,
        { $push: { posts: savedPost._id } },
        { new: true }
      );

      res.status(201).json({ message: "Post created", post: savedPost });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);


/* ------------------------------------
   ✅ Get Posts by User
------------------------------------ */
router.get("/user/:username/:userId", async (req, res) => {
  try {
    const { username, userId } = req.params;
    const user = await User.findOne({ _id: userId, username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user: user._id }).populate("user", "username profilePic");
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ------------------------------------
   ✅ Get All Posts
------------------------------------ */
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ------------------------------------
   ✅ Delete Post
------------------------------------ */
router.delete("/:username/:userId/:postId", authMiddleware, async (req, res) => {
  try {
    const { userId, postId } = req.params;
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const post = await Post.findOne({ _id: postId, user: userId });
    if (!post) return res.status(404).json({ message: "Post not found" });

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ------------------------------------
   ✅ Update Post
------------------------------------ */
router.put("/:username/:userId/:postId", authMiddleware, async (req, res) => {
  try {
    const { userId, postId } = req.params;
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const post = await Post.findOne({ _id: postId, user: userId });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const updatedPost = await Post.findByIdAndUpdate(postId, { $set: req.body }, { new: true });
    res.status(200).json({ message: "Post updated", post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ------------------------------------
   ✅ Like / Unlike Post + Notification
------------------------------------ */
router.put("/:postId/like", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId).populate("user");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const postOwnerId = post.user._id.toString();
    let action = "";

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      action = "unliked";
    } else {
      post.likes.push(userId);
      action = "liked";

      if (userId !== postOwnerId) {
        const notification = await createNotification({
          receiver: postOwnerId,
          sender: userId,
          type: "like",
          post: post._id,
          message: "liked your post",
        });

        const io = req.app.get("io");
        const activeUsers = req.app.get("activeUsers");
        const receiverSocketId = activeUsers.get(postOwnerId);
        if (receiverSocketId) io.to(receiverSocketId).emit("newNotification", notification);
      }
    }

    await post.save();
    res.status(200).json({ likes: post.likes, action });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ------------------------------------
   ✅ Comment + Notification
------------------------------------ */
router.post("/:postId/comment", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate("user");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const userId = req.user.userId || req.user.id;
    const comment = { user: userId, text, createdAt: new Date() };

    post.comments.push(comment);
    await post.save();
    await post.populate("comments.user", "username profilePic");

    if (userId !== post.user._id.toString()) {
      const notification = await createNotification({
        receiver: post.user._id,
        sender: userId,
        type: "comment",
        post: post._id,
        message: "commented on your post",
      });

      const io = req.app.get("io");
      const activeUsers = req.app.get("activeUsers");
      const receiverSocketId = activeUsers.get(post.user._id.toString());
      if (receiverSocketId) io.to(receiverSocketId).emit("newNotification", notification);
    }

    res.status(201).json({ message: "Comment added", post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ------------------------------------
   ✅ Share + Notification
------------------------------------ */
router.post("/:postId/share", authMiddleware, async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.postId).populate("user");
    if (!originalPost) return res.status(404).json({ message: "Original post not found" });

    const sharedPost = new Post({
      user: req.user.id,
      content: originalPost.content,
      image: originalPost.image,
      isShared: true,
      originalPost: originalPost._id,
    });

    const savedPost = await sharedPost.save();

    if (req.user.id !== originalPost.user._id.toString()) {
      const notification = await createNotification({
        receiver: originalPost.user._id,
        sender: req.user.id,
        type: "share",
        post: originalPost._id,
        message: "shared your post",
      });

      const io = req.app.get("io");
      const activeUsers = req.app.get("activeUsers");
      const receiverSocketId = activeUsers.get(originalPost.user._id.toString());
      if (receiverSocketId) io.to(receiverSocketId).emit("newNotification", notification);
    }

    res.status(201).json({ message: "Post shared", post: savedPost });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ------------------------------------
   ✅ Save / Unsave Post
------------------------------------ */
router.put("/:userId/saved-posts", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { postId } = req.body;

    console.log("👉 Save API called:", { userId, postId, authUser: req.user });

    const loggedInUserId = req.user.userId || req.user.id;
    if (loggedInUserId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.savedPosts) user.savedPosts = [];

    let bookmarked = false;

    if (user.savedPosts.some((id) => id && id.toString() === postId.toString())) {
      // ✅ Remove safely
      user.savedPosts = user.savedPosts.filter(
        (id) => id && id.toString() !== postId.toString()
      );
    } else {
      // ✅ Add safely
      user.savedPosts.push(postId);
      bookmarked = true;
    }

    await user.save();
    res.status(200).json({ bookmarked, savedPosts: user.savedPosts });
  } catch (error) {
    console.error("❌ Save API error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



/* ------------------------------------
   ✅ Get Saved Posts
------------------------------------ */
router.get("/:userId/saved-posts", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("savedPosts");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ savedPosts: user.savedPosts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ------------------------------------
   ✅ Get a single post
------------------------------------ */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username profilePic")
      .populate({
        path: "comments.user",
        select: "username profilePic",
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error("❌ Error fetching single post:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
