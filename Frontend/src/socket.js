import { io } from "socket.io-client";

const socket = io("https://stark-socialmedia.onrender.com", {
  withCredentials: true,
});

export default socket;
