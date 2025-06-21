import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketContext";



export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingStatus, setTypingStatus] = useState({});

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("online-users", (users) => {
    setOnlineUsers(users);
  });

  newSocket.on("typing-status", (data) => {
    setTypingStatus(data); 
  });

    return () => {
    newSocket.disconnect();
    newSocket.off("online-users");
    newSocket.off("typing-status");
  };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, typingStatus }}>
      {children}
    </SocketContext.Provider>
  );
};



