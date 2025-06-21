const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectMangoDB = require("./src/config/database.js");
const passport = require("passport");
const session = require("express-session");
const Message = require("../Backend/src/models/message.js");
require("dotenv").config();

require("./src/config/passport.js");

// Connect MongoDB
connectMangoDB();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"], // Allow frontend connection
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(
  session({ secret: "secretkey", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

// Store active users
const activeUsers = new Map();

// Socket.io connection
io.on("connection", (socket) => {
  console.log("🔥 New user connected:", socket.id);

  // Listen for user joining
  socket.on("join", (userId) => {
    if (userId) {
      activeUsers.set(userId, socket.id);
      socket.join(userId); // Join a room with userId
      console.log(`✅ User ${userId} joined room ${userId}`);

      //Show to other when the user is online
      io.emit("onlineUsers", Array.from(activeUsers.keys()));
    }
  });

  //for seen
  socket.on("messageSeen", async ({ messageId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { isRead: true });
      console.log(`✅ Message ${messageId} marked as read`);
      io.emit("messageSeen", { messageId });
    } catch (err) {
      console.error("❌ Error marking message as read:", err);
    }
  });

  // Typing indicator
  socket.on("typing", ({ senderId, receiverId }) => {
    socket.to(receiverId).emit("typing", { senderId });
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    socket.to(receiverId).emit("stopTyping", { senderId });
  });

  // Listen for a send message
  socket.on("sendMessage", async ({ senderId, receiverId, content, media, messageType  }) => {
    try {
      // Save the message to DB
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        media: media || "", 
        messageType: messageType || "text",
        delivered: activeUsers.has(receiverId),
        createdAt: new Date(),
        seen: false,
      });
      await message.save();

      // Emit message to receiver if online
      if (activeUsers.has(receiverId)) {
        io.to(receiverId).emit("receiveMessage", message);

        // ✅ Also notify sender that message was delivered
        io.to(activeUsers.get(senderId)).emit("messageDelivered", {
          messageId: message._id,
          receiverId,
        });

        console.log(`📩 Message from ${senderId} to ${receiverId} saved and ${activeUsers.has(receiverId) ? "delivered" : "pending"}`);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    for (let [userId, sockId] of activeUsers.entries()) {
      if (sockId === socket.id) {
        activeUsers.delete(userId);
        console.log(`🔴 User ${userId} went offline`);
        io.emit("onlineUsers", Array.from(activeUsers.keys()));
        break;
      }
    }
  });
});

// Import Routes
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

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/friends", friendRequests);
app.use("/api/getId", getId);
app.use("/api/postId", getPost);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Server responses
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
