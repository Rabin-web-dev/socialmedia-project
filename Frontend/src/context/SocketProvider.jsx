import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import IncomingCallModal from "../components/Model/IncomingCallModal";
import { SocketContext } from "./SocketContext";

const SocketProvider = ({ children, user }) => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingStatus, setTypingStatus] = useState({});
  const [notifications, setNotifications] = useState([]);

  const SOCKET_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  // ✅ Load stored notifications on refresh
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(stored);
  }, []);

  // ✅ Save notifications in localStorage
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // ✅ Add notification safely (avoid duplicates)
  const addNotification = useCallback((notif) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n._id === notif._id);
      return exists ? prev : [notif, ...prev];
    });
  }, []);

  // ✅ Initialize socket connection
  useEffect(() => {
    if (!user || !user._id) {
      console.log("⚠️ No user provided to SocketProvider");
      return;
    }

    console.log("🌐 Connecting Socket.IO for user:", user._id);

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      query: { userId: user._id },
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket Connected:", newSocket.id);
      newSocket.emit("join", user._id);
    });

    // ✅ Online Users
    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // ✅ Typing Status
    newSocket.on("typing-status", ({ from, typing }) => {
      setTypingStatus((prev) => ({
        ...prev,
        [from]: typing,
      }));
    });

    // ✅ Incoming Call
    newSocket.on("incomingCall", (data) => {
      setIncomingCall(data);
    });

    // ✅ Real-Time Notifications
    newSocket.on("newNotification", (notif) => {
      console.log("🔔 New Notification received:", notif);
      addNotification(notif);

      // 🟢 Show real-time toast
      toast.success(
        notif?.message ||
          `New notification from ${notif?.sender?.username || "someone"}`
      );
    });

    // ✅ Cleanup on unmount
    return () => {
      console.log("🔌 Disconnecting socket:", newSocket.id);
      newSocket.disconnect();
    };
  }, [user?._id, user, addNotification, SOCKET_URL]);

  // ✅ Accept Call
  const handleAcceptCall = () => {
    if (!incomingCall) return;

    const { callerId, callerName, callType, roomID } = incomingCall;

    navigate(`/call/${roomID}`, {
      state: {
        callType,
        roomID,
        isCaller: false,
        localUser: {
          _id: user._id,
          username: user.username,
        },
        friend: {
          _id: callerId,
          username: callerName,
        },
      },
    });

    setIncomingCall(null);
  };

  // ✅ Reject Call
  const handleRejectCall = () => {
    if (incomingCall && socket) {
      socket.emit("callRejected", { callerId: incomingCall.callerId });
    }
    setIncomingCall(null);
  };

  // ✅ Helper methods for emits
  const sendTypingStatus = (toUserId, typing) => {
    socket?.emit("typing-status", { to: toUserId, typing });
  };

  const sendCallInvite = (data) => {
    socket?.emit("sendCall", data);
  };

  const sendNotification = async (data) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send notification");
    } catch (error) {
      console.error("❌ Error sending notification:", error.message);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        typingStatus,
        notifications,
        setNotifications,
        addNotification,
        sendTypingStatus,
        sendCallInvite,
        sendNotification,
      }}
    >
      {children}

      {incomingCall && (
        <IncomingCallModal
          isOpen={!!incomingCall}
          callerName={incomingCall.callerName}
          callType={incomingCall.callType}
          onReject={handleRejectCall}
          onAccept={handleAcceptCall}
        />
      )}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
