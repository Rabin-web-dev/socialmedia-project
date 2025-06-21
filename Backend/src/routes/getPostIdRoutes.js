const express = require("express");
const router = express.Router();
const Post = require("../models/post"); // Adjust path based on your project

// Route to get all posts (ID & Title)
router.get("/all-posts", async (req, res) => {
    try {
        const posts = await Post.find().select("_id title");
        res.json(posts); // Send response to Postman/browser
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
