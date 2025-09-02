// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { io } from "socket.io-client";
// import IncomingCallModal from "../components/Model/IncomingCallModal";
// import { SocketContext } from "./SocketContext";

// const SocketProvider = ({ children, user }) => {
//   const navigate = useNavigate();
//   const [socket, setSocket] = useState(null);
//   const [incomingCall, setIncomingCall] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [typingStatus, setTypingStatus] = useState({});

//   useEffect(() => {
//     if (!user || !user._id) {
//       console.log("⚠️ No user provided to SocketProvider");
//       return;
//     }

//     console.log("🌐 Connecting Socket.IO for user:", user._id);

//     const newSocket = io("http://localhost:5000", {
//       transports: ["websocket", "polling"],   // ✅ Ensures stable connection
//       query: { userId: user._id },
//       withCredentials: true,
//       reconnectionAttempts: 5,               // ✅ Retry if server restarts
//       reconnectionDelay: 1000,
//     });

//     setSocket(newSocket);

//     newSocket.on("connect", () => {
//       console.log("✅ Socket Connected:", newSocket.id);
//       newSocket.emit("join", user._id);
//       console.log("➡️ Join event sent with userId:", user._id);
//     });

//     // ✅ Online Users
//     newSocket.on("onlineUsers", (users) => {
//       console.log("📡 OnlineUsers:", users);
//       setOnlineUsers(users);
//     });

//     // ✅ Typing Status
//     newSocket.on("typing-status", ({ from, typing }) => {
//       setTypingStatus((prev) => ({
//         ...prev,
//         [from]: typing,
//       }));
//     });

//     // ✅ Incoming Call Handler
//     newSocket.on("incomingCall", (data) => {
//       console.log("📞 Incoming call received:", data);
//       setIncomingCall(data);
//     });

//     // ✅ Cleanup on unmount
//     return () => {
//       console.log("🔌 Disconnecting socket:", newSocket.id);
//       newSocket.disconnect();
//     };
//   }, [user?._id, user]); // ✅ Only reconnect when user ID changes

//   // ✅ Accept Call
//   const handleAcceptCall = () => {
//     if (!incomingCall) return;

//     const { callerId, callerName, callType, roomID } = incomingCall;
//     console.log("✅ Accepting call:", incomingCall);

//     navigate(`/call/${roomID}`, {
//       state: {
//         callType,
//         roomID,
//         isCaller: false,
//         localUser: {
//           _id: user._id,
//           username: user.username,
//         },
//         friend: {
//           _id: callerId,
//           username: callerName,
//         },
//       },
//     });

//     setIncomingCall(null);
//   };

//   // ✅ Reject Call
//   const handleRejectCall = () => {
//     if (incomingCall && socket) {
//       console.log("❌ Call Rejected:", incomingCall);
//       socket.emit("callRejected", { callerId: incomingCall.callerId });
//     }
//     setIncomingCall(null);
//   };

//   return (
//     <SocketContext.Provider value={{ socket, onlineUsers, typingStatus }}>
//       {children}

//       {incomingCall && (
//         <IncomingCallModal
//           isOpen={!!incomingCall}
//           callerName={incomingCall.callerName}
//           callType={incomingCall.callType}
//           onReject={handleRejectCall}
//           onAccept={handleAcceptCall}
//         />
//       )}
//     </SocketContext.Provider>
//   );
// };

// export default SocketProvider;


import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import IncomingCallModal from "../components/Model/IncomingCallModal";
import { SocketContext } from "./SocketContext";

const SocketProvider = ({ children, user }) => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingStatus, setTypingStatus] = useState({});
  const [notifications, setNotifications] = useState([]); // ✅ Store notifications

  // ✅ Add notification safely (no duplicates)
  const addNotification = useCallback((notif) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n._id === notif._id);
      return exists ? prev : [notif, ...prev];
    });
  }, []);

  useEffect(() => {
    if (!user || !user._id) {
      console.log("⚠️ No user provided to SocketProvider");
      return;
    }

    console.log("🌐 Connecting Socket.IO for user:", user._id);

    const newSocket = io("http://localhost:5000", {
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

    // ✅ 🔔 Real-Time Notifications
    newSocket.on("newNotification", (notif) => {
      console.log("🔔 New Notification received:", notif);
      addNotification(notif);
      // 👉 Optional: show toast popup here
    });

    return () => {
      console.log("🔌 Disconnecting socket:", newSocket.id);
      newSocket.disconnect();
    };
  }, [user?._id, user, addNotification]);

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

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        typingStatus,
        notifications,
        setNotifications,
        addNotification,
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
