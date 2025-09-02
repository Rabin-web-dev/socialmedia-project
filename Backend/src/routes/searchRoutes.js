const express = require("express");
const User = require("../models/user");
const Post = require("../models/Post"); 

const router = express.Router();

router.get("/users", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ message: "Query string is missing" });
  }

  try {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ]
    }).select("_id username name");

    res.status(200).json(users);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/posts", async (req, res) => {
  const query = req.query.q;

  if (!query) return res.status(400).json({ message: "Query is required" });

  try {
    const posts = await Post.find({
      content: { $regex: query, $options: "i" },
    }).populate("author", "username profilePic");

    res.json(posts);
  } catch (error) {
    console.error("Post search error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;