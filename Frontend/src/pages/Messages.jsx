import { useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import api from "../utils/api";
import ChatHeader from "../components/Chat/ChatHeader";
import ChatBody from "../components/Chat/ChatBody";
import ChatInput from "../components/Chat/ChatInput";
import useSocketContext from "../hooks/useSocketContext";
import IncomingCallModal from "../components/Model/IncomingCallModal";

const Messages = () => {
  const auth = useSelector((state) => state.auth);
  const user = auth?.user;
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();
  const stateFriend = location.state?.friend;

  const { socket } = useSocketContext();

  const [friend, setFriend] = useState(stateFriend || null);
  const [messages, setMessages] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const messagesRef = useRef([]);
  const ringtoneRef = useRef(null);
  const callTimeoutRef = useRef(null);
  const token = localStorage.getItem("token");

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get(`/users/${user?.username}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriend(res.data?.user || res.data);
    } catch (err) {
      console.error("❌ Error fetching friend:", err);
    }
  }, [user?.username, userId, token]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://stark-socialmedia.onrender.com/api/messages/conversation/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const msgs = Array.isArray(res.data.messages) ? res.data.messages : [];
      setMessages(msgs);
      messagesRef.current = msgs;
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      setMessages([]);
    }
  }, [userId, token]);

  useEffect(() => {
    if (socket && user?._id) {
      socket.emit("join", user._id);
    }
  }, [socket, user?._id]);

  useEffect(() => {
    if (!stateFriend && userId) {
      fetchUser();
    } else {
      setFriend(stateFriend);
    }
  }, [fetchUser, userId, stateFriend]);

  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId, fetchMessages]);

  useEffect(() => {
    if (!socket || !friend) return;

    const handleReceiveMessage = (msg) => {
      const isCurrentChat =
        String(msg.sender) === String(friend._id) ||
        String(msg.receiver) === String(friend._id);

      const exists = messagesRef.current.some((m) => m._id === msg._id);
      if (isCurrentChat && !exists) {
        const updated = [...messagesRef.current, msg];
        messagesRef.current = updated;
        setMessages(updated);
      }

      if (String(msg.receiver) === String(user._id)) {
        socket.emit("messageSeen", {
          messageId: msg._id,
          receiverId: msg.sender,
        });
      }
    };

    const handleDelivered = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, delivered: true } : msg
        )
      );
    };

    const handleSeen = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, seen: true } : msg
        )
      );
    };

    const handleIncomingCall = ({ callerId, callerName, callType }) => {
      setIncomingCall({ callerId, callerName, callType });

      if (ringtoneRef.current) {
        ringtoneRef.current.play().catch((err) => {
          console.warn("🔇 Autoplay prevented:", err);
        });
      }

      callTimeoutRef.current = setTimeout(() => {
        setIncomingCall(null);
        if (ringtoneRef.current) ringtoneRef.current.pause();
        socket.emit("callRejected", { callerId });
      }, 30000);
    };

    socket.on("incomingCall", handleIncomingCall);
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageDelivered", handleDelivered);
    socket.on("messageSeen", handleSeen);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageDelivered", handleDelivered);
      socket.off("messageSeen", handleSeen);
      socket.off("incomingCall", handleIncomingCall);
    };
  }, [socket, friend, user._id]);

  if (!user || !friend)
    return <div className="p-4 text-gray-500">Loading chat...</div>;

  if (!Array.isArray(messages))
    return <div className="p-4 text-red-500">Error loading messages</div>;

  return (
    <div className="flex flex-col w-full h-full bg-[#f0f2f6] overflow-hidden">
      {/* ✅ Chat Header */}
      <div className="flex-shrink-0">
        <ChatHeader selectedUser={friend} localUser={user} />
      </div>

      {/* ✅ Chat Body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <ChatBody
          messages={messages}
          currentUserId={user._id}
          selectedUser={friend}
        />
      </div>

      {/* ✅ Chat Input */}
      <div className="flex-shrink-0 pb-14 md:pb-4">
        <ChatInput
          currentUserId={user._id}
          selectedUserId={friend._id}
          selectedUser={friend}
          messages={messages}
          setMessages={setMessages}
        />
      </div>

      {/* ✅ Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          callerName={incomingCall.callerName}
          callType={incomingCall.callType}
          onAccept={() => {
            setIncomingCall(null);
            if (ringtoneRef.current) ringtoneRef.current.pause();
            clearTimeout(callTimeoutRef.current);

            navigate("/zego-call", {
              state: {
                isInitiator: false,
                callType: incomingCall.callType,
                user: {
                  _id: user._id,
                  username: user.username,
                },
                friend: {
                  _id: incomingCall.callerId,
                  username: incomingCall.callerName,
                },
              },
            });
          }}
          onReject={() => {
            if (ringtoneRef.current) ringtoneRef.current.pause();
            clearTimeout(callTimeoutRef.current);
            socket.emit("callRejected", { callerId: incomingCall.callerId });
            setIncomingCall(null);
          }}
        />
      )}

      <audio ref={ringtoneRef} src="/sounds/ringtone.mp3" loop hidden />
    </div>
  );
};

export default Messages;
