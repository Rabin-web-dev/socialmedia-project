const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");
const FriendRequest = require("../models/friendRequest");
const mongoose = require("mongoose");


// Send Friend Request
router.post("/request/:id", authMiddleware, async (req, res) => {
    try {
        const senderId = req.user.userId; // User sending the request
        const receiverId = req.params.id; // User receiving the request

        if (senderId === receiverId) {
            return res.status(400).json({ message: "You can't send a friend request to yourself" });
        }

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if a request already exists
        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiverId,
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        const newRequest = new FriendRequest({
           // sender: senderId,
           sender: req.user.userId,
           // receiver: receiverId,
           receiver: req.params.id,
            status: "pending"
        });

        await newRequest.save();

        res.status(201).json({ message: "Friend request sent successfully" });

    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//Accept friend request
router.put("/accept/:requestId", authMiddleware, async (req, res) => {
    try {
        console.log("🔹 Friend Request Accept API Called");
        console.log("📌 Incoming Request ID:", req.params.requestId);
        console.log("👤 Requesting User:", req.user);


        // Validate requestId format
        if (!mongoose.Types.ObjectId.isValid(req.params.requestId)) {
            console.log("❌ Invalid Friend Request ID Format");
            return res.status(400).json({ message: "Invalid request ID" });
        }

        const friendRequest = await FriendRequest.findById(req.params.requestId);

        if (!friendRequest) {
            console.log("❌ Friend request not found");
            return res.status(404).json({ message: "Friend request not found" });
        }

        console.log("✅ Friend request found:", friendRequest);


        if (friendRequest.receiver.toString() !== req.user.userId) {
            console.log("❌ Unauthorized: User is not the intended receiver");
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (friendRequest.status !== "pending") {
            console.log("⚠ Friend request already processed:", friendRequest.status);
            return res.status(400).json({ message: "Friend request already processed" });
        }

        // Update status to accepted
        console.log("🔄 Updating Friend Request Status...");
        friendRequest.status = "accepted";
        await friendRequest.save();
        console.log("✅ Friend Request Status Updated to 'accepted'");

        // Use bulkWrite to update both users in a single DB operation
        console.log("🔄 Updating Users' Friend Lists...");
        const updates = [
            {
                updateOne: {
                    filter: { _id: friendRequest.sender },
                    update: { $addToSet: { friends: friendRequest.receiver } }
                }
            },
            {
                updateOne: {
                    filter: { _id: friendRequest.receiver },
                    update: { $addToSet: { friends: friendRequest.sender } }
                }
            }
        ];

        const result = await User.bulkWrite(updates);
        console.log("✅ Bulk Write Result:", result);

        if (result.modifiedCount < 2) {
            console.log("❌ Failed to update both users' friend lists");
            return res.status(500).json({ message: "Failed to update friend lists" });
        }

        // Delete friend request after successful updates
        console.log("🔄 Deleting Friend Request...");
        await FriendRequest.findByIdAndDelete(req.params.requestId);
        console.log("✅ Friend Request Deleted Successfully");

        res.status(200).json({ message: "Friend request accepted successfully" });

    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//Decline friend request
router.delete("/decline/:requestId", authMiddleware, async (req, res) => {
    try {
        const friendRequest = await FriendRequest.findById(req.params.requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        if (friendRequest.receiver.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Delete the friend request (declining it)
        await FriendRequest.findByIdAndDelete(req.params.requestId);

        res.status(200).json({ message: "Friend request declined successfully" });

    } catch (error) {
        console.error("Error declining friend request:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//Get friend request (Incoming and Outgoing)
router.get("/requests", authMiddleware, async (req, res) => {
    try {
        // Get incoming friend requests (where the user is the receiver)
        const incomingRequests = await FriendRequest.find({ receiver: req.user.userId })
            .populate("sender", "username email"); // Populate sender details

        // Get outgoing friend requests (where the user is the sender)
        const outgoingRequests = await FriendRequest.find({ sender: req.user.userId })
            .populate("receiver", "username email"); // Populate receiver details

        res.status(200).json({
            incomingRequests,
            outgoingRequests
        });

    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Remove Friend Request (Cancel/Reject)
router.delete("/request/:id", authMiddleware, async (req, res) => {
    try {
        // Validate requestId format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid request ID" });
        }

        const request = await FriendRequest.findById(req.params.id);

        if (!request) {
            console.log(`❌ Friend request not found for ID: ${req.params.id}`);
            return res.status(404).json({ message: "Friend request not found" });
        }

        // Only sender or receiver can delete the request
        if (request.sender.toString() !== req.user.userId && request.receiver.toString() !== req.user.userId) {
            console.log(`❌ Unauthorized: User ${req.user.userId} tried to delete request ${req.params.id}`);
            return res.status(403).json({ message: "Unauthorized" });
        }

        await request.deleteOne(); // Delete the friend request

        console.log(`✅ Friend request ${req.params.id} deleted successfully by user ${req.user.userId}`);

        res.status(200).json({ message: "Friend request removed successfully" });

    } catch (error) {
        console.error("Error removing friend request:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get Friends List
router.get("/friends", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate("friends", "name profilePic");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ friends: user.friends });

    } catch (error) {
        console.error("Error fetching friends list:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Remove Friend (Unfriend)
router.delete("/unfriend/:friendId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const friendId = req.params.friendId;

        console.log("🔍 User trying to unfriend:", userId);
        console.log("🔍 Friend to remove:", friendId);

        // Check if both users exist
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            console.log("❌ User or friend not found");
            return res.status(404).json({ message: "User not found" });
        }

        // Check if they are actually friends
        if (!user.friends.includes(friendId)) {
            console.log("❌ Not friends, cannot unfriend");
            return res.status(400).json({ message: "User is not your friend" });
        }

        console.log("✅ Friends before removal:", user.friends);

        // Remove friend from both users' lists
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);

        console.log("✅ Friends after removal:", user.friends);

        await user.save();
        await friend.save();

        console.log("✅ Unfriended successfully");
        res.status(200).json({ message: "Friend removed successfully" });

    } catch (error) {
        console.error("❌ Error removing friend:", error);
        res.status(500).json({ message: "Server error" });
    }
});
 
// Get Mutual Friends
router.get("/mutual/:userId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = req.params.userId;

        // Check if both users exist
        const user = await User.findById(userId).select("friends");
        const targetUser = await User.findById(targetUserId).select("friends");

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find mutual friends
        const mutualFriends = user.friends.filter(friendId => 
            targetUser.friends.includes(friendId.toString())
        );

        // Get full details of mutual friends
        const mutualFriendsData = await User.find({ _id: { $in: mutualFriends } }).select("username email");

        res.status(200).json({ mutualFriends: mutualFriendsData });

    } catch (error) {
        console.error("Error fetching mutual friends:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;