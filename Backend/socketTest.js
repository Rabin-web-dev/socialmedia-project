// const { io } = require("socket.io-client");

// const socket = io("http://localhost:5000");

// socket.on("connect", () => {
//     console.log("🟢 Connected to Server:", socket.id);
// });

// socket.on("disconnect", () => {
//     console.log("❌ Disconnected from Server");
// });


const { io } = require("socket.io-client");

// Use your deployed backend URL, not localhost
const socket = io("https://stark-socialmedia.onrender.com", {
    transports: ["websocket"], // force websocket for mobile support
});

socket.on("connect", () => {
    console.log("🟢 Connected to Server:", socket.id);
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected from Server");
});

socket.on("connect_error", (err) => {
    console.error("⚠️ Connection Error:", err.message);
});
