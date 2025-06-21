const express = require("express");
const router = express.Router();
const User = require("../models/user"); // Make sure the path is correct

// Temporary route to get all users
router.get("/all-users", async (req, res) => {
    try {
        const users = await User.find().select("_id username");
        res.json(users); // Send response to Postman/browser
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
