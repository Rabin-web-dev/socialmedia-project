// const { io } = require("socket.io-client");

// const socket = io("http://localhost:5000");

// socket.on("connect", () => {
//     console.log("Connected to server with ID:", socket.id);
// });

// socket.on("disconnect", () => {
//     console.log("Disconnected from server");
// });

// socket.on("connect_error", (err) => {
//     console.error("Connection Error:", err);
// });



const { io } = require("socket.io-client");

// Use deployed backend URL
const socket = io("https://stark-socialmedia.onrender.com", {
    transports: ["websocket"], // important for mobile browsers
});

socket.on("connect", () => {
    console.log("✅ Connected to server with ID:", socket.id);
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected from server");
});

socket.on("connect_error", (err) => {
    console.error("⚠️ Connection Error:", err.message);
});
