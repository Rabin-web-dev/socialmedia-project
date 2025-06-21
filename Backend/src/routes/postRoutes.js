const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const Post = require("../models/post");
const User = require("../models/User");

const router = express.Router();

// 1. Create Post
router.post(
    "/create-post",
    authMiddleware,
    [body("content").notEmpty().withMessage("Content is required")],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { content, image } = req.body;
            const newPost = new Post({
                user: req.user.userId,
                content,
                image: image || ""
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

// 2. Get a particular user's post by username and userId
router.get("/user/:username/:userId", async (req, res) => {
    try {
        const { username, userId } = req.params;

        const user = await User.findOne({ _id: userId, username });
        if (!user) return res.status(404).json({ message: "User not found" });

        const posts = await Post.find({ user: user._id }).populate("user", "username profilePic");
        console.log("Fetched posts from DB:", posts);
        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 3. Get all posts
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find().populate("user", "username profilePic");
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 4. Delete a user's specific post
router.delete("/:username/:userId/:postId", authMiddleware, async (req, res) => {
    try {
        const { username, userId, postId } = req.params;

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

// 5. Update a user's specific post
router.put("/:username/:userId/:postId", authMiddleware, async (req, res) => {
    try {
        const { username, userId, postId } = req.params;

        if (req.user.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const post = await Post.findOne({ _id: postId, user: userId });
        if (!post) return res.status(404).json({ message: "Post not found" });

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $set: req.body },
            { new: true }
        );

        res.status(200).json({ message: "Post updated", post: updatedPost });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Like/Unlike Post
router.put("/:postId/like", authMiddleware, async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
  
      const userId = req.user.id;
      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter((id) => id.toString() !== userId);
        await post.save();
        return res.status(200).json({ message: "Post unliked" });
      } else {
        post.likes.push(userId);
        await post.save();
        return res.status(200).json({ message: "Post liked" });
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Comment on Post
  router.post("/:postId/comment", authMiddleware, async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
  
      const { text } = req.body;
      if (!text) return res.status(400).json({ message: "Comment text is required" });
  
      const comment = {
        user: req.user.id,
        text,
        createdAt: new Date(),
      };
  
      post.comments.push(comment);
      await post.save();
  
      res.status(201).json({ message: "Comment added", post });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Bookmark Post
  router.put("/:postId/bookmark", authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const postId = req.params.postId;
      const isBookmarked = user.bookmarks.includes(postId);
  
      if (isBookmarked) {
        user.bookmarks = user.bookmarks.filter((id) => id.toString() !== postId);
        await user.save();
        return res.status(200).json({ message: "Post removed from bookmarks" });
      } else {
        user.bookmarks.push(postId);
        await user.save();
        return res.status(200).json({ message: "Post bookmarked" });
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Share Post
  router.post("/:postId/share", authMiddleware, async (req, res) => {
    try {
      const originalPost = await Post.findById(req.params.postId);
      if (!originalPost) return res.status(404).json({ message: "Original post not found" });
  
      const sharedPost = new Post({
        user: req.user.id,
        content: originalPost.content,
        image: originalPost.image,
        isShared: true,
        originalPost: originalPost._id,
      });
  
      const savedPost = await sharedPost.save();
      res.status(201).json({ message: "Post shared", post: savedPost });
    } catch (error) {
      console.error("Error sharing post:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
module.exports = router;
