import { io } from "socket.io-client";

const socket = io("https://your-backend.onrender.com", {
  withCredentials: true,
});

export default socket;
