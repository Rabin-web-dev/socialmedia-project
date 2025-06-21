import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import 'react-loading-skeleton/dist/skeleton.css';
import { useSocket } from "./hooks/useSocket";
import { Toaster } from 'react-hot-toast';

const App = () => {
  const socket = useSocket();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?._id && socket && typeof socket.emit === "function") {
      socket.emit("join", user._id);
      console.log("🔌 Joined socket room:", user._id);
    }
  }, [socket, user?._id]);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <AppRoutes />
    </>
  );
};

export default App;
