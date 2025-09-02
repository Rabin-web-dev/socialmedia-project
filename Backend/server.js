const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectMangoDB = require("./src/config/database.js");
const passport = require("passport");
const session = require("express-session");
const Message = require("./src/models/message.js");
const User = require("./src/models/user.js");
require("dotenv").config();

require("./src/config/passport.js");

// ✅ Connect MongoDB
connectMangoDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "https://localhost:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

// ✅ Attach io & activeUsers to app so routes can access it
const activeUsers = new Map();
app.set("io", io);
app.set("activeUsers", activeUsers);

// ✅ Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://localhost:5173"], 
  credentials: true,
}));
app.use(express.json());
app.use(session({ secret: "secretkey", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

/* ------------------------------------
   ✅ SOCKET.IO EVENTS
------------------------------------ */
io.on("connection", (socket) => {
  console.log("🔥 New socket connected:", socket.id);

  // ✅ Join User Room & Update Online Users
  socket.on("join", (userId) => {
    if (!userId) return;
    activeUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`✅ User ${userId} joined. Socket ID: ${socket.id}`);
    io.emit("onlineUsers", Array.from(activeUsers.keys()));
  });

  // ✅ 📌 New: Send Notification
  socket.on("sendNotification", ({ receiverId, notification }) => {
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", notification);
      console.log(`🔔 Notification sent to ${receiverId}`);
    } else {
      console.log(`📭 User ${receiverId} offline, notification saved in DB only`);
    }
  });

  // ✅ Typing Indicator
  socket.on("typing", ({ from, to, typing }) => {
    const receiverSocketId = activeUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing-status", { from, typing });
    }
  });

  // ✅ Message Seen
  socket.on("messageSeen", async ({ messageId, receiverId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { seen: true });
      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageSeen", { messageId });
      }
    } catch (err) {
      console.error("❌ Seen error:", err);
    }
  });

  // ✅ Send Message
  socket.on("sendMessage", async ({ senderId, receiverId, content, media, messageType, postId }) => {
  try {
    const isReceiverOnline = activeUsers.has(receiverId);

    const messageData = {
      sender: senderId,
      receiver: receiverId,
      content: content || "",
      media: media || "",
      messageType: messageType || "text",
      delivered: isReceiverOnline,
      seen: false,
      createdAt: new Date(),
    };

    // ✅ If sharing a post, attach it
    if (messageType === "post" && postId) {
      messageData.sharedPost = postId;
    }

    const message = new Message(messageData);
    await message.save();

    // ✅ Populate sharedPost, sender & receiver
    const populatedMessage = await Message.findById(message._id)
      .populate("sharedPost", "image video content")
      .populate("sender", "username profilePic")
      .populate("receiver", "username profilePic");

    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", populatedMessage);
      io.to(socket.id).emit("messageDelivered", {
        messageId: populatedMessage._id,
        receiverId,
      });
    }
  } catch (error) {
    console.error("❌ Send error:", error);
  }
});



  // ✅ Incoming Call
  socket.on("incomingCall", ({ callerId, receiverId, callType, callerName, callerProfilePic, roomID }) => {
    const receiverSocket = activeUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("incomingCall", {
        callerId,
        callerName,
        callerProfilePic,
        callType,
        roomID,
        time: new Date().toISOString(),
      });
    } else {
      io.to(socket.id).emit("callFailed", {
        reason: "User is offline or unavailable.",
      });
    }
  });

  // ✅ Disconnect + Save Last Seen
  socket.on("disconnect", async () => {
    for (let [userId, sockId] of activeUsers.entries()) {
      if (sockId === socket.id) {
        activeUsers.delete(userId);
        const lastSeen = new Date();
        try {
          await User.findByIdAndUpdate(userId, { lastSeen });
        } catch (err) {
          console.error("❌ Error updating last seen:", err);
        }
        io.emit("onlineUsers", Array.from(activeUsers.keys()));
        io.emit("lastSeenUpdate", { userId, lastSeen });
        break;
      }
    }
  });
});

/* ------------------------------------
   ✅ ROUTES
------------------------------------ */
const authRoutes = require("./src/routes/authenticationRoutes.js");
const userRoutes = require("./src/routes/userRoutes.js");
const postRoutes = require("./src/routes/postRoutes.js");
const messageRouter = require("./src/routes/messageRoutes.js")(io);
const notificationRoutes = require("./src/routes/notificationRoutes.js");
const friendRequests = require("./src/routes/friendRequestRoutes.js");
const getId = require("./src/routes/userIdGetRoutes.js");
const getPost = require("./src/routes/getPostIdRoutes.js");
const profileRoutes = require("./src/routes/profileRoutes.js");
const searchRoutes = require("./src/routes/searchRoutes.js");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRouter);
app.use("/uploads/messages", express.static("uploads/messages"));
app.use("/api/notifications", notificationRoutes);
app.use("/api/friends", friendRequests);
app.use("/api/getId", getId);
app.use("/api/postId", getPost);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
